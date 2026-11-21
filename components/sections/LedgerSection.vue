<template>
  <!--
    The press log: every dated entry, newest first. A date column in tabular
    figures, then the entry. Awards carry a solid patch in the gutter, so the
    wins read down the left edge like the colour bar reads across a sheet.
  -->
  <div class="lg">
    <ol class="lg-list">
      <li
        v-for="(e, i) in entries"
        v-show="expanded || i < foldAt"
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
          <h2 class="lg-title">{{ e.title }}</h2>
          <p v-if="e.org" class="lg-org">{{ e.org }}</p>
          <template v-if="!compact">
            <p v-if="e.advisor" class="lg-org">{{ c.advisor }}{{ e.advisor }}</p>
            <p v-if="e.publication" class="lg-org">{{ e.publication }}</p>
            <p v-if="e.detail" class="lg-detail">{{ e.detail }}</p>
          </template>
          <p v-if="e.note" class="lg-org">{{ e.note }}</p>

          <p v-if="(e.project && workSlugs.has(e.project)) || e.evidence" class="lg-links">
            <NuxtLink v-if="e.project && workSlugs.has(e.project)" :to="`${prefix}/work/${e.project}/`">
              {{ c.case }}
            </NuxtLink>
            <a v-if="e.evidence" :href="e.evidence" v-bind="linkAttrs(e.evidence)">{{ c.proof }}</a>
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
})

const { timeline, works, en } = useContent()
const { locale } = useLocale()
const workSlugs = new Set(works.map((w) => w.slug))
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
        proof: 'Announcement',
        fold: (n) => `Fold ${n} entries`,
        unfold: (n, a, b) => `Show ${n} more (${a}–${b})`,
        all: (n) => `All ${n} entries`,
      }
    : {
        ongoing: '進行中',
        upcoming: '即將',
        advisor: '指導教授：',
        case: '產品介紹',
        proof: '公告',
        fold: (n) => `收合 ${n} 筆`,
        unfold: (n, a, b) => `展開其餘 ${n} 筆（${a} – ${b}）`,
        all: (n) => `全部 ${n} 筆紀錄`,
      }
)

const entries = computed(() =>
  timeline.map((e) => {
    if (locale.value !== 'en') return { ...e, kindLabel: kindLabel(e.kind) }
    const t = en.timeline?.[`${e.date} ${e.title}`] ?? {}
    return {
      ...e,
      advisor: undefined,
      publication: t.publication ?? (e.publication ? e.publication : undefined),
      ...t,
      kindLabel: KIND_EN[e.kind] ?? e.kind,
    }
  })
)

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
const oldestYear = computed(() => yearOf(entries.value[entries.value.length - 1]))
</script>

<style scoped>
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
