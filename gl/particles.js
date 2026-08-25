import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three'
import { buildField } from './field.js'

/**
 * One particle system for the whole film. Nothing else is ever added to the
 * scene: no planes, no lines, no geometry. If it is on screen, it is a dot.
 *
 * A particle has two homes - its place in the flow field, and (for the ones
 * recruited into a mosaic) a place in a screenshot. `uMorph` blends between
 * them per mosaic, which is how a case study assembles out of the drift and
 * then dissolves back into it.
 */

const VERT = /* glsl */ `
  attribute vec3 aFlow;
  attribute vec3 aMosaic;
  attribute vec3 aTint;
  attribute float aInMosaic;   // 1 = part of the picture currently loaded
  attribute float aFlowAmt;    // 1 = dust, drifts downstream; 0 = pinned
  attribute float aSize;
  attribute float aHot;
  attribute float aSeed;

  uniform float uMorph;
  uniform float uTime;
  uniform float uTurbulence;
  uniform float uScale;
  uniform float uFlowSpeed;
  uniform float uWrap;
  uniform float uFieldDim;
  uniform float uFarFade;
  uniform vec3 uHoverPos;
  uniform float uHoverAmt;

  varying float vHot;
  varying float vDepthFade;
  varying float vTwinkle;
  varying float vMorph;
  varying vec3 vTint;
  varying float vHover;

  void main() {
    // Only one picture is ever assembled at a time, so there is one weight and
    // one target buffer. The four-slot version split the dust pool four ways
    // and every picture came out too sparse to read.
    float m = uMorph * aInMosaic;

    vec3 home = aFlow;

    // Downstream drift. Only dust moves; nodes and the baseline are pinned,
    // because an event does not slide around in time. The wrap is offset per
    // particle by aSeed so the reset never happens to a whole group at once.
    home.z -= mod(uTime * uFlowSpeed + aSeed * uWrap, uWrap) * aFlowAmt;

    // Per-particle breathing, phase-offset so the field never pulses in unison.
    float t = uTime * 0.22 + aSeed * 6.2831853;
    home += vec3(sin(t * 1.3), cos(t * 1.07), sin(t * 0.71)) * (0.06 + uTurbulence * 0.28);

    // How much this particle belongs to the knot the cursor is over. Measured
    // against the pinned home position, which for a node is its real place in
    // the timeline - nodes do not drift, so this stays stable while hovering.
    vHover = uHoverAmt * (1.0 - smoothstep(0.0, 0.85, distance(aFlow, uHoverPos)));

    vec3 pose = mix(home, aMosaic, m);

    vec4 mv = modelViewMatrix * vec4(pose, 1.0);
    float dist = max(-mv.z, 0.001);

    gl_Position = projectionMatrix * mv;

    // Points shrink with distance, so the closing reveal needs them to hold a
    // little size at range or the whole timeline reads as noise, not a field.
    float reach = 1.0 + smoothstep(60.0, 130.0, dist) * (uFarFade / 58.0 - 1.0) * 1.6;
    // Assembled particles grow a little: a screenshot has to hold together as
    // an image, and at rest the dots would be too sparse to read.
    gl_PointSize = aSize * uScale * mix(1.0, 1.15, m) * (1.0 + vHover * 1.1) * reach * (16.0 / dist);

    // Manual fog at both ends: far particles fade into the ground, near ones
    // fade before they smear across the lens as the camera passes through.
    //
    // The far edge is a uniform because the closing shot needs it opened up:
    // the camera climbs and turns to look back down all four years, and at a
    // fixed 58 units the thing it turns to look at is already invisible.
    vDepthFade = smoothstep(uFarFade, 9.0, dist) * smoothstep(0.4, 2.8, dist);

    vHot = aHot;
    vTwinkle = 0.74 + 0.26 * sin(uTime * 1.6 + aSeed * 20.0);
    vMorph = m;
    // Everything that is not part of the assembling picture recedes.
    vDepthFade *= mix(1.0, 0.3, uFieldDim * (1.0 - m));

    // A screenshot's ink is dark, and dark dots on a near-black ground are
    // invisible. Keep the hue, push the value up to the scene's range.
    vec3 tint = aTint;
    float mx = max(max(tint.r, tint.g), max(tint.b, 0.08));
    vTint = tint / mx;
  }
`

const FRAG = /* glsl */ `
  precision mediump float;

  uniform vec3 uCold;
  uniform vec3 uHot;
  uniform float uAlpha;

  varying float vHot;
  varying float vDepthFade;
  varying float vTwinkle;
  varying float vMorph;
  varying vec3 vTint;
  varying float vHover;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float sprite = smoothstep(0.5, 0.06, d);
    if (sprite <= 0.001) discard;

    // Hot cores are authored above 1.0 so the bloom threshold picks out the
    // wins instead of blooming the whole frame.
    vec3 base = mix(uCold, uHot * 1.9, vHot);

    // A zero tint means "this cloud has no colours of its own" - type, not a
    // screenshot - so it relights with the theme like everything else.
    float hasTint = step(0.004, vTint.r + vTint.g + vTint.b);
    vec3 colour = mix(base, vTint, vMorph * hasTint);

    // Assembled particles are opaque: a picture made of 20%-alpha dots is
    // a smudge, however many of them there are.
    // The hovered knot lifts out of the field rather than being outlined:
    // an outline needs geometry, and this scene has none.
    colour += uHot * vHover * 0.9;

    float alpha = sprite * vDepthFade * uAlpha * mix(1.0, vTwinkle, vHot);
    alpha = mix(alpha, sprite * vDepthFade, vMorph * 0.85);
    gl_FragColor = vec4(colour, min(1.0, alpha * (1.0 + vHover)));
  }
`

/** How far a dust particle travels downstream before it wraps. */
const WRAP = 46

export function createParticles({ count, nodes, lanes, zSpan, palette, poolSize }) {
  const field = buildField({ count, nodes, lanes, zSpan })

  const mosaic = new Float32Array(count * 3)
  const tint = new Float32Array(count * 3)
  const inMosaic = new Float32Array(count)

  const geometry = new BufferGeometry()
  // `position` is never read by the shader - the pose comes from aFlow - but
  // three needs it present, and it keeps the initial bounds sane.
  geometry.setAttribute('position', new BufferAttribute(field.flow.slice(), 3))
  geometry.setAttribute('aFlow', new BufferAttribute(field.flow, 3))
  geometry.setAttribute('aMosaic', new BufferAttribute(mosaic, 3))
  geometry.setAttribute('aTint', new BufferAttribute(tint, 3))
  geometry.setAttribute('aInMosaic', new BufferAttribute(inMosaic, 1))
  geometry.setAttribute('aFlowAmt', new BufferAttribute(field.flowAmt, 1))
  geometry.setAttribute('aSize', new BufferAttribute(field.size, 1))
  geometry.setAttribute('aHot', new BufferAttribute(field.hot, 1))
  geometry.setAttribute('aSeed', new BufferAttribute(field.seed, 1))
  // The camera flies through the field, so culling on a static bounding
  // sphere would pop the entire system out of view.
  geometry.boundingSphere = null

  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    // Additive: the film is shot in a dark room, so the particles build light.
    blending: AdditiveBlending,
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uTurbulence: { value: 0 },
      uScale: { value: 1 },
      uFlowSpeed: { value: 1.1 },
      uWrap: { value: WRAP },
      uFieldDim: { value: 0 },
      uFarFade: { value: 58 },
      uHoverPos: { value: new Vector3(0, 0, 9999) },
      uHoverAmt: { value: 0 },
      uCold: { value: palette.cold.clone() },
      uHot: { value: palette.hot.clone() },
      uAlpha: { value: palette.particleAlpha },
    },
  })

  const points = new Points(geometry, material)
  points.frustumCulled = false

  /**
   * The dust that can be recruited into a picture. Always the same particles,
   * always the same order: the mosaic is rewritten in place when the camera
   * approaches the next one, so a stable pool means the swap only touches
   * buffers and never re-decides who takes part.
   */
  const pool = field.dust.subarray(0, Math.min(poolSize, field.dust.length))

  return {
    object: points,

    /** How many particles a single picture can use. */
    poolSize: pool.length,

    /**
     * Load one picture into the pool, replacing whatever was there.
     *
     * Called when the lens is far enough from both the outgoing and incoming
     * pictures that nothing is assembled - otherwise particles would teleport
     * mid-frame. `gl/world.js` owns that timing.
     */
    loadMosaic(sample, { x, y, z, scale }) {
      const want = Math.min(sample.count, pool.length)

      // `scale` is the width of the finished picture, whatever its shape.
      // Multiplying the raw uv by it instead would make a wide wordmark four
      // times wider than a screenshot for the same nominal size.
      const s = scale / Math.max(1, sample.aspect)

      for (let k = 0; k < pool.length; k++) {
        const p = pool[k]
        const j = p * 3
        if (k < want) {
          mosaic[j] = x + sample.pos[k * 2] * s
          mosaic[j + 1] = y + sample.pos[k * 2 + 1] * s
          mosaic[j + 2] = z
          tint[j] = sample.rgb[k * 3]
          tint[j + 1] = sample.rgb[k * 3 + 1]
          tint[j + 2] = sample.rgb[k * 3 + 2]
          inMosaic[p] = 1
        } else {
          // This picture had fewer usable cells than the pool has particles.
          // The surplus stays in the flow rather than piling up on a duplicate
          // coordinate, which would read as a bright smear over the image.
          inMosaic[p] = 0
        }
      }

      geometry.attributes.aMosaic.needsUpdate = true
      geometry.attributes.aTint.needsUpdate = true
      geometry.attributes.aInMosaic.needsUpdate = true
      return want
    },

    setMorph(v) {
      material.uniforms.uMorph.value = v
    },
    setFieldDim(v) {
      material.uniforms.uFieldDim.value = v
    },
    setFarFade(v) {
      material.uniforms.uFarFade.value = v
    },
    setHover(node) {
      if (node) material.uniforms.uHoverPos.value.set(node.x, node.y, node.z)
      material.uniforms.uHoverAmt.value = node ? 1 : 0
    },
    setTurbulence(v) {
      material.uniforms.uTurbulence.value = v
    },
    setTime(t) {
      material.uniforms.uTime.value = t
    },
    setScale(dpr) {
      material.uniforms.uScale.value = dpr
    },

    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
