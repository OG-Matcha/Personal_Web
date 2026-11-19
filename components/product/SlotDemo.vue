<template>
  <!--
    MedaLink's scheduling idea, small enough to play with: a treatment is a
    chain of steps, each step needs its own people, room and machine, and a
    time is offered only when every one of them is free for its step.
    The day and its bookings are made up; the rule is the product's.
  -->
    <div class="sd-card">
      <fieldset class="sd-pick">
        <legend>{{ t.pick }}</legend>
        <label v-for="(tr, i) in treatments" :key="tr.id" class="sd-chip" :class="{ 'is-on': which === i }">
          <input v-model="which" type="radio" name="sd-treat" :value="i" />
          <span class="sd-chip-name">{{ tr.name }}</span>
          <span class="sd-chip-steps">{{ tr.steps.map((s) => `${s.len * 30}′ ${s.need.map((r) => res[r].short).join('＋')}`).join(' → ') }}</span>
        </label>
      </fieldset>

      <p class="sd-swipe" aria-hidden="true">{{ t.swipe }}</p>
      <!-- Scrolls sideways on a phone; focusable so the arrow keys can scroll it too. -->
      <div class="sd-grid-wrap" :class="{ 'is-end': atEnd }" tabindex="0" role="region" :aria-label="t.day" @scroll.passive="onScroll">
        <div class="sd-grid" role="img" :aria-label="gridLabel" :style="{ '--n': SLOTS }">
          <span class="sd-corner" aria-hidden="true" />
          <span v-for="s in SLOTS" :key="'h' + s" class="sd-time figures" aria-hidden="true">{{ s % 2 === 1 ? clock(s - 1) : '' }}</span>
          <template v-for="(r, ri) in res" :key="r.id">
            <span class="sd-res" :class="{ 'is-needed': needed.has(ri) }" aria-hidden="true">{{ r.name }}</span>
            <span
              v-for="s in SLOTS"
              :key="r.id + s"
              class="sd-cell"
              :class="cellClass(ri, s - 1)"
              aria-hidden="true"
            />
          </template>
        </div>
      </div>

      <div class="sd-out">
        <p class="sd-count" aria-live="polite">{{ t.found(free.length) }}</p>
        <ul class="sd-times">
          <li v-for="s in free" :key="s">
            <button type="button" class="sd-time-btn figures" :class="{ 'is-on': chosen === s }" :aria-pressed="chosen === s" @click="chosen = s">
              {{ clock(s) }}
            </button>
          </li>
        </ul>
        <p class="sd-note">{{ t.note }}</p>
      </div>
    </div>
</template>

<script setup>
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

/** 10:00 to 18:00 in half hours. */
const SLOTS = 16
const clock = (i) => `${10 + Math.floor(i / 2)}:${i % 2 ? '30' : '00'}`

const res = computed(() =>
  E.value
    ? [
        { id: 'dr', name: 'Doctor', short: 'doctor' },
        { id: 'as', name: 'Assistant', short: 'assistant' },
        { id: 'rm', name: 'Room 2', short: 'room' },
        { id: 'lz', name: 'Laser', short: 'laser' },
      ]
    : [
        { id: 'dr', name: '醫師', short: '醫師' },
        { id: 'as', name: '助理', short: '助理' },
        { id: 'rm', name: '2 號診間', short: '診間' },
        { id: 'lz', name: '雷射儀', short: '雷射' },
      ]
)

/** Already booked, by resource index: slot numbers. Invented for the demo. */
const busy = [
  [2, 3, 6, 10],
  [0, 4, 5, 12],
  [3, 8, 9, 14],
  [1, 2, 7, 13, 14],
].map((a) => new Set(a))

/** Each step: how many half hours, and which resources (by index). */
const treatments = computed(() => [
  { id: 'consult', name: E.value ? 'Consultation' : '初診諮詢', steps: [{ len: 1, need: [0, 2] }] },
  {
    id: 'laser',
    name: E.value ? 'Laser treatment' : '皮秒雷射',
    steps: [
      { len: 1, need: [1, 2] },
      { len: 1, need: [0, 2, 3] },
    ],
  },
  { id: 'follow', name: E.value ? 'Post-op check' : '術後回診', steps: [{ len: 1, need: [1, 2] }] },
])

const which = ref(1)
// On a phone the day is wider than the card: fade the right edge until the
// grid has been scrolled to its end, and say it can be swiped.
const atEnd = ref(false)
const onScroll = (e) => {
  const el = e.currentTarget
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}
const chosen = ref(null)
const tr = computed(() => treatments.value[which.value])
const needed = computed(() => new Set(tr.value.steps.flatMap((s) => s.need)))

/** For a start slot: every (resource, slot) the treatment would hold, or null if it does not fit. */
function plan(start) {
  const held = []
  let at = start
  for (const step of tr.value.steps) {
    for (let k = 0; k < step.len; k++, at++) {
      if (at >= SLOTS) return null
      for (const r of step.need) {
        if (busy[r].has(at)) return null
        held.push(`${r}:${at}`)
      }
    }
  }
  return new Set(held)
}

const free = computed(() => [...Array(SLOTS).keys()].filter((s) => plan(s)))
watch(which, () => (chosen.value = null))
const shown = computed(() => (chosen.value != null ? plan(chosen.value) : null))

function cellClass(r, s) {
  return {
    'is-busy': busy[r].has(s),
    'is-dim': !needed.value.has(r),
    'is-held': shown.value?.has(`${r}:${s}`),
  }
}

const t = computed(() =>
  E.value
    ? {
        pick: 'Treatment',
        found: (n) => (n ? `${n} times fit today` : 'Nothing fits today'),
        note: 'A made-up day at a made-up clinic. The rule is the real one.',
        swipe: 'Swipe for the rest of the day →',
        day: 'The day, slot by slot',
      }
    : {
        pick: '療程',
        found: (n) => (n ? `今天有 ${n} 個時段排得進去` : '今天排不進去'),
        note: '診所和預約都是虛構的示意；排時段的規則是產品裡真的那一套。',
        swipe: '左右滑動看整天 →',
        day: '這一天的時段表',
      }
)

const gridLabel = computed(() =>
  E.value
    ? `Bookings from 10:00 to 18:00 for ${res.value.map((r) => r.name).join(', ')}.`
    : `10:00 到 18:00 的預約：${res.value.map((r) => r.name).join('、')}。`
)
</script>

<style scoped>
/* Follows the card's width, not the window's (it also runs on the desk's
   tablet); 530px of content is the card in a 640px window. */
.sd-card {
  container: sd / inline-size;
  display: grid;
  gap: var(--sp-6);
  margin-top: var(--sp-6);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-2);
}

.sd-pick {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  border: 0;
  padding: 0;
  margin: 0;
}

.sd-pick legend {
  margin-bottom: var(--sp-3);
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink-3);
}

.sd-chip {
  display: grid;
  gap: 2px;
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-2);
  box-shadow: inset 0 0 0 1px var(--rule);
  cursor: pointer;
  transition:
    box-shadow var(--dur-2) var(--ease-entrance),
    background-color var(--dur-2);
}

.sd-chip input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.sd-chip:has(input:focus-visible) {
  outline: 2px solid var(--pop);
  outline-offset: 2px;
}

.sd-chip.is-on {
  background: var(--surface-2);
  box-shadow: inset 0 0 0 2px var(--pop);
}

.sd-chip-name {
  font-weight: 700;
}

.sd-chip-steps {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.sd-grid-wrap {
  overflow-x: auto;
  border-radius: var(--r-2);
}

.sd-grid-wrap:focus-visible {
  outline: 2px solid var(--pop-ink);
  outline-offset: 2px;
}

.sd-swipe {
  display: none;
  margin-bottom: calc(-1 * var(--sp-4));
  font-size: var(--step--1);
  color: var(--ink-3);
}

@container sd (max-width: 530px) {
  .sd-swipe {
    display: block;
  }

  .sd-grid-wrap:not(.is-end) {
    mask-image: linear-gradient(90deg, #000 80%, transparent);
  }
}

.sd-grid {
  display: grid;
  grid-template-columns: 5.5rem repeat(var(--n), minmax(1.5rem, 1fr));
  gap: 3px;
  min-width: 34rem;
}

.sd-time {
  font-size: 0.75rem;
  color: var(--ink-3);
  white-space: nowrap;
}

.sd-res {
  align-self: center;
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--ink-3);
  transition: color var(--dur-2);
}

.sd-res.is-needed {
  color: var(--ink);
}

.sd-cell {
  height: 2.25rem;
  border-radius: 5px;
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--rule);
  transition:
    background-color var(--dur-2) var(--ease-entrance),
    opacity var(--dur-2),
    transform var(--dur-2) var(--ease-entrance);
}

.sd-cell.is-busy {
  background: repeating-linear-gradient(135deg, var(--rule-strong) 0 2px, transparent 2px 7px), var(--surface-2);
  box-shadow: none;
}

.sd-cell.is-dim {
  opacity: 0.35;
}

.sd-cell.is-held {
  background: var(--pop);
  box-shadow: none;
  transform: scaleY(1.08);
}

.sd-count {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-1);
}

.sd-times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
}

.sd-time-btn {
  min-width: 4.5rem;
  min-height: 44px;
  padding: 0 var(--sp-4);
  border: 0;
  border-radius: var(--r-full);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--rule);
  color: var(--ink);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--dur-1);
}

.sd-time-btn:hover {
  background: var(--bg);
}

.sd-time-btn.is-on {
  background: var(--pop);
  color: var(--on-pop);
  box-shadow: none;
}

.sd-note {
  margin-top: var(--sp-4);
  font-size: var(--step--1);
  color: var(--ink-3);
}

@media (prefers-reduced-motion: reduce) {
  .sd-cell,
  .sd-chip {
    transition: none;
  }
  .sd-cell.is-held {
    transform: none;
  }
}
</style>
