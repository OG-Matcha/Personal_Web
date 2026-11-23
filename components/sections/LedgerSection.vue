<template>
  <!--
    The press log: every dated entry, newest first. A date column in tabular
    figures, then the entry. Awards carry a solid patch in the gutter, so the
    wins read down the left edge like the colour bar reads across a sheet.
  -->
  <div class="lg">
    <!-- A reader after one thing (only the prizes, only the jobs) narrows the
         list here; paper always gets every entry (see the print rules). -->
    <div v-if="filter" class="lg-filter" role="group" :aria-label="c.filterLabel">
      <button
        v-for="g in groups"
        :key="g.id"
        type="button"
        class="lg-chip"
        :aria-pressed="kind === g.id"
        @click="kind = g.id"
      >
        {{ g.label }}<span class="lg-chip-n figures">{{ g.n }}</span>
      </button>
      <p class="sr-only" aria-live="polite">{{ kind === 'all' ? '' : c.showing(shown) }}</p>
    </div>
    <ol class="lg-list">
      <li
        v-for="(e, i) in entries"
        v-show="(expanded || i < foldAt) && inKind(e)"
        :key="e.date + e.title"
        class="lg-row"
        :class="{ 'lg-row--win': e.kind === 'award', 'lg-row--soon': e.upcoming }"
      >
        <div class="lg-when">
          <time class="figures" :datetime="e.date">{{ formatDate(e.date) }}</time>
          <span class="lg-kind">{{ e.kindLabel }}</span>
          <span v-if="e.ongoing" class="lg-live">{{ c.ongoing }}</span>
          <span v-if="e.upcoming" class="lg-live">{{ c.upcoming }}</span>
        </div>

        <div class="lg-what">
          <h3 class="lg-title">{{ keep(e.title) }}</h3>
          <p v-if="e.org" class="lg-org">{{ e.org }}</p>
          <template v-if="!compact">
            <p v-if="e.advisor" class="lg-org">{{ c.advisor }}{{ e.advisor }}</p>
            <p v-if="e.publication" class="lg-org">{{ e.publication }}</p>
            <p v-if="e.detail" class="lg-detail">{{ e.detail }}</p>
          </template>
          <p v-if="e.note" class="lg-org">{{ e.note }}</p>

          <p v-if="(e.project && workSlugs.has(e.project)) || e.evidence" class="lg-links">
            <NuxtLink v-if="e.project && workSlugs.has(e.project)" :to="`${prefix}/work/${e.project}/`" :aria-label="`${c.case}${c.sep}${e.title}`">
              {{ c.case }}
            </NuxtLink>
            <a v-if="e.evidence" :href="e.evidence" v-bind="linkAttrs(e.evidence)" :aria-label="`${proofLabel(e.evidence)}${c.sep}${e.title}`">{{ proofLabel(e.evidence) }}</a>
          </p>
        </div>
      </li>
    </ol>

    <div class="lg-foot">
      <button v-if="hidden" type="button" class="btn" :aria-expanded="expanded" @click="expanded = !expanded">
        {{ expanded ? c.fold(hidden) : c.unfold(hidden, oldestYear, cutoff - 1) }}
      </button>
      <NuxtLink v-if="foldYears" :to="`${prefix}/resume/`" class="lg-all">{{ c.all(timeline.length) }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Calendar years left open before the rest folds. 0 = no fold. */
  foldYears: { type: Number, default: 0 },
  /** Index view: title, org, links; no prose. */
  compact: { type: Boolean, default: false },
  /** A row of buttons above the list that narrows it to one kind of entry. */
  filter: { type: Boolean, default: false },
})

const { timeline, cases, en } = useContent()
const { locale } = useLocale()
const workSlugs = new Set(cases.map((w) => w.slug))
const prefix = computed(() => (locale.value === 'en' ? '/en' : ''))

const KIND_EN = {
  role: 'Role',
  education: 'Education',
  award: 'Award',
  research: 'Research',
  publication: 'Publication',
  grant: 'Grant',
  honor: 'Honour',
  product: 'Product',
}

const c = computed(() =>
  locale.value === 'en'
    ? {
        ongoing: 'ongoing',
        upcoming: 'upcoming',
        advisor: 'Advisor: ',
        case: 'The product',
        sep: ': ',
        proof: { site: 'Website', source: 'Source', store: 'Store listing', cert: 'Certificate', live: 'The site', notice: 'Announcement' },
        shortlisted: 'Shortlist',
        fold: (n) => `Fold ${n} entries`,
        unfold: (n, a, b) => `Show ${n} more (${a}–${b})`,
        all: (n) => `All ${n} entries`,
        filterLabel: 'Show',
        groups: { all: 'All', award: 'Competitions', role: 'Roles', product: 'Products', research: 'Research', education: 'Education', honor: 'Honours & grants' },
        showing: (n) => `Showing ${n} entries`,
      }
    : {
        ongoing: '進行中',
        upcoming: '即將',
        advisor: '指導教授：',
        case: '產品介紹',
        sep: '：',
        proof: { site: '官網', source: '原始碼', store: '商店頁', cert: '獎狀', live: '網站', notice: '公告' },
        shortlisted: '入圍',
        fold: (n) => `收合 ${n} 筆`,
        unfold: (n, a, b) => `展開其餘 ${n} 筆（${a} – ${b}）`,
        all: (n) => `全部 ${n} 筆紀錄`,
        filterLabel: '只看',
        groups: { all: '全部', award: '競賽', role: '職務', product: '產品', research: '研究', education: '學歷', honor: '榮譽與補助' },
        showing: (n) => `顯示 ${n} 筆`,
      }
)

const entries = computed(() =>
  timeline.map((e) => {
    // A shortlist is not a prize: the header counts only wins, so the row says so too.
    const short = e.kind === 'award' && /入圍/.test(e.title)
    if (locale.value !== 'en') return { ...e, kindLabel: short ? c.value.shortlisted : kindLabel(e.kind) }
    const t = en.timeline?.[`${e.date} ${e.title}`] ?? {}
    return {
      ...e,
      advisor: undefined,
      publication: t.publication ?? (e.publication ? e.publication : undefined),
      ...t,
      kindLabel: short ? c.value.shortlisted : KIND_EN[e.kind] ?? e.kind,
    }
  })
)

// The link says what the reader will land on: the product's own site, its
// code, or a third party's announcement.
const OWN_SITE = /(^|\.)(ogmatcha\.com|finctory\.com|medalink\.ai)$/
function proofLabel(url) {
  let u
  try { u = new URL(url, 'https://www.ogmatcha.com') } catch { return c.value.proof.notice }
  if (u.pathname.startsWith('/proof/')) return c.value.proof.cert
  if (u.hostname === 'github.com' && /^\/OG-Matcha\//i.test(u.pathname)) return c.value.proof.source
  if (OWN_SITE.test(u.hostname)) return c.value.proof.site
  if (u.hostname === 'chromewebstore.google.com') return c.value.proof.store
  // A site the entry's team built, still online.
  if (u.hostname === 'ncufresh.ncu.edu.tw') return c.value.proof.live
  return c.value.proof.notice
}

const expanded = ref(false)
const yearOf = (e) => Number(String(e?.date ?? '').slice(0, 4)) || 0

// Counted back from the newest entry, so it never starts folding this year's
// work the moment the year rolls over.
const cutoff = computed(() => (props.foldYears ? yearOf(entries.value[0]) - (props.foldYears - 1) : 0))
const foldAt = computed(() => {
  if (!cutoff.value) return entries.value.length
  const i = entries.value.findIndex((e) => yearOf(e) < cutoff.value)
  return i === -1 ? entries.value.length : i
})
const hidden = computed(() => entries.value.length - foldAt.value)

// Kinds with a handful of entries share a button: a grant is an honour too,
// and a publication is research.
const GROUP = { award: 'award', role: 'role', product: 'product', research: 'research', publication: 'research', education: 'education', honor: 'honor', grant: 'honor' }
const kind = ref('all')
const inKind = (e) => kind.value === 'all' || (GROUP[e.kind] ?? 'honor') === kind.value
const groups = computed(() => {
  const n = {}
  for (const e of entries.value) n[GROUP[e.kind] ?? 'honor'] = (n[GROUP[e.kind] ?? 'honor'] ?? 0) + 1
  return Object.entries(c.value.groups)
    .map(([id, label]) => ({ id, label, n: id === 'all' ? entries.value.length : n[id] ?? 0 }))
    .filter((g) => g.n)
})
const shown = computed(() => entries.value.filter(inKind).length)
const oldestYear = computed(() => yearOf(entries.value[entries.value.length - 1]))
</script>

<style scoped>
.lg-filter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-6);
}

/* Pills like the site's buttons, but quieter: the chosen one is filled. */
.lg-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  min-height: 44px;
  padding-inline: var(--sp-4);
  border-radius: var(--r-full);
  border: 1.5px solid var(--rule-strong);
  background: var(--surface);
  color: var(--ink-2);
  font-size: var(--step--1);
  font-weight: 600;
  transition: background-color var(--dur-1), border-color var(--dur-1), color var(--dur-1);
}

.lg-chip:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.lg-chip[aria-pressed='true'] {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
}

.lg-chip-n {
  font-weight: 500;
  opacity: 0.82;
}

.lg-filter + .lg-list {
  margin-top: var(--sp-5);
}

.lg-list {
  margin-top: var(--sp-7);
  border-top: 1px solid var(--rule);
}

.lg-row {
  position: relative;
  display: grid;
  gap: var(--sp-1) var(--sp-6);
  padding-block: var(--sp-4);
  border-bottom: 1px solid var(--rule);
}

@media (min-width: 768px) {
  .lg-row {
    grid-template-columns: 11rem minmax(0, 1fr);
  }
}

.lg-when {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--sp-1) var(--sp-3);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.lg-when time {
  color: var(--ink);
  font-weight: 600;
}

/* A solid patch marks the wins. Every row keeps the patch's place, so the
   dates stand on one line whether or not the row won. */
.lg-when time::before {
  content: '';
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin-right: 0.45em;
}

.lg-row--win .lg-when time::before {
  background: var(--pop);
}

.lg-row--soon {
  color: var(--ink-2);
}

.lg-live {
  color: var(--pop-ink);
  font-weight: 600;
}

.lg-title {
  font-size: var(--step-1);
  font-weight: 700;
  line-height: 1.4;
}

/* What is read, at reading size; only the labels (date, kind, links) are small. */
.lg-org {
  margin-top: var(--sp-1);
  font-size: var(--step-0);
  color: var(--ink-2);
}

.lg-detail {
  margin-top: var(--sp-2);
  font-size: var(--step-0);
  line-height: 1.75;
  max-width: 40em;
}

.lg-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-5);
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  font-weight: 600;
}

/* The proof under each line: underlined, so it reads as something to open. */
.lg-links a {
  text-decoration-line: underline;
  text-decoration-color: var(--pop-ink);
  text-decoration-thickness: 1.5px;
  position: relative;
}

/* A thumb-sized target around a short word, without moving the text. */
.lg-links a::after {
  content: '';
  position: absolute;
  left: -10px;
  right: -10px;
  top: 50%;
  height: 44px;
  translate: 0 -50%;
}

.lg-links a:hover {
  color: var(--pop-ink);
}

.lg-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-4) var(--sp-6);
  margin-top: var(--sp-6);
}

.lg-all {
  font-weight: 600;
  font-size: var(--step--1);
  text-decoration-color: var(--pop-ink);
}
</style>
