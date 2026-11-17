<template>
  <!--
    The index of case studies. Each one is the real screen, set like a print
    pinned on the studio wall, with what it was beside it. Rows alternate which
    side the screen sits on, so four of them read as a run, not a card grid.
  -->
  <ol class="cs-list">
    <li v-for="(w, i) in items" :key="w.slug" class="cs-item" :class="{ 'cs-item--flip': i % 2 === 1 }">
      <NuxtLink v-if="w.cover" :to="w.href" class="cs-shot" :aria-label="w.title">
        <SiteShot :src="w.cover" width="1600" height="900" />
      </NuxtLink>
      <!-- Finctory is a company, not a screen: its card, to pick up and turn over. -->
      <div v-else class="cs-shot cs-shot--card"><SiteBizCard /></div>

      <div class="cs-text">
        <h2 class="cs-title">
          <NuxtLink :to="w.href">{{ w.title }}</NuxtLink>
        </h2>
        <p class="cs-meta">
          <span class="cs-role">{{ w.role }}</span>
          <span class="cs-status">{{ w.status }}</span>
          <span class="figures">{{ formatDate(w.period.start) }} – {{ w.period.end ? formatDate(w.period.end) : c.now }}</span>
        </p>
        <p class="cs-summary">{{ w.summary }}</p>
        <dl v-if="w.facts.length" class="cs-facts">
          <div v-for="r in w.facts" :key="r.metric">
            <dt>{{ r.metric }}</dt>
            <dd class="figures">{{ r.value }}</dd>
          </div>
        </dl>
        <p class="cs-go">
          <NuxtLink :to="w.href" class="btn">{{ c.read }}</NuxtLink>
        </p>
      </div>
    </li>
  </ol>
</template>

<script setup>
const { works, en } = useContent()
const { locale } = useLocale()

const c = computed(() =>
  locale.value === 'en' ? { now: 'now', read: 'Read the case study' } : { now: '現在', read: '讀案例研究' }
)

/** Two short outcomes reach the index: what a visitor cares about, not line counts. */
function facts(w) {
  if (w.outcomes?.length) return w.outcomes.slice(0, 2).map((o) => ({ metric: o.label, value: o.value }))
  return (w.results ?? []).filter((r) => r.value && String(r.value).length <= 28).slice(0, 2)
}

const items = computed(() =>
  works.map((w) => {
    const e = locale.value === 'en' ? en.works?.[w.slug] ?? {} : {}
    return {
      ...w,
      ...e,
      href: `${locale.value === 'en' ? '/en' : ''}/work/${w.slug}/`,
      facts: e.results ?? facts(w),
    }
  })
)
</script>

<style scoped>
.cs-list {
  display: grid;
  gap: var(--sp-9);
}

.cs-item {
  display: grid;
  gap: var(--sp-6);
  align-items: center;
}

@media (min-width: 900px) {
  .cs-item {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: var(--sp-8);
  }

  .cs-item--flip .cs-shot {
    order: 2;
  }
}

.cs-shot {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: var(--r-3);
  background: var(--surface-2);
  box-shadow: var(--shadow-2);
  transition:
    transform var(--dur-3) var(--ease-entrance),
    box-shadow var(--dur-3) var(--ease-entrance);
}

a.cs-shot:hover,
a.cs-shot:focus-visible {
  transform: translateY(-4px) rotate(-0.4deg);
  box-shadow:
    0 4px 8px rgb(var(--shadow-rgb) / 0.06),
    0 36px 64px -20px rgb(var(--shadow-rgb) / 0.34);
}

.cs-item--flip a.cs-shot:hover,
.cs-item--flip a.cs-shot:focus-visible {
  transform: translateY(-4px) rotate(0.4deg);
}

.cs-shot--card {
  overflow: visible;
  background: none;
  box-shadow: none;
}

.cs-title {
  font-size: var(--step-3);
  font-weight: 800;
}

.cs-title a {
  text-decoration: none;
}

.cs-title a:hover {
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
  text-decoration-thickness: 2px;
}

.cs-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-4);
  margin-top: var(--sp-3);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.cs-role {
  font-weight: 700;
  color: var(--ink);
}

.cs-status {
  padding: 0 10px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--ink-2);
  font-weight: 600;
}

.cs-summary {
  margin-top: var(--sp-4);
  color: var(--ink-2);
  max-width: var(--measure-han);
}

.cs-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--sp-4);
  margin-top: var(--sp-5);
}

.cs-facts div {
  padding-top: var(--sp-3);
  border-top: 1px solid var(--rule);
}

.cs-facts dt {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.cs-facts dd {
  margin-top: var(--sp-1);
  font-family: var(--font-display);
  font-weight: 800;
}

.cs-go {
  margin-top: var(--sp-5);
}
</style>
