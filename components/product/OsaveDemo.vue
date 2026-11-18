<template>
  <!--
    oSave's monthly health check, small enough to play with: drag a month's
    money around and watch the six indicators and the score move. The six
    names are the ones the app shows; the thresholds here are round example
    values, not the app's own scoring.
  -->
  <div class="os-card">
    <div class="os-presets" role="group" :aria-label="t.presetsLabel">
      <button v-for="p in presets" :key="p.id" type="button" class="os-preset" :class="{ 'is-on': preset === p.id }" @click="use(p)">
        {{ p.label }}
      </button>
    </div>

    <div class="os-body">
      <div class="os-inputs">
        <label v-for="f in fields" :key="f.key" class="os-field">
          <span class="os-field-head">
            <span>{{ f.label }}</span>
            <output class="figures">{{ f.unit === '%' ? `${m[f.key]}%` : `$${m[f.key].toLocaleString('en-US')}` }}</output>
          </span>
          <input v-model.number="m[f.key]" type="range" :min="f.min" :max="f.max" :step="f.step" @input="preset = ''" />
          <span class="os-field-hint">{{ f.hint }}</span>
        </label>
      </div>

      <div class="os-result" aria-live="polite">
        <div class="os-score">
          <span class="os-score-n figures" :style="{ color: bandColor }">{{ total }}</span>
          <span class="os-score-of">/ 100</span>
          <span class="os-band" :style="{ background: bandColor }">{{ bandLabel }}</span>
        </div>

        <svg class="os-radar" viewBox="-130 -118 260 236" role="img" :aria-label="radarLabel">
          <polygon v-for="r in [1, 0.75, 0.5, 0.25]" :key="r" :points="ring(r)" class="os-ring" />
          <line v-for="(a, i) in axes" :key="a.key" x1="0" y1="0" :x2="pt(i, 1)[0]" :y2="pt(i, 1)[1]" class="os-axis" />
          <polygon :points="shape" class="os-shape" />
          <circle v-for="(a, i) in axes" :key="`d${a.key}`" :cx="pt(i, a.score / 100)[0]" :cy="pt(i, a.score / 100)[1]" r="3.5" class="os-dot" />
          <text v-for="(a, i) in axes" :key="`t${a.key}`" :x="pt(i, 1.24)[0]" :y="pt(i, 1.24)[1]" class="os-label" :class="{ 'is-low': a.key === worst.key }">
            {{ a.name }} {{ a.score }}
          </text>
        </svg>

        <p class="os-tip">
          <strong>{{ t.worst }}{{ worst.name }}</strong>
          {{ worst.tip }}
        </p>
      </div>
    </div>

    <p class="os-note">{{ t.note }}</p>
  </div>
</template>

<script setup>
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

const m = reactive({ income: 42000, fixed: 12000, living: 9000, wants: 7000, debt: 3000, budget: 80 })
const preset = ref('first')

const presets = computed(() => [
  { id: 'first', label: E.value ? 'First job' : '剛出社會', v: { income: 42000, fixed: 12000, living: 9000, wants: 7000, debt: 3000, budget: 80 } },
  { id: 'saver', label: E.value ? 'Saving hard' : '認真存錢', v: { income: 55000, fixed: 13000, living: 11000, wants: 4000, debt: 0, budget: 95 } },
  { id: 'card', label: E.value ? 'Card bill shock' : '卡費爆了', v: { income: 42000, fixed: 15000, living: 11000, wants: 13000, debt: 9000, budget: 55 } },
])
function use(p) {
  Object.assign(m, p.v)
  preset.value = p.id
}

const fields = computed(() =>
  E.value
    ? [
        { key: 'income', label: 'Income this month', hint: 'Salary, part-time work', min: 20000, max: 100000, step: 1000 },
        { key: 'fixed', label: 'Fixed costs', hint: 'Rent, phone plan, insurance', min: 0, max: 40000, step: 500 },
        { key: 'living', label: 'Everyday needs', hint: 'Meals, transport, groceries', min: 0, max: 40000, step: 500 },
        { key: 'wants', label: 'Nice-to-haves', hint: 'Eating out, shopping, games', min: 0, max: 40000, step: 500 },
        { key: 'debt', label: 'Repayments', hint: 'Loans, card instalments', min: 0, max: 30000, step: 500 },
        { key: 'budget', label: 'Budget kept', hint: 'How close each category stayed to plan', min: 0, max: 100, step: 5, unit: '%' },
      ]
    : [
        { key: 'income', label: '這個月收入', hint: '薪水、打工', min: 20000, max: 100000, step: 1000 },
        { key: 'fixed', label: '固定支出', hint: '房租、電信費、保險', min: 0, max: 40000, step: 500 },
        { key: 'living', label: '生活必要', hint: '三餐、交通、日用品', min: 0, max: 40000, step: 500 },
        { key: 'wants', label: '非必要', hint: '聚餐、購物、遊戲', min: 0, max: 40000, step: 500 },
        { key: 'debt', label: '還款', hint: '貸款、卡費分期', min: 0, max: 30000, step: 500 },
        { key: 'budget', label: '預算守住幾成', hint: '各類別有沒有花在預算內', min: 0, max: 100, step: 5, unit: '%' },
      ]
)

// A ratio scored on a straight line between a "good" point (100) and a
// "worry" point (0). Example values for the demo only.
const line = (v, good, worry) => Math.round(Math.min(100, Math.max(0, ((v - worry) / (good - worry)) * 100)))

const axes = computed(() => {
  const inc = Math.max(1, m.income)
  const spend = m.fixed + m.living + m.wants
  const out = spend + m.debt
  const names = E.value
    ? ['Surplus', 'Needs', 'Wants', 'Fixed', 'Debt', 'Budget']
    : ['收支結餘', '必要支出', '非必要支出', '固定支出', '債務負擔', '預算達成']
  const tips = E.value
    ? [
        'Less than you earn is going out. Start with the biggest category below.',
        'Needs take most of the income. Look at the meals and transport that repeat every day.',
        'Treats are a big share of the spending. Pick one category to cap next month.',
        'Rent and plans lock in much of each pay cheque. Check subscriptions you no longer use.',
        'Repayments eat into the month. Clear the highest-interest one first.',
        'Several categories went over plan. Set budgets you can actually keep.',
      ]
    : [
        '花出去的快追上賺進來的。先從下面最大的那一類開始收。',
        '必要開銷吃掉大半收入。先看每天重複的三餐和交通。',
        '非必要的花費占比偏高。挑一類，下個月先設上限。',
        '房租和月費把收入綁得很緊。先檢查沒在用的訂閱。',
        '還款壓力大。先還利率最高的那一筆。',
        '好幾類都超出預算。把預算設成做得到的數字。',
      ]
  const scores = [
    line((m.income - out) / inc, 0.25, 0),
    line((m.fixed + m.living) / inc, 0.45, 0.8),
    line(spend > 0 ? m.wants / spend : 0, 0.1, 0.45),
    line(m.fixed / inc, 0.25, 0.6),
    line(m.debt / inc, 0.05, 0.4),
    m.budget,
  ]
  return ['balance', 'needs', 'wants', 'fixed', 'debt', 'budget'].map((key, i) => ({ key, name: names[i], score: scores[i], tip: tips[i] }))
})

const total = computed(() => Math.round(axes.value.reduce((s, a) => s + a.score, 0) / axes.value.length))
const worst = computed(() => axes.value.reduce((w, a) => (a.score < w.score ? a : w)))
const bandLabel = computed(() => (total.value >= 70 ? (E.value ? 'Good' : '好') : total.value >= 40 ? (E.value ? 'Fair' : '尚可') : E.value ? 'Poor' : '差'))
const bandColor = computed(() => (total.value >= 70 ? 'var(--os-good)' : total.value >= 40 ? 'var(--os-fair)' : 'var(--os-poor)'))

const R = 92
const pt = (i, r) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 6
  return [+(Math.cos(a) * R * r).toFixed(1), +(Math.sin(a) * R * r).toFixed(1)]
}
const ring = (r) => [0, 1, 2, 3, 4, 5].map((i) => pt(i, r).join(',')).join(' ')
const shape = computed(() => axes.value.map((a, i) => pt(i, Math.max(0.04, a.score / 100)).join(',')).join(' '))
const radarLabel = computed(() => axes.value.map((a) => `${a.name} ${a.score}`).join('，'))

const t = computed(() =>
  E.value
    ? {
        presetsLabel: 'Example months',
        worst: 'Weakest: ',
        note: 'The six indicators are the ones oSave shows. The thresholds here are round example values; the app scores your own records.',
      }
    : {
        presetsLabel: '範例月份',
        worst: '最需要注意：',
        note: '六項指標和 App 裡的一樣；這裡的計分門檻是示意值，App 會用你實際記的帳來算。',
      }
)
</script>

<style scoped>
.os-card {
  --os-good: #2f8f5b;
  --os-fair: #c98a12;
  --os-poor: #c44a24;
  display: grid;
  gap: var(--sp-6);
  margin-top: var(--sp-6);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-2);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .os-card {
    --os-good: #6fcf97;
    --os-fair: #f2c94c;
    --os-poor: #ff8a5b;
  }
}
:root[data-theme='dark'] .os-card {
  --os-good: #6fcf97;
  --os-fair: #f2c94c;
  --os-poor: #ff8a5b;
}

.os-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.os-preset {
  min-height: 40px;
  padding: 0 var(--sp-4);
  border: 0;
  border-radius: var(--r-full);
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--rule);
  color: var(--ink-2);
  font: inherit;
  font-size: var(--step--1);
  font-weight: 700;
  cursor: pointer;
}

.os-preset.is-on {
  background: var(--ink);
  color: var(--surface);
  box-shadow: none;
}

.os-body {
  display: grid;
  gap: var(--sp-7);
}

@media (min-width: 860px) {
  .os-body {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    align-items: center;
  }
}

.os-inputs {
  display: grid;
  gap: var(--sp-4);
}

.os-field {
  display: grid;
  gap: 2px;
}

.os-field-head {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-3);
  font-weight: 700;
}

.os-field-head output {
  color: var(--ink);
}

.os-field-hint {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.os-field input {
  width: 100%;
  min-height: 32px;
  accent-color: var(--pop);
  cursor: pointer;
}

.os-result {
  display: grid;
  justify-items: center;
  gap: var(--sp-3);
}

.os-score {
  display: flex;
  align-items: baseline;
  gap: var(--sp-2);
}

.os-score-n {
  font-family: var(--font-display);
  font-size: clamp(3rem, 2rem + 4vw, 4.5rem);
  font-weight: 900;
  line-height: 1;
  transition: color var(--dur-2);
}

.os-score-of {
  color: var(--ink-3);
  font-weight: 700;
}

.os-band {
  align-self: center;
  padding: 2px 10px;
  border-radius: var(--r-full);
  color: var(--surface);
  font-size: var(--step--1);
  font-weight: 800;
  transition: background-color var(--dur-2);
}

.os-radar {
  width: 100%;
  max-width: 400px;
  overflow: visible;
}

.os-ring {
  fill: none;
  stroke: var(--rule);
}

.os-axis {
  stroke: var(--rule);
}

.os-shape {
  fill: color-mix(in srgb, var(--pop) 22%, transparent);
  stroke: var(--pop);
  stroke-width: 2;
  stroke-linejoin: round;
  transition: all var(--dur-2) var(--ease-entrance);
}

.os-dot {
  fill: var(--pop);
  transition: all var(--dur-2) var(--ease-entrance);
}

.os-label {
  fill: var(--ink-2);
  font-size: 11px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
}

.os-label.is-low {
  fill: var(--pop-ink);
}

.os-tip {
  max-width: 28rem;
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-2);
  background: var(--surface-2);
  color: var(--ink-2);
  font-size: var(--step--1);
  line-height: 1.7;
}

.os-tip strong {
  display: block;
  color: var(--ink);
}

.os-note {
  font-size: var(--step--1);
  color: var(--ink-3);
}

@media (prefers-reduced-motion: reduce) {
  .os-shape,
  .os-dot {
    transition: none;
  }
}
</style>
