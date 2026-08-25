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
        v-for="entry in entries"
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

          <p v-if="entry.project && workSlugs.has(entry.project)" class="mt-2">
            <NuxtLink :to="`/work/${entry.project}`" class="mono text-2xs">案例研究</NuxtLink>
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
const props = defineProps({
  /** 0 = show everything. The homepage shows a slice; /resume shows all. */
  limit: { type: Number, default: 0 },
  heading: { type: String, default: '近期紀錄' },
})

const { timeline, works } = useContent()
const workSlugs = new Set(works.map((w) => w.slug))

// A limited ledger is an index, so it drops the prose.
const compact = computed(() => props.limit > 0)
const entries = computed(() => (props.limit ? timeline.slice(0, props.limit) : timeline))
</script>

<style scoped>
.ongoing {
  padding: 1px 7px;
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font-family: var(--font-mono);
  font-size: var(--step--1);
}
</style>
