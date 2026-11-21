<template>
  <!--
    The stack on the desk, fanned out: each grant's bound report, its cover
    set the way the 3D ones are (studio/desk/make_textures.py), but in HTML,
    so it reads in either language and at any size. Picking one lifts it off
    the stack and opens its page beside it.
  -->
  <div class="rp">
    <div class="rp-fan" role="group" :aria-label="t.label">
      <button
        v-for="(g, i) in grants"
        :key="g.key"
        type="button"
        class="rp-cover"
        :class="{ 'is-on': i === at }"
        :style="{ '--i': i, '--n': grants.length, '--band': BANDS[i % BANDS.length] }"
        :aria-pressed="i === at"
        @click="at = i"
      >
        <span class="rp-band">
          <span class="rp-agency">{{ t.agency }}</span>
          <span class="rp-kind">{{ yearLabel(g) }}</span>
        </span>
        <span class="rp-title">{{ g.title }}</span>
        <span class="rp-foot">{{ t.school }}</span>
      </button>
    </div>

    <div class="rp-page" aria-live="polite">
      <p class="rp-when figures">{{ g.date.slice(0, 4) }}</p>
      <p class="rp-page-title">{{ g.title }}</p>
      <p class="rp-pub">{{ g.publication }}</p>
      <p v-if="g.detail" class="rp-detail">{{ g.detail }}</p>
      <p class="rp-count figures">{{ at + 1 }} / {{ grants.length }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  grants: { type: Array, required: true },
  en: { type: Boolean, default: false },
})

// The cover bands of the three reports on the desk, in the same order.
const BANDS = ['#1f4e8c', '#7a262e', '#266048']

const at = ref(0)
const g = computed(() => props.grants[at.value] ?? props.grants[0])

// The grant year as the grant itself names it ("114 年度…"), not derived from
// the record's date, which is when the work ended.
const yearLabel = (x) => {
  const roc = /(\d{3}) 年度/.exec(x.publication ?? '')?.[1]
  if (props.en) return 'Undergraduate research grant'
  return roc ? `${roc} 年度大專學生研究計畫` : '大專學生研究計畫'
}

const t = computed(() =>
  props.en
    ? { label: 'The research reports', agency: 'National Science and Technology Council', school: 'National Central University · Information Management' }
    : { label: '研究計畫報告', agency: '國家科學及技術委員會', school: '國立中央大學 資訊管理學系' }
)
</script>

<style scoped>
.rp {
  display: grid;
  gap: var(--sp-5);
  align-items: start;
}

@media (min-width: 720px) {
  .rp {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  }
}

/* ---- the fan of covers ---- */

.rp-fan {
  position: relative;
  height: clamp(15rem, 52vw, 19rem);
  margin-inline: auto;
  width: min(100%, 26rem);
}

.rp-cover {
  --w: clamp(7.5rem, 26vw, 10rem);
  position: absolute;
  bottom: 0;
  left: calc(50% - var(--w) / 2);
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: var(--w);
  aspect-ratio: 1 / 1.414;
  padding: 0;
  border: 0;
  border-radius: 3px 5px 5px 3px;
  background: #fafaf7;
  box-shadow:
    inset 3px 0 0 rgb(0 0 0 / 0.08),
    0 1px 2px rgb(0 0 0 / 0.15),
    0 10px 18px -8px rgb(40 30 20 / 0.45);
  color: #1e1e22;
  text-align: left;
  cursor: pointer;
  transform-origin: 50% 100%;
  /* fanned around the middle one */
  --x: calc((var(--i) - (var(--n) - 1) / 2) * 62%);
  --r: calc((var(--i) - (var(--n) - 1) / 2) * 8deg);
  transform: translateX(var(--x)) rotate(var(--r));
  transition: transform 420ms var(--ease-entrance), box-shadow 420ms var(--ease-entrance);
  z-index: var(--i);
}

.rp-cover:hover:not(.is-on) {
  transform: translateX(var(--x)) rotate(var(--r)) translateY(-6px);
}

/* Picked: lifted where it lies, straightened, on top; the others stay
   half in view, so any of them can still be picked. */
.rp-cover.is-on {
  z-index: 9;
  transform: translateX(var(--x)) translateY(-1.25rem) scale(1.06);
  box-shadow:
    inset 3px 0 0 rgb(0 0 0 / 0.08),
    0 0 0 3px var(--surface),
    0 0 0 5px var(--pop),
    0 22px 30px -12px rgb(40 30 20 / 0.5);
}

.rp-band {
  display: grid;
  gap: 2px;
  padding: 10% 8% 8%;
  border-radius: 3px 5px 0 0;
  background: var(--band);
  color: #fff;
}

.rp-agency {
  font-size: 0.56rem;
  font-weight: 700;
  line-height: 1.25;
}

.rp-kind {
  font-size: 0.5rem;
  opacity: 0.85;
}

.rp-title {
  padding: 10% 8% 0;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.4;
}

.rp-foot {
  padding: 0 8% 9%;
  font-size: 0.46rem;
  color: #55555b;
}

/* ---- the open page ---- */

.rp-page {
  padding: var(--sp-5);
  border-radius: var(--r-2);
  background: var(--surface);
  box-shadow: var(--shadow-1);
}

.rp-when {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.rp-page-title {
  margin-top: var(--sp-1);
  font-family: var(--font-display);
  font-size: var(--step-1);
  font-weight: 800;
  line-height: 1.3;
  text-wrap: balance;
}

.rp-pub {
  margin-top: var(--sp-3);
  color: var(--ink-2);
}

.rp-detail {
  margin-top: var(--sp-1);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.rp-count {
  margin-top: var(--sp-4);
  font-size: var(--step--1);
  color: var(--ink-3);
}

@media (prefers-reduced-motion: reduce) {
  .rp-cover {
    transition: none;
  }
}
</style>
