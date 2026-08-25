import { Vector2 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

/**
 * Signal grade, not film grade.
 *
 * The brief swapped the vocabulary: you are looking at a screen's output, not
 * at a strip of celluloid. So the vignette became edge chromatic aberration
 * and the film grain became scanlines.
 *
 * The one thing kept from the film version is a very small per-frame dither.
 * It is not there for texture - a near-black ground bands into visible steps
 * without it, and 8-bit output has no way to represent the gradient otherwise.
 */
const SignalShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uScan: { value: 0.05 },
    uAberration: { value: 0.42 },
    uDither: { value: 0.016 },
    uResolution: { value: new Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision mediump float;

    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uScan;
    uniform float uAberration;
    uniform float uDither;
    uniform vec2 uResolution;

    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 centred = vUv - 0.5;
      float d = dot(centred, centred);

      // Radial channel separation: zero in the middle, growing toward the
      // corners. This replaces the vignette - it darkens the edges as a side
      // effect of the split, without painting a grey ring over the picture.
      vec2 shift = centred * d * uAberration * 0.03;
      vec4 colour;
      colour.r = texture2D(tDiffuse, vUv + shift).r;
      colour.g = texture2D(tDiffuse, vUv).g;
      colour.b = texture2D(tDiffuse, vUv - shift).b;
      colour.a = 1.0;

      // Scanlines, locked to device pixels so they never crawl or moire when
      // the page is zoomed. Half a line of modulation, no more.
      float line = 0.5 + 0.5 * cos(vUv.y * uResolution.y * 3.14159265);
      colour.rgb *= 1.0 - uScan * line;

      // Re-randomised every frame: static noise reads as a dirty screen.
      colour.rgb += (hash(vUv * uResolution + fract(uTime) * 431.0) - 0.5) * uDither;

      gl_FragColor = colour;
    }
  `,
}

export function createPost({ renderer, scene, camera, palette, quality, size }) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  let bloom = null
  if (quality.bloom) {
    // Threshold near 1.0: only the particles authored above 1.0 bloom.
    // Full-frame bloom is the amateur tell.
    bloom = new UnrealBloomPass(new Vector2(size.width, size.height), palette.bloom, 0.55, 0.92)
    composer.addPass(bloom)
  }

  composer.addPass(new OutputPass())

  const signal = new ShaderPass(SignalShader)
  signal.uniforms.uScan.value = palette.scan
  signal.uniforms.uAberration.value = palette.aberration
  signal.uniforms.uDither.value = palette.dither
  signal.uniforms.uResolution.value.set(size.width, size.height)
  signal.renderToScreen = true
  composer.addPass(signal)

  return {
    render() {
      composer.render()
    },
    setTime(t) {
      signal.uniforms.uTime.value = t
    },
    /** Bloom breathes with the story: brightest where the most lanes fire. */
    setBloom(strength) {
      if (bloom) bloom.strength = strength
    },
    setSize(width, height) {
      composer.setSize(width, height)
      bloom?.resolution.set(width, height)
      signal.uniforms.uResolution.value.set(width, height)
    },
    dispose() {
      composer.dispose()
    },
  }
}
