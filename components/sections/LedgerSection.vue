<template>
  <section id="ledger" class="shell pb-section">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <h2 class="section-title">{{ heading }}</h2>
      <NuxtLink v-if="limit && timeline.length > limit" to="/resume" class="mono text-2xs">
        完整年表（{{ timeline.length }} 筆）
      </NuxtLink>
    </div>

    <!-- Date gutter plus entry. A single left rule carries the sequence, so no
         row needs its own box or its own divider. -->
    <ol class="mt-6">
      <li
        v-for="(entry, i) in entries"
        v-show="expanded || i < foldAt"
        :key="entry.date + entry.title"
        class="grid gap-x-5 gap-y-1 border-t border-rule py-4 md:grid-cols-12"
      >
        <div class="flex items-baseline gap-3 md:col-span-3">
          <time class="mono text-2xs tabular-nums" :datetime="entry.date">
            {{ formatDate(entry.date) }}
          </time>
          <span class="mono text-2xs text-ink-2">{{ kindLabel(entry.kind) }}</span>
          <span v-if="entry.ongoing" class="ongoing">進行中</span>
        </div>

        <div class="md:col-span-9">
          <h3 class="font-display text-lg">{{ entry.title }}</h3>
          <p v-if="entry.org" class="mt-1 text-2xs text-ink-2">{{ entry.org }}</p>

          <!-- The homepage slice is a scannable index; the full page carries the
               prose. Same data, two reading speeds. -->
          <template v-if="!compact">
            <p v-if="entry.advisor" class="mt-1 text-2xs text-ink-2">指導教授：{{ entry.advisor }}</p>
            <p v-if="entry.publication" class="mt-1 text-2xs text-ink-2">{{ entry.publication }}</p>
            <p v-if="entry.detail" class="measure mt-2 text-2xs">{{ entry.detail }}</p>
          </template>

          <!-- The two things a row can point at. `evidence` was carried in
               the YAML from the start and rendered nowhere, so three awards
               had a public announcement on file that no reader could reach. -->
          <p v-if="entry.project && workSlugs.has(entry.project) || entry.evidence" class="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            <NuxtLink
              v-if="entry.project && workSlugs.has(entry.project)"
              :to="`/work/${entry.project}`"
              class="mono text-2xs"
            >
              案例研究
            </NuxtLink>
            <a v-if="entry.evidence" :href="entry.evidence" v-bind="linkAttrs(entry.evidence)" class="mono text-2xs">
              公告
            </a>
          </p>
        </div>
      </li>
    </ol>

    <!-- The older half of the record is folded, not dropped: it still ships in
         the HTML, so it is searchable and crawlable, it just does not make the
         reader scroll three extra screens to reach the end of the page. -->
    <p v-if="hidden" class="mt-6">
      <button type="button" class="more mono text-2xs" :aria-expanded="expanded" @click="expanded = !expanded">
        {{ expanded ? `收合 ${hidden} 筆` : `展開其餘 ${hidden} 筆（${oldestYear} – ${cutoff - 1}）` }}
      </button>
    </p>
  </section>
</template>

<script setup>
const props = defineProps({
  /** 0 = show everything. The homepage shows a slice; /resume shows all. */
  limit: { type: Number, default: 0 },
  heading: { type: String, default: '近期紀錄' },
  /**
   * How many calendar years stay open before the rest folds. 0 = no fold.
   *
   * Counted back from the newest entry rather than hardcoded, so it does not
   * quietly start folding this year's work the moment the year rolls over.
   */
  foldYears: { type: Number, default: 0 },
})

const { timeline, works } = useContent()
const workSlugs = new Set(works.map((w) => w.slug))

// A limited ledger is an index, so it drops the prose.
const compact = computed(() => props.limit > 0)
const entries = computed(() => (props.limit ? timeline.slice(0, props.limit) : timeline))

const expanded = ref(false)

const yearOf = (e) => Number(String(e?.date ?? '').slice(0, 4)) || 0

/** First year that is still shown unfolded. */
const cutoff = computed(() =>
  props.foldYears ? yearOf(entries.value[0]) - (props.foldYears - 1) : 0
)

/** Index of the first folded row. The timeline is newest first. */
const foldAt = computed(() => {
  if (!cutoff.value) return entries.value.length
  const i = entries.value.findIndex((e) => yearOf(e) < cutoff.value)
  return i === -1 ? entries.value.length : i
})

const hidden = computed(() => entries.value.length - foldAt.value)
const oldestYear = computed(() => yearOf(entries.value[entries.value.length - 1]))
</script>

<style scoped>
.more {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-full);
  color: var(--ink-2);
}

.more:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.ongoing {
  padding: 1px 7px;
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font-family: var(--font-mono);
  font-size: var(--step--1);
}
</style>
