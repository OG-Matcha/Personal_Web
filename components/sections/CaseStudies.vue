<template>
  <!--
    The index of case studies. Each one is the real screen, set like a print
    pinned on the studio wall, with what it was beside it. Rows alternate which
    side the screen sits on, so four of them read as a run, not a card grid.
  -->
  <ol class="cs-list">
    <li v-for="(w, i) in items" :key="w.slug" class="cs-item" :class="{ 'cs-item--flip': i % 2 === 1 }">
      <NuxtLink v-if="w.cover" :to="w.href" class="cs-shot" :aria-label="w.title" :style="{ viewTransitionName: `cover-${w.slug}` }">
        <SiteShot :src="w.cover" width="1600" height="900" fit="cover" :focus="w.coverFocus" :eager="i === 0" />
      </NuxtLink>
      <!-- Finctory is a company, not a screen: its card, to pick up and turn over. -->
      <div v-else class="cs-shot cs-shot--card"><SiteBizCard /></div>

      <div class="cs-text">
        <h2 class="cs-title">
          <NuxtLink :to="w.href">{{ keep(w.title) }}</NuxtLink>
        </h2>
        <p class="cs-meta">
          <span class="cs-role">{{ w.role }}</span>
          <span class="cs-status">{{ w.status }}</span>
          <span class="figures">{{ formatDate(w.period.start) }} – {{ w.period.end ? formatDate(w.period.end) : c.now }}</span>
        </p>
        <p class="cs-summary">{{ keep(w.summary) }}</p>
        <dl v-if="w.facts.length" class="cs-facts">
          <div v-for="r in w.facts" :key="r.metric">
            <dt>{{ r.metric }}</dt>
            <dd class="figures">{{ r.value }}</dd>
          </div>
        </dl>
        <p class="cs-go">
          <!-- Six of these on the page: each says which product it opens. -->
          <NuxtLink :to="w.href" class="btn" :aria-label="`${c.read}${c.sep}${w.title}`">{{ c.read }}</NuxtLink>
        </p>
      </div>
    </li>
  </ol>
</template>

<script setup>
const { works, en } = useContent()
const { locale } = useLocale()

const c = computed(() =>
  locale.value === 'en' ? { now: 'now', read: 'See the product', sep: ': ' } : { now: '現在', read: '看產品介紹', sep: '：' }
)

/** Two short outcomes reach the index: what a visitor cares about, not line counts. */
const store = useStoreStats(() => works.map((w) => w.liveStore))
function facts(w) {
  const en = locale.value === 'en'
  if (w.outcomes?.length) return w.outcomes.slice(0, 2).map((o) => liveOutcome(o, store[w.liveStore], en)).map((o) => ({ metric: o.label, value: o.value }))
  return (w.results ?? []).filter((r) => r.value && String(r.value).length <= 28).slice(0, 2)
}

const items = computed(() =>
  works.map((w) => {
    const e = locale.value === 'en' ? en.works?.[w.slug] ?? {} : {}
    return {
      ...w,
      ...e,
      href: `${locale.value === 'en' ? '/en' : ''}/work/${w.slug}/`,
      facts: e.results ?? facts({ ...w, ...e }),
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

  /* The picture always gets the wide column, on whichever side it sits. */
  .cs-item--flip {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  }

  .cs-item--flip .cs-shot {
    order: 2;
  }
}

/* The same prints as on the homepage's desk: photo paper with a white
   border, laid down a little crooked; picked up and straightened on hover. */
.cs-shot {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  padding: 12px 12px 14px;
  border-radius: 3px;
  background: var(--print);
  box-shadow:
    0 1px 1px rgb(var(--shadow-rgb) / 0.12),
    0 18px 28px -16px rgb(var(--shadow-rgb) / 0.45);
  rotate: -0.8deg;
  transition:
    rotate var(--dur-3) var(--ease-entrance),
    transform var(--dur-3) var(--ease-entrance),
    box-shadow var(--dur-3) var(--ease-entrance);
}

.cs-item--flip .cs-shot {
  rotate: 0.9deg;
}

a.cs-shot:hover,
a.cs-shot:focus-visible {
  rotate: 0deg;
  transform: translateY(-6px);
  box-shadow:
    0 2px 4px rgb(var(--shadow-rgb) / 0.08),
    0 32px 44px -18px rgb(var(--shadow-rgb) / 0.4);
}

.cs-shot--card {
  overflow: visible;
  padding: 0;
  background: none;
  box-shadow: none;
  rotate: none;
}

/* On a phone the 16:10 frame let the card fill only two thirds of the column
   (148px wide at 320, its email at 4px). Taller frame, thinner side margin:
   the card takes the column's width. */
@media (max-width: 639px) {
  .cs-shot--card {
    aspect-ratio: 5 / 4;
  }

  .cs-shot--card :deep(.bc-stage) {
    --pad-x: 0px;
  }
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
  /* Label row and value row are shared across the line (subgrid): labels
     start level and values start level, whatever wraps. */
  display: grid;
  grid-row: span 2;
  grid-template-rows: subgrid;
  row-gap: var(--sp-1);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--rule);
}

.cs-facts dt {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.cs-facts dd {
  font-family: var(--font-display);
  font-weight: 800;
}

.cs-go {
  margin-top: var(--sp-5);
}
</style>
