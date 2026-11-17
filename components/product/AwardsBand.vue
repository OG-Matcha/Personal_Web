<template>
  <!--
    The awards, counted from the timeline rather than remembered, then every
    one of them by name on two slow belts. Under reduced motion the belts stop
    and wrap.
  -->
  <section class="aw" aria-labelledby="aw-title">
    <div class="aw-head">
      <h2 id="aw-title" class="aw-title">{{ c.title }}</h2>
      <dl class="aw-counts">
        <div v-for="n in counts" :key="n.label">
          <dt>{{ n.label }}</dt>
          <dd class="figures">{{ n.n }}</dd>
        </div>
      </dl>
    </div>

    <div class="aw-belts">
      <ul v-for="(row, r) in rows" :key="r" class="aw-belt" :class="{ 'aw-belt--back': r === 1 }" :aria-label="r === 0 ? c.listLabel : undefined">
        <li v-for="(a, i) in [...row, ...row]" :key="i" :aria-hidden="i >= row.length ? 'true' : undefined" class="aw-item">
          <span class="aw-prize">{{ a.prize }}</span>
          <span class="aw-comp">{{ a.comp }}</span>
          <span class="aw-year figures">{{ a.date.slice(0, 4) }}</span>
        </li>
      </ul>
    </div>

    <p class="aw-act">
      <NuxtLink :to="`${pre}/resume/`" class="btn">{{ c.cta }}</NuxtLink>
    </p>
  </section>
</template>

<script setup>
const { timeline, site, en } = useContent()
const { locale } = useLocale()
const isEn = computed(() => locale.value === 'en')
const pre = computed(() => (isEn.value ? '/en' : ''))

const c = computed(() =>
  isEn.value
    ? { title: 'Awards', listLabel: 'Every award, newest first', cta: 'The full record, with announcements' }
    : { title: '獎項', listLabel: '所有獎項，由新到舊', cta: '看完整年表與公告' }
)

const counts = computed(() =>
  isEn.value
    ? [
        { n: site.counts.awards, label: 'competition awards' },
        { n: site.counts.topPrizes, label: 'national top prizes' },
        { n: site.counts.researchGrants, label: 'NSTC research grants' },
      ]
    : [
        { n: site.counts.awards, label: '項競賽獎項' },
        { n: site.counts.topPrizes, label: '座全國首獎' },
        { n: site.counts.researchGrants, label: '個國科會研究計畫' },
      ]
)

// Same rule as the count: being shortlisted is not winning.
const awards = computed(() =>
  timeline
    .filter((e) => e.kind === 'award' && !/入圍/.test(e.title))
    .map((e) => {
      const title = isEn.value ? en.timeline?.[`${e.date} ${e.title}`]?.title ?? e.title : e.title
      const cut = title.lastIndexOf(' - ')
      return { date: e.date, comp: cut > 0 ? title.slice(0, cut) : title, prize: cut > 0 ? title.slice(cut + 3) : '' }
    })
)

const rows = computed(() => {
  const a = awards.value
  const half = Math.ceil(a.length / 2)
  return [a.slice(0, half), a.slice(half)]
})
</script>

<style scoped>
.aw {
  padding-block: var(--sp-9);
  border-top: 1px solid var(--rule);
  overflow: hidden;
}

.aw-head {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: var(--sp-6) var(--sp-8);
  padding-inline: clamp(var(--sp-4), 6vw, 9rem);
}

.aw-title {
  font-family: var(--font-display);
  font-size: var(--step-5);
  font-weight: 900;
  line-height: 1;
}

.aw-counts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-5) var(--sp-8);
}

.aw-counts div {
  display: flex;
  flex-direction: column-reverse;
}

.aw-counts dd {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(3rem, 2rem + 4vw, 6rem);
  line-height: 1;
  color: var(--pop-ink);
}

.aw-counts dt {
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.aw-belts {
  display: grid;
  gap: var(--sp-3);
  margin-top: var(--sp-8);
}

.aw-belt {
  display: flex;
  gap: var(--sp-3);
  width: max-content;
  list-style: none;
  animation: aw-run 70s linear infinite;
}

.aw-belt--back {
  animation-direction: reverse;
  animation-duration: 80s;
}

.aw-belts:hover .aw-belt {
  animation-play-state: paused;
}

.aw-item {
  display: inline-flex;
  align-items: baseline;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-5);
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--shadow-1);
  white-space: nowrap;
}

.aw-prize {
  font-weight: 800;
  color: var(--ink);
}

.aw-comp {
  color: var(--ink-2);
}

.aw-year {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.aw-act {
  margin-top: var(--sp-7);
  padding-inline: clamp(var(--sp-4), 6vw, 9rem);
}

@keyframes aw-run {
  to {
    transform: translateX(-50%);
  }
}

/* Still: the belts become an ordinary wrapped list, duplicates hidden. */
@media (prefers-reduced-motion: reduce) {
  .aw-belt {
    animation: none;
    width: auto;
    flex-wrap: wrap;
    padding-inline: clamp(var(--sp-4), 6vw, 9rem);
  }

  .aw-item[aria-hidden='true'] {
    display: none;
  }

  .aw-item {
    white-space: normal;
  }
}

html[data-plain] .aw-belt {
  animation: none;
  width: auto;
  flex-wrap: wrap;
  padding-inline: clamp(var(--sp-4), 6vw, 9rem);
}

html[data-plain] .aw-item[aria-hidden='true'] {
  display: none;
}
</style>
