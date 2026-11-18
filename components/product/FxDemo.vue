<template>
  <!--
    Taobao Exchange, small enough to play with: a row of listings priced in
    RMB, and a switch that does what the extension does - put the NT$ figure
    right next to each price. The listings and the rate are made up.
  -->
  <div class="fx-card">
    <div class="fx-bar">
      <label class="fx-switch">
        <input v-model="on" type="checkbox" />
        <span class="fx-track" aria-hidden="true"><span class="fx-knob" /></span>
        <span class="fx-switch-label">{{ t.toggle }}</span>
      </label>
      <label class="fx-rate">
        <span>{{ t.rate }}</span>
        <input v-model.number="rate" type="number" inputmode="decimal" min="3" max="6" step="0.01" class="figures" />
        <span>NTD</span>
      </label>
    </div>

    <ul class="fx-items">
      <li v-for="it in items" :key="it.id" class="fx-item">
        <span class="fx-pic" :style="{ background: it.tint }" aria-hidden="true">{{ it.emoji }}</span>
        <span class="fx-name">{{ it.name }}</span>
        <span class="fx-price figures">
          <span class="fx-cny">¥{{ it.cny.toFixed(1) }}</span>
          <Transition name="fx-pop">
            <span v-if="on" class="fx-twd">NT${{ twd(it.cny) }}</span>
          </Transition>
        </span>
      </li>
    </ul>

    <p class="fx-note">{{ t.note }}</p>
  </div>
</template>

<script setup>
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

const on = ref(false)
const rate = ref(4.38)
const twd = (cny) => {
  const r = Number(rate.value) > 0 ? Number(rate.value) : 4.38
  return (Math.round(cny * r * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const items = computed(() => [
  { id: 'bag', emoji: '👜', tint: '#fde7d4', cny: 299, name: E.value ? 'Canvas tote bag' : '帆布托特包' },
  { id: 'lamp', emoji: '💡', tint: '#fff3c4', cny: 89.9, name: E.value ? 'Clip-on desk lamp' : '夾式檯燈' },
  { id: 'mug', emoji: '☕', tint: '#e3efe6', cny: 35.8, name: E.value ? 'Enamel mug' : '琺瑯馬克杯' },
  { id: 'kb', emoji: '⌨️', tint: '#e5e9f6', cny: 459, name: E.value ? 'Mechanical keyboard' : '機械鍵盤' },
])

const t = computed(() =>
  E.value
    ? {
        toggle: 'Taobao Exchange on',
        rate: '1 CNY =',
        note: 'Made-up listings and an example rate. The extension fetches the real rate every day.',
      }
    : {
        toggle: '開啟淘換算',
        rate: '1 CNY =',
        note: '商品和匯率都是示意；實際的擴充套件每天會自己抓最新匯率。',
      }
)
</script>

<style scoped>
.fx-card {
  display: grid;
  gap: var(--sp-6);
  margin-top: var(--sp-6);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-2);
}

.fx-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
}

.fx-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
  min-height: 44px;
  font-weight: 700;
  cursor: pointer;
}

.fx-switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.fx-track {
  position: relative;
  width: 3.25rem;
  height: 1.9rem;
  border-radius: var(--r-full);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--rule-strong);
  transition: background-color var(--dur-2);
}

.fx-knob {
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--ink-3);
  transition:
    transform var(--dur-2) var(--ease-entrance),
    background-color var(--dur-2);
}

.fx-switch input:checked + .fx-track {
  background: #f86b0d;
  box-shadow: none;
}

.fx-switch input:checked + .fx-track .fx-knob {
  transform: translateX(1.35rem);
  background: #fff;
}

.fx-switch input:focus-visible + .fx-track {
  outline: 2px solid var(--pop);
  outline-offset: 3px;
}

.fx-rate {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.fx-rate input {
  width: 5.5rem;
  min-height: 44px;
  padding: 0 var(--sp-3);
  border: 0;
  border-radius: var(--r-2);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--rule);
  color: var(--ink);
  font: inherit;
  font-weight: 700;
}

.fx-items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-3);
}

@media (min-width: 640px) {
  .fx-items {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--sp-4);
  }
}

.fx-item {
  display: grid;
  gap: var(--sp-2);
  padding: var(--sp-3);
  border-radius: var(--r-2);
  background: var(--bg);
  box-shadow: inset 0 0 0 1px var(--rule);
}

.fx-pic {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: calc(var(--r-2) - 4px);
  font-size: clamp(2rem, 8vw, 2.75rem);
}

.fx-name {
  font-size: var(--step--1);
  font-weight: 600;
}

.fx-price {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
  min-height: 2rem;
}

.fx-cny {
  font-size: var(--step-1);
  font-weight: 800;
  color: #f2520d;
}

.fx-twd {
  padding: 0.15rem 0.55rem;
  border-radius: var(--r-full);
  background: #ffc21a;
  color: #2b1d00;
  font-size: var(--step--1);
  font-weight: 800;
}

.fx-pop-enter-active {
  transition:
    opacity var(--dur-2) var(--ease-entrance),
    transform var(--dur-2) var(--ease-entrance);
}

.fx-pop-enter-from {
  opacity: 0;
  transform: translateX(-6px) scale(0.92);
}

.fx-note {
  font-size: var(--step--1);
  color: var(--ink-3);
}

@media (prefers-reduced-motion: reduce) {
  .fx-track,
  .fx-knob,
  .fx-pop-enter-active {
    transition: none;
  }
}
</style>
