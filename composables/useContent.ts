// Build-time content. Every YAML file under content/ is resolved by
// @rollup/plugin-yaml during the build, so this costs zero runtime bytes and
// every fact ends up in the prerendered HTML where crawlers can read it.
import site from '~/content/site.yml'
import about from '~/content/about.yml'
import timelineRaw from '~/content/timeline.yml'
import skills from '~/content/skills.yml'
import alsoBuilt from '~/content/also-built.yml'
import beatCopy from '~/content/beats.yml'

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
  /** Which of the film's four lanes this sits on. See docs/CINEMATIC-BRIEF.md. */
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
    return (value.trimStart().startsWith('TODO') ? undefined : value) as T
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

export function useContent() {
  return {
    site: { ...site, asOf: normaliseDate(site.asOf) },
    about,
    timeline,
    skills,
    alsoBuilt,
    beatCopy,
    works,
  }
}

export function useWork(slug: string) {
  return works.find((w) => w.slug === slug) ?? null
}
