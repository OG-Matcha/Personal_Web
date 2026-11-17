// The stage: four devices, built from primitives, whose screens show the real
// products - screenshots, the company's live site, recordings of the
// open-source tools. The page drives everything through each device's
// `state`; a GSAP timeline scrubbed by scroll writes to it, and this file only
// draws what the states say.
//
// Positions are in screen terms (fractions of the frame), and each device is
// fitted to a share of the frame, so a 4K monitor and a phone get the same
// composition instead of the same world units.
//
// Loaded on the client after first paint, by ProductLine.vue.

import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector4,
  VideoTexture,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* ------------------------------------------------------------------------ */
/* Geometry                                                                  */
/* ------------------------------------------------------------------------ */

function roundedRect(w, h, r) {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  return s
}

/** A flat rounded rectangle with 0..1 UVs. */
function flat(w, h, r) {
  const g = new ShapeGeometry(roundedRect(w, h, r), 24)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5)
  return g
}

/** A rounded slab, centred, extruded along z, with soft machined edges. */
function slab(w, h, r, depth, bevel = 0.012) {
  const g = new ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, Math.max(r - bevel, 0.002)), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 28,
  })
  g.translate(0, 0, -depth / 2)
  return g
}

/* ------------------------------------------------------------------------ */
/* Screens                                                                   */
/* ------------------------------------------------------------------------ */

// Two sources and a cross-fade between them, plus the faint band of reflected
// light that slides across real glass as the device turns.
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const FRAG = /* glsl */ `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform vec4 uCropA;
  uniform vec4 uCropB;
  uniform float uMix;
  uniform float uSheen;
  uniform float uDim;
  uniform vec3 uBgA;
  uniform vec3 uBgB;
  varying vec2 vUv;
  // Outside 0..1 is the letterbox of a source shown whole (fit: contain).
  vec3 pick(sampler2D t, vec2 uv, vec3 bg) {
    vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    return mix(bg, texture2D(t, clamp(uv, 0.0, 1.0)).rgb, inside.x * inside.y);
  }
  void main() {
    vec3 a = pick(uA, vUv * uCropA.xy + uCropA.zw, uBgA);
    vec3 b = pick(uB, vUv * uCropB.xy + uCropB.zw, uBgB);
    vec3 col = mix(a, b, smoothstep(0.0, 1.0, uMix));
    float band = exp(-pow((vUv.x + vUv.y * 0.6 - uSheen) * 4.0, 2.0));
    col = col * uDim + band * 0.07;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/** object-fit: cover, anchored at the top; or contain, centred. */
function cover(w, h, aspect, fit = 'cover') {
  const ia = w / h
  if (fit === 'contain') {
    // Scale > 1 reaches past the texture; the shader paints that as letterbox.
    if (ia > aspect) {
      const k = ia / aspect
      return new Vector4(1, k, 0, (1 - k) / 2)
    }
    const k = aspect / ia
    return new Vector4(k, 1, (1 - k) / 2, 0)
  }
  if (ia > aspect) return new Vector4(aspect / ia, 1, (1 - aspect / ia) / 2, 0)
  return new Vector4(1, ia / aspect, 0, 1 - ia / aspect)
}

const loader = new TextureLoader()

/**
 * A screen fed by a list of sources: an image URL, { video: url }, or a
 * canvas the page drew. `state.screen` picks (and blends) between them.
 */
function makeScreen(sources, w, h, r, renderer, onReady) {
  const aspect = w / h
  const blank = new CanvasTexture(document.createElement('canvas'))
  const crops = sources.map(() => new Vector4(1, 1, 0, 0))
  const bgs = sources.map((s) => new Color(s?.bg ?? '#000000'))
  const videos = []
  const textures = sources.map((src, i) => {
    let t
    if (typeof src === 'string') {
      t = loader.load(src, (tex) => {
        crops[i] = cover(tex.image.width, tex.image.height, aspect)
        onReady()
      })
    } else if (src && src.video) {
      const v = document.createElement('video')
      Object.assign(v, { src: src.video, muted: true, loop: true, playsInline: true, preload: 'auto', crossOrigin: 'anonymous' })
      v.setAttribute('muted', '')
      v.setAttribute('playsinline', '')
      v.addEventListener('loadedmetadata', () => {
        crops[i] = cover(v.videoWidth, v.videoHeight, aspect, src.fit)
        onReady()
      })
      videos.push({ i, v })
      t = new VideoTexture(v)
    } else {
      t = new CanvasTexture(src)
      crops[i] = cover(src.width, src.height, aspect)
    }
    t.colorSpace = SRGBColorSpace
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return t
  })
  const mat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uA: { value: textures[0] ?? blank },
      uB: { value: textures[0] ?? blank },
      uCropA: { value: crops[0] },
      uCropB: { value: crops[0] },
      uMix: { value: 0 },
      uSheen: { value: 0.4 },
      uDim: { value: 1 },
      uBgA: { value: bgs[0] },
      uBgB: { value: bgs[0] },
    },
  })
  const mesh = new Mesh(flat(w, h, r), mat)
  return {
    mesh,
    textures,
    /** Point the shader at screen `s` (fractional), play only what shows. */
    show(s, sheen, on) {
      const n = textures.length
      const c = Math.max(0, Math.min(s, n - 1))
      const i = Math.min(Math.floor(c), Math.max(n - 2, 0))
      const u = mat.uniforms
      u.uA.value = textures[i] ?? blank
      u.uB.value = textures[i + 1] ?? textures[i] ?? blank
      u.uCropA.value = crops[i]
      u.uCropB.value = crops[i + 1] ?? crops[i]
      u.uBgA.value = bgs[i] ?? bgs[0]
      u.uBgB.value = bgs[i + 1] ?? bgs[i] ?? bgs[0]
      u.uMix.value = n > 1 ? c - i : 0
      u.uSheen.value = sheen
      u.uDim.value = on ? 1 : 0.08
      for (const { i: k, v } of videos) {
        const visible = on && (k === i || k === i + 1) && Math.abs(c - k) < 1
        if (visible && v.paused) v.play().catch(() => {})
        else if (!visible && !v.paused) v.pause()
      }
    },
    pauseAll() {
      for (const { v } of videos) v.pause()
    },
  }
}

/* ------------------------------------------------------------------------ */
/* Devices                                                                   */
/* ------------------------------------------------------------------------ */

function materials() {
  return {
    metal: new MeshPhysicalMaterial({ metalness: 1, roughness: 0.3, clearcoat: 0.25 }),
    alu: new MeshPhysicalMaterial({ metalness: 0.9, roughness: 0.42 }),
    back: new MeshPhysicalMaterial({ roughness: 0.4, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.15 }),
    black: new MeshPhysicalMaterial({ color: '#050506', roughness: 0.08, clearcoat: 1 }),
    lens: new MeshPhysicalMaterial({ color: '#0b0c10', roughness: 0.05, metalness: 0.2, clearcoat: 1 }),
    key: new MeshPhysicalMaterial({ color: '#16161a', roughness: 0.6 }),
  }
}

const FINISH = {
  light: { metal: '#cbc5bb', alu: '#d6d6d9', back: '#dbd5cb' },
  dark: { metal: '#4b4b51', alu: '#5a5b61', back: '#2d2d32' },
}

function phone(M, screens, ctx) {
  const W = 0.74
  const H = 1.52
  const D = 0.08
  const g = new Group()
  g.add(new Mesh(slab(W, H, 0.115, D), M.metal))
  const front = new Mesh(flat(W - 0.016, H - 0.016, 0.107), M.black)
  front.position.z = D / 2 + 0.0125
  const back = new Mesh(flat(W - 0.02, H - 0.02, 0.105), M.back)
  back.position.z = -(D / 2 + 0.0125)
  back.rotation.y = Math.PI
  g.add(front, back)

  const bump = new Mesh(slab(0.32, 0.32, 0.075, 0.02, 0.008), M.back)
  bump.position.set(-W / 2 + 0.2, H / 2 - 0.2, -(D / 2 + 0.03))
  g.add(bump)
  const lensGeo = new CylinderGeometry(0.058, 0.058, 0.026, 40)
  const ringGeo = new CylinderGeometry(0.066, 0.066, 0.02, 40)
  for (const [dx, dy] of [
    [-0.065, 0.065],
    [-0.065, -0.065],
    [0.07, 0],
  ]) {
    const ring = new Mesh(ringGeo, M.metal)
    ring.rotation.x = Math.PI / 2
    ring.position.set(bump.position.x + dx, bump.position.y + dy, bump.position.z - 0.02)
    const lens = new Mesh(lensGeo, M.lens)
    lens.rotation.x = Math.PI / 2
    lens.position.set(ring.position.x, ring.position.y, ring.position.z - 0.006)
    g.add(ring, lens)
  }
  const btn = slab(0.02, 0.16, 0.009, 0.03, 0.004)
  for (const [x, y, len] of [
    [W / 2 + 0.006, 0.3, 0.16],
    [-W / 2 - 0.006, 0.36, 0.08],
    [-W / 2 - 0.006, 0.2, 0.12],
  ]) {
    const b = new Mesh(btn, M.metal)
    b.scale.y = len / 0.16
    b.rotation.y = Math.PI / 2
    b.position.set(x, y, 0)
    g.add(b)
  }
  const scr = makeScreen(screens, 0.69, 1.47, 0.098, ctx.renderer, ctx.dirty)
  scr.mesh.position.z = D / 2 + 0.0135
  g.add(scr.mesh)
  const island = new Mesh(flat(0.19, 0.056, 0.028), new MeshBasicMaterial({ color: '#000' }))
  island.position.set(0, 1.47 / 2 - 0.058, D / 2 + 0.0145)
  g.add(island)
  return { group: g, screen: scr, size: [W, H], share: 0.3, facing: (ry) => Math.cos(ry) > -0.05 }
}

function tablet(M, screens, ctx) {
  const W = 2.0
  const H = 1.44
  const D = 0.05
  const g = new Group()
  g.add(new Mesh(slab(W, H, 0.1, D, 0.01), M.metal))
  const front = new Mesh(flat(W - 0.014, H - 0.014, 0.094), M.black)
  front.position.z = D / 2 + 0.0105
  const back = new Mesh(flat(W - 0.02, H - 0.02, 0.09), M.back)
  back.position.z = -(D / 2 + 0.0105)
  back.rotation.y = Math.PI
  g.add(front, back)
  const lens = new Mesh(new CylinderGeometry(0.05, 0.05, 0.02, 32), M.lens)
  lens.rotation.x = Math.PI / 2
  lens.position.set(-W / 2 + 0.14, H / 2 - 0.14, -(D / 2 + 0.02))
  g.add(lens)
  const scr = makeScreen(screens, W - 0.13, H - 0.13, 0.05, ctx.renderer, ctx.dirty)
  scr.mesh.position.z = D / 2 + 0.0115
  g.add(scr.mesh)
  return { group: g, screen: scr, size: [W, H], share: 0.44, facing: (ry) => Math.cos(ry) > -0.05 }
}

function laptop(M, screens, ctx, keyTex) {
  const W = 2.3
  const DZ = 1.55
  const T = 0.07
  const LH = 1.5
  const g = new Group()
  // The base lies flat; the whole laptop is tipped toward the camera so the
  // keyboard reads.
  const base = new Mesh(slab(W, DZ, 0.09, T, 0.02), M.alu)
  base.rotation.x = -Math.PI / 2
  base.position.y = -0.62
  g.add(base)
  const keys = new Mesh(new PlaneGeometry(W * 0.86, DZ * 0.4), new MeshBasicMaterial({ map: keyTex, transparent: true }))
  keys.rotation.x = -Math.PI / 2
  keys.position.set(0, -0.62 + T / 2 + 0.022, -0.18)
  g.add(keys)
  const pad = new Mesh(flat(0.82, 0.5, 0.05), new MeshPhysicalMaterial({ color: '#000', transparent: true, opacity: 0.08, roughness: 0.3 }))
  pad.rotation.x = -Math.PI / 2
  pad.position.set(0, -0.62 + T / 2 + 0.022, 0.42)
  g.add(pad)

  const hinge = new Group()
  hinge.position.set(0, -0.62 + T / 2 + 0.02, -DZ / 2 + 0.03)
  const lid = new Group()
  lid.add(new Mesh(slab(W, LH, 0.08, 0.045, 0.012), M.alu))
  const glass = new Mesh(flat(W - 0.02, LH - 0.02, 0.07), M.black)
  glass.position.z = 0.0355 // slab face: depth/2 + bevel
  lid.add(glass)
  const scr = makeScreen(screens, W - 0.12, LH - 0.14, 0.03, ctx.renderer, ctx.dirty)
  scr.mesh.position.set(0, 0.015, 0.0365)
  lid.add(scr.mesh)
  lid.position.y = LH / 2
  hinge.add(lid)
  g.add(hinge)
  return {
    group: g,
    screen: scr,
    size: [W, 1.62],
    share: 0.46,
    facing: (ry) => Math.cos(ry) > -0.05,
    setOpen(o) {
      // Closed: the lid lies on the base, screen down. Open: tipped back.
      hinge.rotation.x = Math.PI / 2 - o * (Math.PI / 2 + 0.14)
    },
  }
}

function monitor(M, screens, ctx) {
  const W = 2.7
  const H = 1.56
  const g = new Group()
  const panel = new Group()
  panel.position.y = 0.26
  panel.add(new Mesh(slab(W, H, 0.05, 0.05, 0.01), M.alu))
  const glass = new Mesh(flat(W - 0.016, H - 0.016, 0.044), M.black)
  glass.position.z = 0.0355 // slab face: depth/2 + bevel
  panel.add(glass)
  const scr = makeScreen(screens, W - 0.1, H - 0.1, 0.02, ctx.renderer, ctx.dirty)
  scr.mesh.position.z = 0.0365
  panel.add(scr.mesh)
  g.add(panel)
  const arm = new Mesh(slab(0.5, 1.0, 0.04, 0.05, 0.01), M.alu)
  arm.position.set(0, -0.42, -0.18)
  arm.rotation.x = -0.14
  const foot = new Mesh(slab(0.82, 0.6, 0.06, 0.045, 0.012), M.alu)
  foot.rotation.x = -Math.PI / 2
  foot.position.set(0, -0.92, -0.1)
  g.add(arm, foot)
  return { group: g, screen: scr, size: [W, 2.1], share: 0.46, facing: (ry) => Math.cos(ry) > -0.05 }
}

function keyboardTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 300
  const g = c.getContext('2d')
  const rows = [14, 14, 13, 12, 11]
  rows.forEach((n, r) => {
    const kw = 1024 / 14.4
    const y = 8 + r * 58
    let x = (1024 - n * kw) / 2
    for (let k = 0; k < n; k++) {
      g.fillStyle = '#1a1a1f'
      g.beginPath()
      g.roundRect(x + 3, y, kw - 6, 50, 7)
      g.fill()
      x += kw
    }
  })
  g.fillStyle = '#1a1a1f'
  g.beginPath()
  g.roundRect(330, 8 + 4 * 58, 360, 50, 7)
  g.fill()
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

function shadowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grd.addColorStop(0, 'rgba(0,0,0,0.5)')
  grd.addColorStop(0.55, 'rgba(0,0,0,0.14)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  return new CanvasTexture(c)
}

/* ------------------------------------------------------------------------ */
/* Stage                                                                     */
/* ------------------------------------------------------------------------ */

const BUILD = { phone, tablet, laptop, monitor }

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ devices: Record<string, any[]>, dark?: boolean, onLost?: () => void }} o
 *   devices: { phone: [sources], laptop: [...], ... }
 */
export function createStage(canvas, o) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture
  scene.environment = env
  pmrem.dispose()
  const key = new DirectionalLight('#ffffff', 0.6)
  key.position.set(-3, 4, 5)
  scene.add(key)

  const camera = new PerspectiveCamera(24, 1, 0.1, 60)
  camera.position.set(0, 0, 8)

  let dirty = true
  const ctx = { renderer, dirty: () => (dirty = true) }
  const M = materials()
  const keyTex = keyboardTexture()
  const shadowTex = shadowTexture()

  const devices = {}
  for (const [name, sources] of Object.entries(o.devices)) {
    const d = BUILD[name](M, sources, ctx, keyTex)
    d.state = { x: 2, y: 0, dy: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, spin: 0, scale: 1, screen: 0, open: 1, float: 1 }
    const sh = new Mesh(
      new PlaneGeometry(1, 0.3),
      new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.32 })
    )
    sh.rotation.x = -Math.PI / 2
    d.shadow = sh
    scene.add(d.group, sh)
    devices[name] = d
  }

  function setDark(dk) {
    const f = dk ? FINISH.dark : FINISH.light
    M.metal.color = new Color(f.metal)
    M.alu.color = new Color(f.alu)
    M.back.color = new Color(f.back)
    for (const d of Object.values(devices)) d.shadow.material.opacity = dk ? 0.7 : 0.32
    dirty = true
  }
  setDark(!!o.dark)

  let narrow = false
  function resize() {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    narrow = w / h < 0.8
    camera.updateProjectionMatrix()
    dirty = true
  }
  resize()

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let raf = 0
  const t0 = performance.now()

  function frame(now) {
    raf = requestAnimationFrame(frame)
    const t = (now - t0) / 1000
    const dist = camera.position.z
    const visH0 = 2 * dist * Math.tan((camera.fov * Math.PI) / 360)
    const visW0 = visH0 * camera.aspect

    for (const [name, d] of Object.entries(devices)) {
      const s = d.state
      // Off stage: skip the work entirely.
      const off = Math.abs(s.x) > 1.2 || Math.abs(s.y + s.dy) > 1.2 || s.scale <= 0.001
      d.group.visible = !off
      d.shadow.visible = !off
      if (off) {
        d.screen.pauseAll()
        continue
      }
      // Fit: the device's full size, at scale 1, is `share` of the frame's
      // width or 70 % of its height, whichever is tighter. On a phone it
      // may take more of the width.
      const share = narrow ? Math.min(d.share * 2, 0.86) : d.share
      const fit = Math.min((share * visW0) / d.size[0], (0.7 * visH0) / d.size[1])
      // Depth: the plane at z is nearer, so the same fraction means a
      // proportionally different world offset.
      const k = (dist - s.z) / dist
      const bob = reduced ? 0 : Math.sin(t * 1.1 + name.length) * 0.012 * s.float
      const sc = fit * s.scale
      d.group.scale.setScalar(sc)
      d.group.position.set(s.x * visW0 * k, (s.y + s.dy + bob) * visH0 * k, s.z)
      const ry = s.rotY + s.spin
      d.group.rotation.set(s.rotX, ry, s.rotZ)
      d.setOpen?.(s.open)
      d.screen.show(s.screen, 0.7 - ry * 0.9, d.facing(ry) && (d.setOpen ? s.open > 0.35 : true))
      d.shadow.position.set(d.group.position.x, d.group.position.y - (d.size[1] / 2 + 0.06) * sc, s.z)
      d.shadow.scale.set(d.size[0] * sc * 1.15, 1, d.size[0] * sc * 1.15)
    }
    renderer.render(scene, camera)
    dirty = false
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()
    stop()
    o.onLost?.()
  })

  function start() {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
    for (const d of Object.values(devices)) d.screen.pauseAll()
  }
  start()

  return {
    devices,
    states: Object.fromEntries(Object.entries(devices).map(([k, d]) => [k, d.state])),
    setDark,
    resize,
    start,
    stop,
    dispose() {
      stop()
      env.dispose()
      scene.traverse((m) => {
        m.geometry?.dispose()
        if (m.material) {
          for (const k of ['map']) m.material[k]?.dispose?.()
          m.material.uniforms?.uA?.value?.dispose?.()
          m.material.dispose()
        }
      })
      for (const d of Object.values(devices)) d.screen.textures.forEach((t) => t.dispose())
      renderer.dispose()
    },
  }
}
