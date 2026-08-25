/**
 * The flow field.
 *
 * There is no grid, no corridor, no wireframe - the brief forbids all of them.
 * Structure exists only in how the particles arrange themselves: they bundle
 * into four tubes running the length of the timeline, they knot where a real
 * event happened, and they thin out in the years when nothing did.
 *
 * Everything here writes into caller-owned Float32Arrays so the geometry is
 * built once and never re-allocated.
 */

/** How tightly dust hugs its lane. Larger reads as fog, smaller as a pipe. */
const LANE_RADIUS = 1.5
/** A minority of dust ignores the lanes entirely, so the space has volume. */
const FREE_SHARE = 0.22
/** Half-width of the free dust cloud. */
const FREE_SPREAD = 13
/** How far the dust reaches back before the first recorded date. */
const PRE_ROLL = 26

/** Particles per node, by tier. The three sizes are the whole ranking system. */
const TIER = {
  milestone: { n: 210, r: 0.5, hot: 1, size: 2.4 },
  award: { n: 84, r: 0.38, hot: 1, size: 1.7 },
  minor: { n: 30, r: 0.34, hot: 0, size: 1.1 },
}

/** Seeded RNG: the field must look identical on every load and every reload. */
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Box-Muller, clamped. Gaussian scatter is what makes a tube read as a tube. */
function gauss(rand) {
  const u = Math.max(rand(), 1e-6)
  const v = rand()
  const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * v)
  return Math.max(-2.4, Math.min(2.4, g)) / 2.4
}

/**
 * @param {object} o
 * @param {number} o.count      total particles available
 * @param {Array}  o.nodes      FilmNode[] from useFilm
 * @param {object} o.lanes      LANES from useFilm
 * @param {number} o.zSpan      Z_SPAN from useFilm
 */
export function buildField({ count, nodes, lanes, zSpan }) {
  const flow = new Float32Array(count * 3)
  const hot = new Float32Array(count)
  const size = new Float32Array(count)
  const seed = new Float32Array(count)
  /** 1 = drifts downstream with the flow, 0 = pinned (nodes, baseline). */
  const flowAmt = new Float32Array(count)

  const rand = mulberry32(0x5f3759df)
  let w = 0

  /** Where each node's particles start in the buffer - the label layer needs it. */
  const placed = []

  // ---- 1. Nodes ------------------------------------------------------------
  // Real events first: they get their particles before dust does, so a low
  // quality tier thins the fog rather than deleting achievements.
  for (const node of nodes) {
    const t = TIER[node.tier] ?? TIER.minor
    const n = Math.min(t.n, count - w)
    if (n <= 0) break

    for (let i = 0; i < n; i++, w++) {
      const j = w * 3
      // Cubed radius pulls mass into the core so the knot has a bright centre
      // and a soft edge, instead of reading as a uniform ball.
      const r = t.r * Math.pow(rand(), 0.55)
      const theta = rand() * 6.283185307
      const phi = Math.acos(2 * rand() - 1)
      flow[j] = node.x + r * Math.sin(phi) * Math.cos(theta)
      flow[j + 1] = node.y + r * Math.sin(phi) * Math.sin(theta)
      flow[j + 2] = node.z + r * Math.cos(phi) * 1.5
      hot[w] = t.hot
      size[w] = t.size * (0.6 + rand() * 0.7)
      seed[w] = rand()
      flowAmt[w] = 0
    }
    placed.push({ node, start: w - n, length: n })
  }

  // ---- 2. Academic baseline ------------------------------------------------
  // Not a lane. A flat, quiet line under everything, brighter at the two ends
  // where matriculation and graduation actually happen.
  const baseline = Math.min(Math.floor(count * 0.05), count - w)
  for (let i = 0; i < baseline; i++, w++) {
    const j = w * 3
    const t = i / baseline
    flow[j] = (rand() - 0.5) * 15
    flow[j + 1] = lanes.academic.y + gauss(rand) * 0.28
    flow[j + 2] = -t * zSpan
    // Bright at both ends, dark in the middle: the degree is a frame, not a
    // running commentary on every semester.
    const ends = Math.max(1 - t / 0.06, 1 - (1 - t) / 0.06, 0)
    hot[w] = 0
    size[w] = 0.5 + ends * 1.1
    seed[w] = rand()
    flowAmt[w] = 0
  }

  // ---- 3. Dust -------------------------------------------------------------
  // Everything left. This is the only thing in the scene that moves on its own,
  // and it is the only thing that reveals the structure.
  const laneKeys = ['venture', 'research', 'contest', 'practice']
  const dust = new Int32Array(Math.max(0, count - w))
  let d = 0

  for (; w < count; w++) {
    const j = w * 3
    if (rand() < FREE_SHARE) {
      flow[j] = (rand() - 0.5) * FREE_SPREAD * 2
      flow[j + 1] = (rand() - 0.5) * 7 + 0.5
    } else {
      const lane = lanes[laneKeys[(rand() * 4) | 0]]
      flow[j] = lane.x + gauss(rand) * LANE_RADIUS
      flow[j + 1] = lane.y + gauss(rand) * LANE_RADIUS * 0.55
    }
    // Reach a little past z=0 as well: the camera starts behind the first
    // date, and a frame with nothing in it reads as a broken canvas rather
    // than as an empty year.
    flow[j + 2] = PRE_ROLL - rand() * (zSpan + PRE_ROLL)
    hot[w] = 0
    size[w] = 0.35 + Math.pow(rand(), 3) * 1.2
    seed[w] = rand()
    flowAmt[w] = 1
    dust[d++] = w
  }

  return { flow, hot, size, seed, flowAmt, placed, dust: dust.subarray(0, d) }
}
