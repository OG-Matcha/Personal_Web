<template>
  <!--
    The shelf's whole collection, stacked by year the way trophies pile up:
    one medal per award, the national first prizes in gold. Picking one puts
    it on the plaque above. The same facts as the record, nothing added.
  -->
  <div class="sh">
    <div class="sh-plaque" aria-live="polite">
      <span class="sh-medal sh-medal--big" :class="{ 'is-top': cur.top }" aria-hidden="true">{{ cur.top ? '1' : '' }}</span>
      <!-- Every award's text sits in the same cell and only the picked one shows, so the
           plaque is always as tall as the longest award and the shelf below never jumps. -->
      <div class="sh-plaque-texts">
        <div v-for="a in awards" :key="a.key" class="sh-plaque-text" :class="{ 'is-on': a.key === cur.key }" :aria-hidden="a.key !== cur.key">
          <p class="sh-when figures">{{ a.date.slice(0, 4) }}<template v-if="a.org"> · {{ a.org }}</template></p>
          <p class="sh-prize">{{ a.prize || a.comp }}</p>
          <p v-if="a.prize" class="sh-comp">{{ a.comp }}</p>
          <a v-if="a.evidence" :href="a.evidence" class="sh-src" target="_blank" rel="noopener" :tabindex="a.key === cur.key ? null : -1">{{ t.source }} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>

    <div class="sh-shelf" role="group" :aria-label="t.label">
      <div v-for="y in years" :key="y.year" class="sh-year">
        <div class="sh-stack">
          <button
            v-for="a in y.items"
            :key="a.key"
            type="button"
            class="sh-medal"
            :class="{ 'is-top': a.top, 'is-on': a.key === cur.key }"
            :aria-pressed="a.key === cur.key"
            :aria-label="`${a.comp.startsWith(a.date.slice(0, 4)) ? '' : a.date.slice(0, 4) + ' '}${a.prize ? `${a.comp} ${a.prize}` : a.comp}`"
            @click="pick = a.key"
          >
            {{ a.top ? '1' : '' }}
          </button>
        </div>
        <span class="sh-board" aria-hidden="true" />
        <span class="sh-y figures">{{ y.year }}</span>
      </div>
    </div>

    <p class="sh-key">
      <span class="sh-medal sh-medal--key is-top" aria-hidden="true">1</span>{{ t.top }}
      <span class="sh-medal sh-medal--key" aria-hidden="true" />{{ t.other }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  awards: { type: Array, required: true },
  en: { type: Boolean, default: false },
})

// Oldest year on the left, so the shelf fills up toward now.
const years = computed(() => {
  const by = new Map()
  for (const a of props.awards) {
    const y = a.date.slice(0, 4)
    if (!by.has(y)) by.set(y, [])
    by.get(y).push(a)
  }
  return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([year, items]) => ({ year, items: items.slice().sort((a, b) => Number(b.top) - Number(a.top)) }))
})

// Starts on the newest first prize: the one the stop's caption names.
const pick = ref(null)
const cur = computed(() => props.awards.find((a) => a.key === pick.value) ?? props.awards.find((a) => a.top) ?? props.awards[0])

const t = computed(() =>
  props.en
    ? { label: 'Awards by year', top: 'National first prize', other: 'Other award', source: 'Announcement' }
    : { label: '依年份排列的獎項', top: '全國首獎', other: '其他獎項', source: '看公告' }
)
</script>

<style scoped>
.sh {
  --gold: #d9a53a;
  --gold-hi: #f6d77d;
  --silver: #b9bcc2;
  --silver-hi: #eceef1;
  display: grid;
  gap: var(--sp-5);
}

/* ---- the plaque: what is picked ---- */

.sh-plaque {
  display: flex;
  gap: var(--sp-4);
  align-items: flex-start;
  padding: var(--sp-5);
  border-radius: var(--r-2);
  background: var(--surface);
  box-shadow: var(--shadow-1);
}

.sh-plaque-texts {
  display: grid;
  flex: 1;
  min-width: 0;
}

.sh-plaque-text {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  visibility: hidden;
  opacity: 0;
  transition: opacity 180ms var(--ease-entrance), visibility 0s 180ms;
}

.sh-plaque-text.is-on {
  visibility: visible;
  opacity: 1;
  transition: opacity 220ms var(--ease-entrance);
}

.sh-when {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.sh-prize {
  margin-top: var(--sp-1);
  font-family: var(--font-display);
  font-size: var(--step-1);
  font-weight: 800;
  line-height: 1.25;
  text-wrap: balance;
}

.sh-comp {
  margin-top: var(--sp-1);
  color: var(--ink-2);
}

.sh-src {
  display: inline-block;
  /* Always on the plaque's bottom line, wherever the award's text ends. */
  margin-top: auto;
  padding-top: var(--sp-3);
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--pop-ink);
}

/* ---- medals ---- */

.sh-medal {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, var(--silver-hi), var(--silver) 62%, color-mix(in srgb, var(--silver) 70%, #000));
  box-shadow:
    inset 0 0 0 3px color-mix(in srgb, var(--silver) 80%, #fff),
    0 2px 3px rgb(0 0 0 / 0.18);
  color: #6b5216;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 900;
  cursor: pointer;
  transition:
    transform 260ms var(--ease-entrance),
    box-shadow 260ms var(--ease-entrance);
}

.sh-medal.is-top {
  background: radial-gradient(circle at 34% 30%, var(--gold-hi), var(--gold) 60%, color-mix(in srgb, var(--gold) 72%, #000));
  box-shadow:
    inset 0 0 0 3px color-mix(in srgb, var(--gold) 70%, #fff),
    0 2px 4px rgb(120 80 10 / 0.3);
}

button.sh-medal:hover {
  transform: translateY(-3px);
}

button.sh-medal.is-on {
  transform: translateY(-4px) scale(1.12);
  box-shadow:
    inset 0 0 0 3px color-mix(in srgb, var(--gold) 70%, #fff),
    0 0 0 3px var(--surface),
    0 0 0 5px var(--pop),
    0 6px 10px rgb(0 0 0 / 0.2);
}

button.sh-medal:not(.is-top).is-on {
  box-shadow:
    inset 0 0 0 3px color-mix(in srgb, var(--silver) 80%, #fff),
    0 0 0 3px var(--surface),
    0 0 0 5px var(--pop),
    0 6px 10px rgb(0 0 0 / 0.2);
}

.sh-medal--big {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.4rem;
  cursor: default;
}

.sh-medal--key {
  display: inline-grid;
  width: 1.1rem;
  height: 1.1rem;
  margin-inline: var(--sp-3) var(--sp-1);
  font-size: 0.6rem;
  vertical-align: -0.2em;
  cursor: default;
}

.sh-medal--key:first-child {
  margin-left: 0;
}

/* ---- the shelf: one column a year ---- */

.sh-shelf {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(3.25rem, 1fr);
  align-items: end;
  overflow-x: auto;
  padding-top: var(--sp-3);
  scrollbar-width: none;
}

.sh-year {
  display: grid;
  justify-items: center;
}

.sh-stack {
  /* Bottom up, five high; a sixth starts the next column, as on a real shelf. */
  display: flex;
  flex-direction: column-reverse;
  flex-wrap: wrap;
  align-content: center;
  gap: 4px;
  max-height: calc(5 * 2.25rem + 4 * 4px + 2px);
  padding-bottom: 2px;
}

.sh-board {
  justify-self: stretch;
  height: 10px;
  background: linear-gradient(#c89a64, #a8774a);
  box-shadow: 0 4px 6px -2px rgb(60 36 16 / 0.35);
}

.sh-year:first-child .sh-board {
  border-radius: 3px 0 0 3px;
}

.sh-year:last-child .sh-board {
  border-radius: 0 3px 3px 0;
}

.sh-y {
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.sh-key {
  font-size: var(--step--1);
  color: var(--ink-2);
}

@media (prefers-reduced-motion: reduce) {
  .sh-medal,
  .sh-plaque-text,
  .sh-plaque-text.is-on {
    transition: none;
  }

  button.sh-medal:hover,
  button.sh-medal.is-on {
    transform: none;
  }
}
</style>
