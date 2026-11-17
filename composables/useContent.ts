// Build-time content. Every YAML file under content/ is resolved by
// @rollup/plugin-yaml during the build, so this costs zero runtime bytes and
// every fact ends up in the prerendered HTML where crawlers can read it.
import site from '~/content/site.yml'
import about from '~/content/about.yml'
import timelineRaw from '~/content/timeline.yml'
import skills from '~/content/skills.yml'
import alsoBuilt from '~/content/also-built.yml'
import en from '~/content/en.yml'
import beatsRaw from '~/content/beats.yml'

import osave from '~/content/work/osave.yml'
import phishforge from '~/content/work/phishforge.yml'
import finctory from '~/content/work/finctory.yml'
import medalink from '~/content/work/medalink.yml'

export type TimelineKind =
  | 'role'
  | 'education'
  | 'award'
  | 'research'
  | 'publication'
  | 'grant'
  | 'honor'
  | 'product'

export interface TimelineEntry {
  date: string
  kind: TimelineKind
  title: string
  org?: string
  detail?: string
  note?: string
  period?: string
  advisor?: string
  publication?: string
  project?: string | null
  evidence?: string | null
  ongoing?: boolean
  /** Which of the four parallel tracks this entry belongs to. */
  lane?: 'venture' | 'research' | 'contest' | 'practice' | 'academic'
  /** Branch within the venture lane. */
  strand?: 'finctory' | 'medalink'
  /** Dated in the future - rendered, but marked as not yet happened. */
  upcoming?: boolean
  /** The one entry whose paperwork has not been found yet. */
  needs_verification?: boolean
}

const KIND_LABEL: Record<TimelineKind, string> = {
  role: '經歷',
  education: '學歷',
  award: '獎項',
  research: '研究',
  publication: '發表',
  grant: '補助',
  honor: '榮譽',
  product: '產品',
}

/** YAML dates parse to Date objects (`2026-05`) or strings (`2025`). Normalise. */
function normaliseDate(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear()
    const m = String(value.getUTCMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  return String(value ?? '')
}

/** `2026-05` → `2026.05`; `2025` → `2025`. Display only. */
export function formatDate(iso: string): string {
  return iso.replace('-', '.')
}

export function kindLabel(kind: TimelineKind): string {
  return KIND_LABEL[kind] ?? kind
}

/**
 * Close the spaces YAML's folded scalars leave inside Chinese sentences.
 *
 * `summary: >-` written across three source lines becomes one string with a
 * literal U+0020 at each fold. In English that is the point; in Chinese the
 * space lands after 。 or between two Han characters, where the typography has
 * none - and it ships straight into the meta description, so the search result
 * reads 「所以我的財務健康嗎」。 財伴改成…
 *
 * Two narrow rules, so deliberate Latin spacing survives: 把 LLM 放進 and
 * 翻成 13 項 both have a Latin character on one side of the space.
 *
 * Matching only [ 	] is load-bearing. `\s+` would eat the blank line that
 * `paragraphs()` splits on and collapse every case study into one block.
 */
function closeCjkFolds(s: string): string {
  return s
    .replace(/([　-〿！-｠—])[ 	]+/g, '$1')
    .replace(/([一-鿿])[ 	]+([一-鿿])/g, '$1$2')
}

/**
 * Strip every TODO before the content leaves the build.
 *
 * The case-study YAMLs use `TODO` as a deliberate placeholder - the rule is
 * that a blank is more honest than an adjective. But the pages only skip
 * rendering them; the raw strings still travel in the Nuxt payload, where
 * "TODO - 這是法規風險還是產品定位的決定？" is readable by anyone who views
 * source. Those are private notes about unresolved questions, so they are
 * removed here rather than merely hidden.
 */
function stripTodo<T>(value: T): T {
  if (typeof value === 'string') {
    if (value.trimStart().startsWith('TODO')) return undefined as T
    return closeCjkFolds(value) as T
  }
  if (Array.isArray(value)) {
    return value
      .map(stripTodo)
      .filter((v) => v !== undefined && !(v && typeof v === 'object' && !Object.keys(v).length)) as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const clean = stripTodo(v)
      if (clean !== undefined) out[k] = clean
    }
    return out as T
  }
  return value
}

const works = [osave, phishforge, finctory, medalink]
  .map(stripTodo)
  .map((w) => ({ ...w, period: { start: normaliseDate(w.period?.start), end: normaliseDate(w.period?.end) } }))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

// Sort once at module scope: it never changes between renders, and doing it in
// a computed would redo the work on every component that reads the timeline.
const timeline: TimelineEntry[] = (timelineRaw as TimelineEntry[])
  .map((e) => ({ ...e, date: normaliseDate(e.date) }))
  .filter((e) => e.date) // the hard rule: no date, no render
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

/**
 * The numbers the site says about itself out loud, counted from the timeline
 * rather than remembered.
 *
 * Three different figures used to ship - 17 in nuxt.config, 15 on /resume, and
 * 16 rows in the YAML - and an answer engine that reads two pages of one domain
 * and gets two answers will hedge or pick wrong. This is exactly the fact a
 * recruiter-shaped query asks for, so it gets one source.
 *
 * Two rules, both deliberate:
 *  - 入圍 is not winning. Being shortlisted for a final stays on the timeline
 *    and out of the count; one extra unit is not worth a number that does not
 *    survive being checked.
 *  - 首獎, not 冠軍. 金獎 and 最佳創新創業大獎 are the top prize of their
 *    competition without being called 第一名, and 「冠軍」would overclaim them.
 */
const SHORTLISTED = /入圍/
const TOP_PRIZE = /第一名|冠軍|金獎|最佳創新創業大獎/

const wonAwards = timeline.filter(
  (e) => e.kind === 'award' && !SHORTLISTED.test(e.title)
)

/**
 * Outcome values may say {awards} or {topPrizes}: counted per project from the
 * timeline, so a case study never claims a different number than its own
 * award list (oSave's page once said 6 above a list of 8).
 */
function fillCounts(v: unknown, slug: string) {
  const won = wonAwards.filter((e) => e.project === slug)
  return String(v)
    .replace('{awards}', String(won.length))
    .replace('{topPrizes}', String(won.filter((e) => TOP_PRIZE.test(e.title)).length))
}
for (const w of works as any[]) {
  if (w.outcomes) w.outcomes = w.outcomes.map((o: any) => ({ ...o, value: fillCounts(o.value, w.slug) }))
  const e = (en as any).works?.[w.slug]
  if (e?.results) e.results = e.results.map((r: any) => ({ ...r, value: fillCounts(r.value, w.slug) }))
  if (e?.outcomes) e.outcomes = e.outcomes.map((o: any) => ({ ...o, value: fillCounts(o.value, w.slug) }))
}

const counts = {
  awards: wonAwards.length,
  topPrizes: wonAwards.filter((e) => TOP_PRIZE.test(e.title)).length,
  // Only the projects funded by NSTC. The LAK 2025 knowledge-graph work is
  // `kind: research` too, but it was a general-education centre project, and
  // counting it made the site claim four NSTC grants where there are three.
  researchGrants: timeline.filter((e) => e.kind === 'research' && /國科會|NSTC/.test(e.publication ?? '')).length,
}

/** The five questions on the homepage; each one's events are its date range. */
const beats = (beatsRaw as { id: string; from: unknown; to: unknown; title: string; lede?: string }[])
  .map(stripTodo)
  .map((b) => {
    const from = normaliseDate(b.from)
    const to = normaliseDate(b.to)
    return { ...b, from, to, events: timeline.filter((e) => {
      const d = e.date.length === 4 ? `${e.date}-01` : e.date
      return d >= from && d <= to
    }).reverse() }
  })

export function useContent() {
  return {
    site: { ...site, asOf: normaliseDate(site.asOf), counts },
    about,
    timeline,
    skills,
    alsoBuilt,
    en,
    works,
    beats,
  }
}

export function useWork(slug: string) {
  return works.find((w) => w.slug === slug) ?? null
}
