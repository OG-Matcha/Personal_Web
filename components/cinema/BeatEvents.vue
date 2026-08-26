<template>
  <div class="shell grid w-full gap-6 md:grid-cols-12">
    <div class="beat-copy md:col-span-6">
      <p class="kicker mono">
        <span class="idx">{{ pad(index + 1) }}</span>
        <span class="sep">/</span>{{ pad(total) }}
        <span class="range">{{ range }}</span>
      </p>

      <h2 class="mt-5 font-display text-4xl leading-tight md:text-5xl">{{ copy.title }}</h2>

      <p v-if="copy.lede" class="mt-5 max-w-measure-han text-base text-ink-2">{{ copy.lede }}</p>

      <!-- Which lanes fired in this window, and how hard. Read straight off
           the timeline, so the bars can never overstate a year. -->
      <ul v-if="active.length" class="lanes mt-7">
        <li v-for="l in active" :key="l.id" class="lane">
          <span class="lane-name mono">{{ l.label }}</span>
          <span class="lane-bar" :style="{ '--fill': `${l.share * 100}%` }" />
          <span class="lane-n mono">{{ l.n }}</span>
        </li>
      </ul>

      <ol v-if="shown.length" class="events mt-7">
        <li v-for="e in shown" :key="e.date + e.title" class="event">
          <time class="mono">{{ e.date.replace('-', '.') }}</time>
          <span class="event-title">{{ shortTitle(e) }}</span>
        </li>
      </ol>

      <p v-if="rest > 0" class="mt-4 text-sm text-ink-3">
        另外 {{ rest }} 筆在下方年表。
      </p>

      <p v-if="copy.note" class="mt-4 text-sm text-ink-3">{{ copy.note }}</p>

      <div v-if="isLast" class="mt-8 flex flex-wrap gap-3">
        <a class="btn btn--pop" :href="`mailto:${site.contact.email}`">寄信給我</a>
        <a class="btn" :href="site.contact.github" v-bind="linkAttrs(site.contact.github, { me: true })">GitHub</a>
        <a class="btn" :href="site.contact.linkedin" v-bind="linkAttrs(site.contact.linkedin, { me: true })">LinkedIn</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LANES, shortTitle, tOf } from '~/composables/useFilm'

const props = defineProps({
  id: { type: String, required: true },
  index: { type: Number, required: true },
  total: { type: Number, default: 5 },
  from: { type: String, required: true },
  to: { type: String, required: true },
})

const { timeline, beatCopy, site } = useContent()

/**
 * How many events a beat lists before it defers to the ledger.
 *
 * Four, not five: the copy is a fixed overlay, so anything past the viewport
 * is simply unreachable rather than scrollable. 2025 alone has sixteen -
 * the beat's job is to say how many, not to be the list.
 */
const MAX_EVENTS = 4

const copy = computed(() => beatCopy.find((b) => b.id === props.id) ?? { title: props.id })

const range = computed(() => `${fmt(props.from)} — ${fmt(props.to)}`)

const inRange = computed(() => {
  const a = tOf(props.from)
  const b = tOf(props.to)
  return timeline
    .filter((e) => {
      const t = tOf(e.date)
      return t >= a - 1e-6 && t <= b + 1e-6
    })
    .sort((x, y) => (x.date < y.date ? -1 : 1))
})

/**
 * Rank before truncating: a beat that lists five 榮譽 and hides the 金獎 is
 * technically accurate and completely wrong.
 */
const RANK = { award: 0, grant: 0, role: 1, product: 1, research: 2, education: 3, honor: 4 }

const shown = computed(() =>
  [...inRange.value]
    .sort((a, b) => (RANK[a.kind] ?? 5) - (RANK[b.kind] ?? 5))
    .slice(0, MAX_EVENTS)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
)

const rest = computed(() => Math.max(0, inRange.value.length - shown.value.length))

const active = computed(() => {
  const counts = new Map()
  for (const e of inRange.value) {
    const l = e.lane
    if (!l || l === 'academic') continue
    counts.set(l, (counts.get(l) ?? 0) + 1)
  }
  const max = Math.max(1, ...counts.values())
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => ({ id, n, label: LANES[id]?.label ?? id, share: n / max }))
})

const isLast = computed(() => props.index === props.total - 1)

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmt(d) {
  return String(d).replace('-', '.')
}
</script>

<style scoped>
.kicker {
  display: flex;
  align-items: baseline;
  gap: 0.35em;
  font-size: var(--step--2);
  letter-spacing: 0.2em;
  color: var(--ink-3);
}

.idx {
  color: var(--ink);
}

.range {
  margin-left: 0.9em;
  letter-spacing: 0.12em;
}

.lanes {
  display: grid;
  gap: var(--sp-2);
  max-width: 22rem;
}

.lane {
  display: grid;
  grid-template-columns: 3.2em 1fr 1.8em;
  align-items: center;
  gap: var(--sp-3);
  font-size: var(--step--2);
  color: var(--ink-2);
}

.lane-bar {
  position: relative;
  height: 2px;
  background: var(--rule);
}

.lane-bar::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill);
  background: var(--pop);
}

.lane-n {
  text-align: right;
  color: var(--ink-3);
}

.events {
  display: grid;
  gap: var(--sp-2);
  max-width: var(--measure-han);
}

.event {
  display: grid;
  grid-template-columns: 4.6em 1fr;
  gap: var(--sp-3);
  align-items: baseline;
  font-size: var(--step--1);
  color: var(--ink-2);
}

.event time {
  color: var(--ink-3);
  font-size: var(--step--2);
}

.event-title {
  color: var(--ink);
}
</style>
