<template>
  <!--
    What SurPrice does to every flyer deal, small enough to play with: three
    offers on the same thing, each written the way flyers write them (second
    one 60% off, buy two get one, a bundle price), turned into one average
    price and one price per 100 ml or g. Stores and prices are made up.
  -->
  <div class="up-card">
    <div class="up-tabs" role="tablist" :aria-label="t.pick">
      <button v-for="g in goods" :key="g.id" type="button" role="tab" :aria-selected="good === g.id" class="up-tab" :class="{ 'is-on': good === g.id }" @click="good = g.id">
        <span aria-hidden="true">{{ g.emoji }}</span> {{ g.name }}
      </button>
    </div>

    <ol class="up-offers">
      <li v-for="o in rows" :key="o.store" class="up-offer" :class="{ 'is-best': o.best }">
        <span class="up-store">{{ o.store }}</span>
        <span class="up-deal">{{ o.deal }}</span>
        <span class="up-size">{{ o.sizeLabel }}</span>
        <label class="up-price">
          <span>{{ t.shelf }}</span>
          <span class="up-input">$<input v-model.number="price[o.key]" type="number" inputmode="numeric" min="1" max="9999" class="figures" :aria-label="`${o.store} ${t.shelf}`" /></span>
        </label>
        <span class="up-out">
          <span class="up-each figures">{{ t.each }} ${{ o.each }}</span>
          <span class="up-unit figures">${{ o.unit }} <small>/ 100{{ o.u }}</small></span>
          <span v-if="o.best" class="up-badge">{{ t.best }}</span>
        </span>
      </li>
    </ol>

    <p class="up-saving" aria-live="polite">{{ saving }}</p>
    <p class="up-note">{{ t.note }}</p>
  </div>
</template>

<script setup>
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

// deal: n = items you take home, pay = how many shelf prices you pay for
// (a 60%-off second one is 1.6), or bundle = one price for all n.
const data = {
  milk: {
    emoji: '🥛',
    u: 'ml',
    offers: [
      { key: 'a', size: 936, n: 2, pay: 1.6, price: 92, deal: ['Second one 60% off', '第二件 6 折'] },
      { key: 'b', size: 1857, n: 1, pay: 1, price: 159, deal: ['Single bottle', '單瓶'] },
      { key: 'c', size: 290, n: 4, bundle: 99, price: 35, deal: ['Any 4 for $99', '任選 4 瓶 $99'] },
    ],
  },
  tissue: {
    emoji: '🧻',
    u: '',
    count: true,
    offers: [
      { key: 'a', size: 100 * 12, n: 2, pay: 1.5, price: 189, deal: ['Second pack half price', '第二串半價'], sizeLabel: ['100 sheets × 12', '100 抽 × 12 包'] },
      { key: 'b', size: 110 * 8, n: 3, pay: 2, price: 139, deal: ['Buy 2 get 1', '買二送一'], sizeLabel: ['110 sheets × 8', '110 抽 × 8 包'] },
      { key: 'c', size: 150 * 6, n: 1, pay: 1, price: 119, deal: ['Single pack', '單串'], sizeLabel: ['150 sheets × 6', '150 抽 × 6 包'] },
    ],
  },
  coffee: {
    emoji: '☕',
    u: 'g',
    offers: [
      { key: 'a', size: 454, n: 1, pay: 1, price: 399, deal: ['Single bag', '單包'] },
      { key: 'b', size: 250, n: 2, pay: 1.5, price: 249, deal: ['Second bag half price', '第二包半價'] },
      { key: 'c', size: 1000, n: 1, pay: 1, price: 799, deal: ['Bulk 1 kg', '量販 1 公斤'] },
    ],
  },
}

const good = ref('milk')
const price = reactive({})
watch(
  good,
  (g) => {
    for (const o of data[g].offers) price[o.key] = o.price
  },
  { immediate: true }
)

const goods = computed(() => [
  { id: 'milk', emoji: '🥛', name: E.value ? 'Milk' : '鮮奶' },
  { id: 'tissue', emoji: '🧻', name: E.value ? 'Tissues' : '衛生紙' },
  { id: 'coffee', emoji: '☕', name: E.value ? 'Coffee beans' : '咖啡豆' },
])

const stores = computed(() => (E.value ? ['Supermarket A', 'Hypermarket B', 'Convenience C'] : ['超市 A', '量販 B', '超商 C']))

const rows = computed(() => {
  const d = data[good.value]
  const lang = E.value ? 0 : 1
  const u = d.count ? (E.value ? ' sheets' : ' 抽') : d.u
  const list = d.offers.map((o, i) => {
    const p = Math.max(1, Number(price[o.key]) || o.price)
    const total = o.bundle ?? p * o.pay
    const each = total / o.n
    const unit = (each / o.size) * 100
    return {
      key: o.key,
      store: stores.value[i],
      deal: o.deal[lang],
      sizeLabel: o.sizeLabel?.[lang] ?? `${o.size.toLocaleString('en-US')}${d.u}${o.n > 1 ? (E.value ? ` × ${o.n}` : ` × ${o.n}`) : ''}`,
      each: Math.round(each).toLocaleString('en-US'),
      unitN: unit,
      unit: unit < 10 ? unit.toFixed(2) : unit.toFixed(1),
      u,
    }
  })
  const min = Math.min(...list.map((r) => r.unitN))
  return list.map((r) => ({ ...r, best: r.unitN === min }))
})

const saving = computed(() => {
  const r = rows.value
  const best = r.find((x) => x.best)
  const worst = r.reduce((w, x) => (x.unitN > w.unitN ? x : w))
  const pct = Math.round((1 - best.unitN / worst.unitN) * 100)
  if (pct < 1) return E.value ? 'All three come out the same.' : '三家算下來差不多。'
  return E.value
    ? `${best.store} is ${pct}% cheaper per 100${best.u.trim()} than ${worst.store}, even though the shelf prices say otherwise.`
    : `${best.store} 每 100${best.u.trim()} 比 ${worst.store} 便宜 ${pct}%，只看標價是看不出來的。`
})

const t = computed(() =>
  E.value
    ? { pick: 'Pick something to compare', shelf: 'Shelf price', each: 'Each', best: 'Best per unit', note: 'Made-up stores and prices. Change a shelf price and see the ranking move. SurPrice does this for every deal in each flyer.' }
    : { pick: '選一樣東西來比', shelf: '標價', each: '平均每件', best: '單位價格最低', note: '店家和價格都是示意。改改看標價，排名會跟著變；找好康會對每一份 DM 的每一筆優惠這樣算。' }
)
</script>

<style scoped>
.up-card {
  display: grid;
  gap: var(--sp-5);
  margin-top: var(--sp-6);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-2);
}

.up-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.up-tab {
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

.up-tab.is-on {
  background: var(--ink);
  color: var(--surface);
  box-shadow: none;
}

.up-offers {
  display: grid;
  gap: var(--sp-3);
}

@media (min-width: 760px) {
  .up-offers {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.up-offer {
  position: relative;
  display: grid;
  align-content: start;
  gap: var(--sp-1);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--r-2);
  background: var(--bg);
  box-shadow: inset 0 0 0 1px var(--rule);
  transition: box-shadow var(--dur-2);
}

.up-offer.is-best {
  box-shadow: inset 0 0 0 2px var(--pop);
}

.up-store {
  font-weight: 800;
}

.up-deal {
  justify-self: start;
  padding: 1px 8px;
  border-radius: var(--r-1);
  background: #e8372b;
  color: #fff;
  font-size: var(--step--1);
  font-weight: 800;
}

.up-size {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.up-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.up-input {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--ink);
  font-weight: 700;
}

.up-input input {
  width: 5rem;
  min-height: 40px;
  padding: 0 var(--sp-2);
  border: 0;
  border-radius: var(--r-1);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--rule-strong);
  color: var(--ink);
  font: inherit;
  text-align: right;
}

.up-out {
  display: grid;
  gap: 2px;
  margin-top: var(--sp-2);
  padding-top: var(--sp-3);
  border-top: 1px dashed var(--rule);
}

.up-each {
  font-size: var(--step--1);
  color: var(--ink-2);
}

.up-unit {
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 900;
}

.up-unit small {
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink-3);
}

.up-badge {
  justify-self: start;
  margin-top: var(--sp-1);
  padding: 1px 10px;
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font-size: var(--step--1);
  font-weight: 800;
}

.up-saving {
  font-weight: 700;
}

.up-note {
  font-size: var(--step--1);
  color: var(--ink-3);
}
</style>
