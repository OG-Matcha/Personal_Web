import { MathUtils, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import { readPalette } from './palette.js'
import { createParticles } from './particles.js'
import { createPost } from './post.js'
import { sampleImage, sampleText } from './mosaic.js'

/**
 * The film. Everything below is a pure function of one scroll scalar, so any
 * position - reached by wheel, keyboard, deep link, or scrolling backwards -
 * produces exactly the same frame.
 *
 * The camera path itself is not here: it comes from `composables/useFilm.ts`,
 * derived from the dates in `content/timeline.yml`. This file only plays it.
 */

/**
 * `mosaic` is the size of the shared pool, not a per-picture allowance: only
 * one picture is assembled at a time, so one picture gets all of it. Splitting
 * it four ways gave 11k dots for a 576x324px image - one dot per 17 square
 * pixels, which reads as fog rather than as a screen.
 */
const QUALITY = {
  low: { particles: 22000, bloom: false, maxDPR: 1.25, mosaic: 12000 },
  med: { particles: 55000, bloom: true, maxDPR: 1.75, mosaic: 34000 },
  high: { particles: 96000, bloom: true, maxDPR: 2, mosaic: 60000 },
}

function pickQuality() {
  const cores = navigator.hardwareConcurrency ?? 4
  const dpr = window.devicePixelRatio ?? 1
  if (cores <= 4) return QUALITY.low
  if (cores <= 8 || dpr > 2.5) return QUALITY.med
  return QUALITY.high
}

/**
 * On-screen width of an assembled screenshot, in world units.
 *
 * At the standoff this film uses, the frame is about 13 units wide, so a
 * mosaic gets a bit under half of it. Larger and it stops being a picture in
 * a space and becomes fog across the whole lens.
 */
const MOSAIC_SCALE = 5.4
/** One per beat from the second onwards. */
const MOSAIC_SLOTS = 4
/** Beyond this the next picture is loaded; inside it, the current one holds. */
const MOSAIC_ARM = 46
/** Once the lens is this close the picture has fully dissolved. */
const MOSAIC_PASSED = 11

/**
 * Piecewise-linear sample of the camera path. The scrub is the ease.
 *
 * Returns the field of view as well: each beat has its own move, and the lens
 * is part of the move - the punch-in narrows to 34 degrees, the closing crane
 * opens to 52.
 */
function sampleCamera(keys, p, outPos, outLook) {
  let i = 0
  while (i < keys.length - 2 && p > keys[i + 1].at) i++

  const a = keys[i]
  const b = keys[i + 1]
  const t = MathUtils.clamp((p - a.at) / Math.max(1e-6, b.at - a.at), 0, 1)

  outPos.set(
    MathUtils.lerp(a.pos[0], b.pos[0], t),
    MathUtils.lerp(a.pos[1], b.pos[1], t),
    MathUtils.lerp(a.pos[2], b.pos[2], t)
  )
  outLook.set(
    MathUtils.lerp(a.look[0], b.look[0], t),
    MathUtils.lerp(a.look[1], b.look[1], t),
    MathUtils.lerp(a.look[2], b.look[2], t)
  )
  return MathUtils.lerp(a.fov ?? 42, b.fov ?? 42, t)
}

/** How far ahead the bank looks to find out which way the path is turning. */
const BANK_EPS = 0.004
/** How close the cursor has to get to a knot, in CSS pixels. */
const HOVER_RADIUS = 64

/**
 * How many real events sit near a given depth, smoothed.
 *
 * This is what drives the bloom. The brightest moment in the film is not a
 * number anyone typed - it is wherever the timeline is densest, which is 2025,
 * the only stretch where all four lanes fire at once.
 */
function buildDensity(nodes, zSpan, buckets = 160) {
  const raw = new Float32Array(buckets)
  for (const n of nodes) {
    const b = Math.min(buckets - 1, Math.max(0, Math.round((-n.z / zSpan) * (buckets - 1))))
    raw[b] += n.tier === 'milestone' ? 3 : n.tier === 'award' ? 2 : 1
  }

  // Gaussian-ish blur, three passes of a box. The camera should brighten as it
  // approaches a busy stretch, not snap when it arrives.
  const out = new Float32Array(raw)
  const tmp = new Float32Array(buckets)
  const R = 7
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < buckets; i++) {
      let sum = 0
      let n = 0
      for (let k = -R; k <= R; k++) {
        const j = i + k
        if (j < 0 || j >= buckets) continue
        sum += out[j]
        n++
      }
      tmp[i] = sum / n
    }
    out.set(tmp)
  }

  let max = 0
  for (const v of out) max = Math.max(max, v)
  if (max > 0) for (let i = 0; i < buckets; i++) out[i] /= max

  return (z) => {
    const f = MathUtils.clamp((-z / zSpan) * (buckets - 1), 0, buckets - 1)
    const i = Math.floor(f)
    return MathUtils.lerp(out[i], out[Math.min(buckets - 1, i + 1)], f - i)
  }
}

export async function createWorld(canvas, { film, lanes, zSpan }) {
  const quality = pickQuality()
  const palette = readPalette()

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
  })
  const size = { width: window.innerWidth, height: window.innerHeight }
  const dpr = Math.min(window.devicePixelRatio ?? 1, quality.maxDPR)
  renderer.setPixelRatio(dpr)
  renderer.setSize(size.width, size.height, false)

  const scene = new Scene()
  scene.background = palette.background.clone()

  const camera = new PerspectiveCamera(42, size.width / size.height, 0.1, 160)

  const particles = createParticles({
    count: quality.particles,
    nodes: film.nodes,
    lanes,
    zSpan,
    palette,
    poolSize: quality.mosaic,
  })
  particles.setScale(dpr)
  scene.add(particles.object)

  const post = createPost({ renderer, scene, camera, palette, quality, size })
  const densityAt = buildDensity(film.nodes, zSpan)

  // ---- mosaics -------------------------------------------------------------
  // Sampled up front, loaded one at a time. The samples are kept in memory so
  // swapping between pictures is two buffer writes and no image decoding.
  const placed = film.mosaics.slice(0, MOSAIC_SLOTS)
  let samples = []
  let armed = -1
  let morph = 0
  let disposed = false

  async function loadMosaics() {
    // In parallel: the images are independent, and decoding them one after
    // another left the last unattached seconds after the film had started.
    const got = await Promise.all(
      placed.map((m) =>
        m.src
          ? sampleImage(m.src, quality.mosaic)
          : Promise.resolve(sampleText(m.title, quality.mosaic))
      )
    )
    if (disposed) return
    samples = got
  }
  // Deliberately not awaited: a slow image must never delay first paint.
  loadMosaics()

  /**
   * Which picture the pool should be holding, from where the lens is.
   *
   * Anything already passed is out; anything still far away is out; of what is
   * left, the nearest one wins. Returns -1 when nothing is close enough, which
   * is also the only moment it is safe to rewrite the buffers.
   */
  function armedFor(camZ) {
    let best = -1
    let bestDz = Infinity
    for (let i = 0; i < placed.length; i++) {
      if (!samples[i]) continue
      const dz = camZ - placed[i].z
      if (dz < MOSAIC_PASSED || dz > MOSAIC_ARM) continue
      if (dz < bestDz) {
        bestDz = dz
        best = i
      }
    }
    return best
  }

  // ---- labels --------------------------------------------------------------
  // Only the tiers that earned a name. Sorted by depth so each frame walks a
  // short window instead of the whole timeline.
  const labelNodes = film.nodes
    .filter((n) => n.tier !== 'minor')
    .sort((a, b) => b.z - a.z)
    .map((n) => ({ ...n, v: new Vector3() }))

  const pos = new Vector3()
  const look = new Vector3()
  const aheadPos = new Vector3()
  const aheadLook = new Vector3()
  const started = performance.now()
  let last = started
  let roll = 0
  let smoothVelocity = 0

  function frame(progress, velocity) {
    const now = performance.now()
    // Clamped: returning to a backgrounded tab otherwise delivers one huge
    // delta and the whole field lurches.
    const dt = Math.min((now - last) / 1000, 1 / 30)
    last = now
    const time = (now - started) / 1000

    const fov = sampleCamera(film.cameraKeys, progress, pos, look)

    // Bank into the turn. Read off the path itself rather than off input, so
    // the lens leans through the arc even when the reader is scrolling slowly.
    sampleCamera(film.cameraKeys, Math.min(1, progress + BANK_EPS), aheadPos, aheadLook)
    const turn = MathUtils.clamp((aheadPos.x - pos.x) * 0.9, -1, 1)

    // Velocity is a design input, not a physics readout: it agitates the field
    // and rolls the lens a couple of degrees, then decays back to still.
    smoothVelocity += (velocity - smoothVelocity) * 0.12
    const v = MathUtils.clamp(smoothVelocity / 22, -1, 1)
    const wanted = (v * 2.4 + turn * 3.6) * (Math.PI / 180)
    roll += (wanted - roll) * 0.1

    camera.position.copy(pos)
    camera.lookAt(look)
    camera.rotation.z += roll
    camera.fov = fov + Math.abs(v) * 3.2
    camera.updateProjectionMatrix()

    particles.setTime(time)
    particles.setTurbulence(Math.abs(v))
    // Open the far edge for the closing crane. Everything before it is a
    // flythrough, where distant particles should fall away; the last shot is
    // the one time the whole timeline is meant to be in frame at once.
    particles.setFarFade(MathUtils.lerp(58, 145, MathUtils.smoothstep(progress, 0.86, 1)))

    // A picture assembles as the lens closes on it and dissolves before the
    // lens arrives, so it is never a wall the camera flies into. Held between
    // 17 and 22 units out; gone by 13.
    //
    // The swap to the next picture only happens while nothing is assembled -
    // rewriting the target buffers mid-dissolve would teleport half the field.
    const want = armedFor(camera.position.z)
    if (want !== armed && morph < 0.005) {
      armed = want
      if (armed >= 0) {
        particles.loadMosaic(samples[armed], { ...placed[armed], scale: MOSAIC_SCALE })
      }
    }

    if (armed >= 0) {
      const dz = camera.position.z - placed[armed].z
      morph = (1 - MathUtils.smoothstep(dz, 22, 34)) * MathUtils.smoothstep(dz, 13, 17)
    } else {
      morph = 0
    }
    particles.setMorph(morph)
    // When a picture assembles, the rest of the field steps back. Without this
    // the picture competes with every other particle and never resolves.
    particles.setFieldDim(morph)

    post.setBloom(palette.bloom * (0.5 + 0.95 * densityAt(camera.position.z)))
    post.setTime(time)
    post.render()

    return dt
  }

  /**
   * Which knot is under the cursor.
   *
   * The film used to caption every nearby node all the time, docked in a
   * column with leader lines back to the field. It read as clutter: four
   * captions the reader did not ask for, over a picture that was already
   * moving. Now nothing is captioned until the cursor lands on a knot.
   *
   * Picked in screen space rather than by raycasting: the knots are point
   * clouds with no geometry to hit, and projecting ~21 candidates is cheaper
   * than building a BVH for something that has no surfaces.
   *
   * @param {number} px  cursor x in CSS pixels
   * @param {number} py  cursor y in CSS pixels
   */
  function pickNode(px, py) {
    const zc = camera.position.z
    let best = null
    let bestD = HOVER_RADIUS

    for (const n of labelNodes) {
      const dz = zc - n.z
      // In front of the lens and not yet lost in the fog.
      if (dz < 1 || dz > 40) continue

      n.v.set(n.x, n.y, n.z).project(camera)
      if (n.v.z > 1) continue

      const sx = (n.v.x * 0.5 + 0.5) * size.width
      const sy = (-n.v.y * 0.5 + 0.5) * size.height
      const d = Math.hypot(sx - px, sy - py)
      if (d >= bestD) continue

      bestD = d
      best = {
        id: n.id,
        title: n.title,
        org: n.org,
        date: n.date,
        tier: n.tier,
        x: sx,
        y: sy,
        // The world-space position the shader uses to light the knot up.
        world: { x: n.x, y: n.y, z: n.z },
      }
    }

    particles.setHover(best?.world ?? null)
    return best
  }

  function resize() {
    size.width = window.innerWidth
    size.height = window.innerHeight
    const nextDpr = Math.min(window.devicePixelRatio ?? 1, quality.maxDPR)
    renderer.setPixelRatio(nextDpr)
    renderer.setSize(size.width, size.height, false)
    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()
    particles.setScale(nextDpr)
    post.setSize(size.width, size.height)
  }

  function dispose() {
    disposed = true
    particles.dispose()
    post.dispose()
    renderer.dispose()
  }

  /** Verification surface: what actually assembled, and how strongly. */
  function debug() {
    return {
      quality,
      particles: quality.particles,
      pool: particles.poolSize,
      loaded: samples.filter(Boolean).length,
      armed: armed >= 0 ? placed[armed].slug : null,
      morph: Number(morph.toFixed(3)),
      // Project the assembled picture's corners so a check can assert it is
      // on screen at a readable size, not merely "loaded".
      rect:
        armed >= 0 && samples[armed]
          ? (() => {
              const a = samples[armed].aspect
              const hw = MOSAIC_SCALE / 2
              const hh = hw / Math.max(1, a)
              const m = placed[armed]
              const c0 = new Vector3(m.x - hw, m.y - hh, m.z).project(camera)
              const c1 = new Vector3(m.x + hw, m.y + hh, m.z).project(camera)
              return [
                Math.round((c0.x * 0.5 + 0.5) * 100),
                Math.round((-c1.y * 0.5 + 0.5) * 100),
                Math.round((c1.x * 0.5 + 0.5) * 100),
                Math.round((-c0.y * 0.5 + 0.5) * 100),
              ]
            })()
          : null,
      points: armed >= 0 && samples[armed] ? samples[armed].count : 0,
      camera: [camera.position.x, camera.position.y, camera.position.z],
    }
  }

  return { frame, pickNode, resize, dispose, debug, quality }
}
