/**
 * The film's geometry, derived from `content/timeline.yml` alone.
 *
 * One rule holds this file together: **z is time**. Every position in the 3D
 * world and every scroll boundary in the DOM comes from a date, so the camera
 * and the copy cannot disagree about where in the story the reader is.
 *
 * Nothing here imports three.js - `gl/` consumes the plain objects this
 * returns, which keeps the geometry testable and keeps three out of the
 * server bundle.
 */

import { useContent } from '~/composables/useContent'

/** The film runs from matriculation to the master's. */
const T_START = '2022-09'
const T_END = '2026-09'

/** World depth of the whole timeline, in scene units. */
export const Z_SPAN = 132

/**
 * The four parallel lanes plus the academic baseline.
 *
 * x is symmetric around 0 so the camera can frame the whole bundle to either
 * side of the screen by sliding along x - that is the per-beat side swap, and
 * it is one camera move rather than a second layout.
 */
export const LANES = {
  venture: { x: 4.6, y: 1.5, label: '創業' },
  research: { x: 1.55, y: 0.5, label: '研究' },
  contest: { x: -1.55, y: 0.5, label: '競賽' },
  practice: { x: -4.6, y: 1.5, label: '實務' },
  /** Not a lane. A flat reference line under everything, lit only at the ends. */
  academic: { x: 0, y: -3.4, label: '學業' },
} as const

export type LaneId = keyof typeof LANES

/**
 * The five convergence points: the only moments where several lanes fire at
 * once. The camera dwells here and travels between them - that is the whole
 * answer to "37 things without feeling long".
 */
export const BEATS = [
  { id: 'ignite', from: '2022-09', to: '2023-10', side: 'left' },
  { id: 'build', from: '2024-03', to: '2024-07', side: 'right' },
  { id: 'peak', from: '2024-10', to: '2024-12', side: 'left' },
  { id: 'proof', from: '2025-01', to: '2025-12', side: 'right' },
  { id: 'now', from: '2026-04', to: '2026-09', side: 'centre' },
] as const

export type BeatId = (typeof BEATS)[number]['id']

/**
 * Scroll budget. These four must sum to exactly 1:
 *   LEAD + 5·DWELL + 4·TRAVEL + TAIL
 * If they overrun, the last beat's dwell is silently clipped and the closing
 * camera key becomes unreachable - the film would end mid-move. `beatBudget()`
 * below asserts it rather than leaving it to arithmetic done by hand.
 */
const DWELL = 0.135
/** How much is spent flying between two beats. */
const TRAVEL = 0.0625
/** A short run-up so the first frame is not already inside beat one. */
const LEAD = 0.045
/** A short drift after the last beat: the story does not stop, the dates do. */
const TAIL = 0.03

/** Total scroll the film occupies, in vh. Raise to slow the whole thing down. */
export const FILM_VH = 1000

/** How far in front of the subject the lens sits. */
const STANDOFF = 13
/** How far off-axis the camera slides to throw the lanes to one side. */
const LATERAL = 4.2

/**
 * A bare `2025` in the timeline means "this year, month unknown" - the rule in
 * timeline.yml is to never guess a month. Placing all of those in January
 * stacks them on top of each other and makes January look like the busiest
 * month of the year, so they land mid-year instead. It is the same admission
 * of ignorance, drawn honestly.
 */
function monthsOf(date: string): number {
  const [y, m] = String(date).split('-')
  return Number(y) * 12 + (Number(m) || 7) - 1
}

const M0 = monthsOf(T_START)
const M_TOTAL = monthsOf(T_END) - M0

/** `2024-11` → 0..1 through the film's time range. */
export function tOf(date: string): number {
  return Math.min(1, Math.max(0, (monthsOf(date) - M0) / M_TOTAL))
}

/** `2024-11` → world z. Deeper into the scene means later in time. */
export function zOf(date: string): number {
  return -tOf(date) * Z_SPAN
}

export interface BeatWindow {
  id: BeatId
  index: number
  side: 'left' | 'right' | 'centre'
  from: string
  to: string
  /** Progress at which this beat's dwell begins / ends. */
  start: number
  end: number
  /** Progress span including the travel that leads into it. Drives DOM height. */
  spanStart: number
}

/** The budget, and the check that it closes. Exported so a test can read it. */
export function beatBudget() {
  const total = LEAD + BEATS.length * DWELL + (BEATS.length - 1) * TRAVEL + TAIL
  return { LEAD, DWELL, TRAVEL, TAIL, total, closes: Math.abs(total - 1) < 1e-9 }
}

/**
 * Lay the beats out along `progress`. Dwells are fixed-width regardless of how
 * many months the beat covers: 2025 spans a year and 2024-11 spans one month,
 * but they get the same time on screen because they carry the same weight.
 */
export function beatWindows(): BeatWindow[] {
  const out: BeatWindow[] = []
  let cursor = LEAD
  BEATS.forEach((b, i) => {
    const spanStart = i === 0 ? 0 : cursor - TRAVEL
    out.push({
      id: b.id,
      index: i,
      side: b.side,
      from: b.from,
      to: b.to,
      start: cursor,
      end: cursor + DWELL,
      spanStart,
    })
    cursor += DWELL + TRAVEL
  })
  return out
}

/** Scroll height of each beat's section, in vh. Derived, never hand-tuned. */
export function beatSpans(): number[] {
  const w = beatWindows()
  return w.map((b, i) => {
    const next = w[i + 1]?.spanStart ?? 1
    // The last beat carries an extra screen: the final frame has to be
    // reachable, and the film ends one viewport before the document does.
    return (next - b.spanStart) * FILM_VH + (i === w.length - 1 ? 100 : 0)
  })
}

export interface CameraKey {
  at: number
  /** Where the lens sits. */
  pos: [number, number, number]
  /** Where it points. */
  look: [number, number, number]
  /** Field of view in degrees. Part of the choreography, not a constant. */
  fov: number
}

/**
 * `side` names where the **copy** sits, so the camera has to go the other way:
 * standing to the world's right throws the world to screen-left, which is
 * where the 3D belongs when the type is on the right.
 */
const SIDE_X: Record<string, number> = { left: -LATERAL, right: LATERAL, centre: 0 }

/**
 * The camera path.
 *
 * Every beat gets its own move. The first version trucked left and right for
 * all five, which meant the last beat felt exactly like the first - five
 * chapters told in one sentence. Each move here has a reason in the story:
 *
 *   1 起點     crane down    arriving at a place, from above
 *   2 開始蓋   truck         walking alongside the thing being built
 *   3 三個月   punch in      three awards in one month: get close
 *   4 2025     arc           four lanes at once: move around it to see it
 *   5 還在跑   crane + turn  climb, then look back down all four years
 *
 * Two constraints hold: the copy's half of the frame never changes inside a
 * dwell (the scrim and the mosaics depend on it), and every value is still a
 * pure function of one scroll scalar.
 */
export function cameraKeys(): CameraKey[] {
  const w = beatWindows()
  const keys: CameraKey[] = []
  const at = (i: number) => w[i]

  const zFrom = (i: number) => zOf(at(i).from)
  const zTo = (i: number) => zOf(at(i).to)

  // ---- run-up: high, wide, and falling ------------------------------------
  keys.push({
    at: 0,
    pos: [SIDE_X[at(0).side] * 0.3, 22, zFrom(0) + STANDOFF + 16],
    look: [0, 6, zFrom(0) - 2],
    fov: 58,
  })

  // ---- 1 ignite: crane down -----------------------------------------------
  const x0 = SIDE_X[at(0).side]
  keys.push({
    at: at(0).start,
    pos: [x0 * 0.7, 8.5, zFrom(0) + STANDOFF + 4],
    look: [x0 * 0.4, 2.4, zFrom(0) - 5],
    fov: 50,
  })
  keys.push({
    at: at(0).end,
    pos: [x0, 0.9, zTo(0) + STANDOFF],
    look: [x0 * 0.8, 0.4, zTo(0) - 6],
    fov: 42,
  })

  // ---- 2 build: truck ------------------------------------------------------
  const x1 = SIDE_X[at(1).side]
  keys.push({
    at: at(1).start,
    pos: [x1 * 1.3, 1.5, zFrom(1) + STANDOFF],
    look: [x1 * 1.0, 0.6, zFrom(1) - 6],
    fov: 42,
  })
  keys.push({
    at: at(1).end,
    pos: [x1 * 0.72, 0.6, zTo(1) + STANDOFF],
    look: [x1 * 0.55, 0.3, zTo(1) - 6],
    fov: 40,
  })

  // ---- 3 peak: punch in ----------------------------------------------------
  // The standoff collapses from 23 to 8 across the dwell. `x` closes with it,
  // or the subject would swing out of frame as the lens gets close.
  const x2 = SIDE_X[at(2).side]
  keys.push({
    at: at(2).start,
    pos: [x2 * 1.15, 2.2, zFrom(2) + STANDOFF + 10],
    look: [x2 * 0.9, 0.8, zFrom(2) - 5],
    fov: 46,
  })
  keys.push({
    at: at(2).end,
    pos: [x2 * 0.58, 0.4, zTo(2) + 8],
    look: [x2 * 0.45, 0.2, zTo(2) - 4],
    fov: 34,
  })

  // ---- 4 proof: arc --------------------------------------------------------
  // Swings out, rises, and comes back - an arc around the densest stretch of
  // the whole timeline. It never crosses the axis, so the copy keeps its half.
  const x3 = SIDE_X[at(3).side]
  const zMid3 = (zFrom(3) + zTo(3)) / 2
  keys.push({
    at: at(3).start,
    pos: [x3 * 1.4, 0.5, zFrom(3) + STANDOFF],
    look: [x3 * 0.7, 0.6, zFrom(3) - 7],
    fov: 40,
  })
  keys.push({
    at: (at(3).start + at(3).end) / 2,
    pos: [x3 * 0.85, 3.4, zMid3 + STANDOFF - 1],
    look: [x3 * 0.55, 0.4, zMid3 - 8],
    fov: 38,
  })
  keys.push({
    at: at(3).end,
    pos: [x3 * 1.35, 0.6, zTo(3) + STANDOFF],
    look: [x3 * 0.7, 0.4, zTo(3) - 7],
    fov: 40,
  })

  // ---- 5 now: climb, then look back ---------------------------------------
  // The payoff. The lens rises and turns, and the four years it just flew
  // through are all in one frame. The yaw is spread over the last beat's dwell
  // plus the tail - about a screen and a half of scroll - so it reads as a
  // crane, not a spin.
  keys.push({
    at: at(4).start,
    pos: [0, 1.0, zFrom(4) + STANDOFF],
    look: [0, 0.5, zFrom(4) - 8],
    fov: 42,
  })
  keys.push({
    at: at(4).end,
    pos: [0, 7, zTo(4) + 6],
    look: [0, 0.5, zTo(4) + 18],
    fov: 46,
  })
  keys.push({
    at: 1,
    pos: [0, 15, zTo(4) + 9],
    look: [0, -1.5, zTo(4) + 74],
    fov: 52,
  })

  return keys
}

/** Sample the path at a progress value. Mirrors `sampleCamera` in gl/world.js. */
export function cameraAt(p: number): { pos: [number, number, number]; look: [number, number, number] } {
  const keys = cameraKeys()
  let i = 0
  while (i < keys.length - 2 && p > keys[i + 1].at) i++
  const a = keys[i]
  const b = keys[i + 1]
  const t = Math.min(1, Math.max(0, (p - a.at) / Math.max(1e-6, b.at - a.at)))
  const lerp3 = (u: number[], v: number[]) =>
    [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t, u[2] + (v[2] - u[2]) * t] as [
      number,
      number,
      number,
    ]
  return { pos: lerp3(a.pos, b.pos), look: lerp3(a.look, b.look) }
}

/** Which lane a timeline entry belongs to, with a safe default. */
function laneOf(entry: any): LaneId {
  const l = entry.lane as LaneId
  return l && l in LANES ? l : 'practice'
}

/**
 * The five events that get the largest nodes. Matched on a distinctive
 * substring rather than an index so reordering the YAML cannot silently
 * re-rank them.
 */
const MILESTONES = [
  '共同創辦 斐闊',
  '台積電校園黑客松',
  '資安應用組 - 第一名',
  '數位＋組 - 金獎',
  '學士畢業',
]

export type NodeTier = 'milestone' | 'award' | 'minor'

function tierOf(entry: any): NodeTier {
  if (MILESTONES.some((m) => String(entry.title).includes(m))) return 'milestone'
  if (entry.kind === 'award' || entry.kind === 'grant') return 'award'
  return 'minor'
}

export interface FilmNode {
  id: string
  tier: NodeTier
  lane: LaneId
  /** Home position in the flow field. */
  x: number
  y: number
  z: number
  date: string
  title: string
  org: string | null
  project: string | null
  /** Short label for the 3D overlay - never the full competition name. */
  label: string
}

/** Deterministic jitter: the same node lands in the same place every load. */
function hash01(s: string, salt: number): number {
  let h = 2166136261 ^ salt
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

/**
 * Node labels are short by construction. The full title lives in the ledger;
 * a label that has to be readable at 11px while flying past cannot be
 * "第 29 屆大專校院資訊應用服務創新競賽 資安應用組 - 第一名".
 */
export function shortTitle(entry: { title: string }): string {
  const t = String(entry.title)

  // Only boilerplate comes off. Nothing is ever sliced by character count:
  // the first version cut at a fixed width and produced "致青春・創未來全國選拔大"
  // and "SAP S/4HANA &" - which read as typos, not as abbreviations. CJK wraps
  // cleanly, so a long title becomes two lines rather than a truncated one.
  return t
    // "第 29 屆大專校院..." / "第六屆台積電..." - the edition number is noise
    // everywhere except the ledger, which keeps the full string.
    .replace(/^第\s*[0-9０-９一二三四五六七八九十]+\s*屆\s*/, '')
    // "（TSMC IT CareerHack）" - the English gloss of a Chinese name. Seven
    // characters or more, so a short abbreviation that carries meaning on its
    // own survives: "（FDE）" is the job title, not a translation of it.
    .replace(/[（(][A-Za-z0-9 ./&-]{7,}[）)]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function useFilm() {
  const { timeline, works } = useContent()

  const nodes: FilmNode[] = timeline
    .filter((e: any) => e.date && tOf(e.date) >= 0)
    .map((e: any) => {
      const lane = laneOf(e)
      const base = LANES[lane]
      const id = `${e.date}-${String(e.title).slice(0, 8)}`
      // Spread within the lane so simultaneous events do not stack into one
      // point - the density of a month is part of what the film is saying.
      const spread = lane === 'academic' ? 0.35 : 1.15
      return {
        id,
        tier: tierOf(e),
        lane,
        x: base.x + (hash01(id, 1) - 0.5) * spread * 2,
        y: base.y + (hash01(id, 2) - 0.5) * spread,
        z: zOf(e.date) + (hash01(id, 3) - 0.5) * 1.6,
        date: e.date,
        title: e.title,
        org: e.org ?? null,
        project: e.project ?? null,
        label: shortTitle(e),
      }
    })

  /**
   * Where each case study's mosaic hangs: at its own date, on its own lane,
   * pushed off-axis so it never sits on top of the copy.
   */
  // Mosaics are pinned inside a beat's dwell, never in the travel between two.
  //
  // During a dwell the lens keeps one side of the axis, so "put the picture in
  // the half the copy is not using" has a stable answer. In the travel the
  // camera is crossing the middle and a picture placed there straddles the
  // copy whichever way it is offset.
  //
  // The order is honest and the placement is not: works are assigned to beats
  // in date order, one each, starting at the second - nothing had shipped
  // during the first. Every dated claim lives on the nodes and their labels.
  //
  // The position is solved off the real camera path rather than assumed,
  // because each beat now has its own move and its own standoff: the punch-in
  // beat ends eight units from its subject and the crane beat starts twenty-six
  // above it. A hard-coded offset would frame one of them and lose the rest.
  const beats = beatWindows()
  /** How far in front of the lens the picture hangs, in world units. */
  const MOSAIC_LOOKAHEAD = 19
  /** How far off the frame centre, as a fraction of the frame's half-width. */
  const MOSAIC_OFFSET = 0.42

  const mosaics = works
    .map((w: any) => ({
      slug: w.slug,
      // No cover is not a gap: Finctory is an organisation, not a screen, so
      // its mosaic is its name. `gl/mosaic.js` renders type when src is null.
      src: (w.cover as string) ?? null,
      // The wordmark is the short name. "斐闊 Finctory" set as particles is a
      // banner; "斐闊" is a mark.
      title: String(w.title).split(' ')[0],
      at: tOf(w.period?.start ?? '2025-01'),
    }))
    .sort((a, b) => a.at - b.at)
    .slice(0, beats.length - 1)
    .map((m, i) => {
      const beat = beats[i + 1]
      // Where in the dwell the picture is composed. Halfway for the beats that
      // hold a steady heading; early for the closing crane, which climbs and
      // turns away fast enough that a mid-dwell placement is already behind
      // and below the lens by the time it assembles.
      const compose = beat.id === 'now' ? 0.18 : 0.5
      const { pos, look } = cameraAt(beat.start + (beat.end - beat.start) * compose)

      // The lens basis at that moment: forward, then screen-right, then
      // screen-up. Offsetting along world axes instead breaks on the beats
      // where the camera is pitched - the closing crane looks down, so a lift
      // along world +y lands the picture below centre, not above it.
      const d = [look[0] - pos[0], look[1] - pos[1], look[2] - pos[2]]
      const len = Math.hypot(d[0], d[1], d[2]) || 1
      const fwd = [d[0] / len, d[1] / len, d[2] / len]

      // cross(fwd, worldUp) with up = (0,1,0). Screen-right is +x when the
      // lens points down -z, which is what fixes the sign here.
      const rx = -fwd[2]
      const rz = fwd[0]
      const rLen = Math.hypot(rx, rz) || 1
      const right = [rx / rLen, 0, rz / rLen]

      // cross(right, fwd) - the true up, which tilts with the pitch.
      const up = [
        right[1] * fwd[2] - right[2] * fwd[1],
        right[2] * fwd[0] - right[0] * fwd[2],
        right[0] * fwd[1] - right[1] * fwd[0],
      ]

      // Half-width of the frame at the hold distance, from the vertical fov.
      const halfH = MOSAIC_LOOKAHEAD * Math.tan((42 * Math.PI) / 180 / 2)
      const halfW = halfH * 1.6
      // `side` is where the copy sits, so the picture goes the other way.
      const push = beat.side === 'centre' ? 0 : (beat.side === 'right' ? -1 : 1) * halfW * MOSAIC_OFFSET
      // Lifted clear of the lane bundle: a screenshot read through a tube of
      // drifting dust is a screenshot nobody reads.
      const lift = halfH * 0.22

      return {
        ...m,
        x: pos[0] + fwd[0] * MOSAIC_LOOKAHEAD + right[0] * push + up[0] * lift,
        y: pos[1] + fwd[1] * MOSAIC_LOOKAHEAD + right[1] * push + up[1] * lift,
        z: pos[2] + fwd[2] * MOSAIC_LOOKAHEAD + right[2] * push + up[2] * lift,
      }
    })

  return { nodes, mosaics, beats: beatWindows(), cameraKeys: cameraKeys(), works }
}
