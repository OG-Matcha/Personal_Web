<template>
  <!--
    A product page, not an engineering write-up: what it is, what it does for
    the person using it, what happened to it, and what I did. Internal
    decisions and line counts were cut on purpose - visitors do not care.
  -->
  <article class="case">
    <header class="shell case-hero">
      <div class="case-intro">
        <p class="case-eyebrow">{{ work.org || work.role }}</p>
        <h1 class="case-title">{{ work.title }}</h1>
        <p v-if="work.tagline" class="case-tagline">{{ work.tagline }}</p>
        <p class="case-summary">{{ work.summary }}</p>
        <p class="case-meta">
          <span class="pill">{{ work.status }}</span>
          <span class="figures">{{ formatDate(work.period.start) }} – {{ work.period.end ? formatDate(work.period.end) : t.now }}</span>
        </p>
        <p v-if="links.length" class="case-links">
          <a v-for="l in links" :key="l.href" class="btn" :href="l.href" v-bind="linkAttrs(l.href)">{{ l.label }} ↗</a>
        </p>
      </div>
      <figure v-if="work.cover" class="case-cover">
        <img :src="work.cover" :alt="work.title" width="1600" height="1000" fetchpriority="high" />
      </figure>
      <div v-else class="case-cover case-cover--card"><SiteBizCard /></div>
    </header>

    <section v-if="outcomes.length" class="shell">
      <dl class="case-outcomes">
        <div v-for="o in outcomes" :key="o.label">
          <dd>{{ o.value }}</dd>
          <dt>{{ o.label }}</dt>
        </div>
      </dl>
    </section>

    <!-- What it does, each with the screen that does it. Phone screens sit
         three across; wide screens get a row each. -->
    <section v-if="highlights.length" class="shell case-block">
      <h2 class="case-h2">{{ work.highlightsTitle || t.does }}</h2>
      <ol class="hl" :class="{ 'hl--phone': phoneShots }">
        <li v-for="h in highlights" :key="h.title" class="hl-item" :class="{ 'hl-item--text': !h.shot }">
          <div v-if="h.shot" :class="phoneShots ? 'device' : 'screen'">
            <img :src="h.shot" :alt="h.title" loading="lazy" />
          </div>
          <div class="hl-text">
            <h3>
              <NuxtLink v-if="h.href" :to="h.href">{{ h.title }} →</NuxtLink>
              <template v-else>{{ h.title }}</template>
            </h3>
            <p>{{ h.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- Fallback for cases not yet rewritten as a product page. -->
    <section v-else-if="work.screenshots?.length" class="shell case-block">
      <div class="grid gap-5" :class="phoneShots ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
        <div v-for="(src, i) in work.screenshots" :key="src" :class="phoneShots ? 'device' : 'screen'">
          <img :src="src" :alt="`${work.title} ${t.screen} ${i + 1}`" loading="lazy" />
        </div>
      </div>
    </section>

    <section v-if="work.turn" class="shell case-block">
      <div class="turn" :class="{ 'turn--solo': !work.turn.image }">
        <div>
          <h2 class="case-h2">{{ work.turn.title }}</h2>
          <p v-for="(p, i) in paragraphs(work.turn.text)" :key="i" class="turn-text">{{ p }}</p>
        </div>
        <figure v-if="work.turn.image" class="screen">
          <img :src="work.turn.image" :alt="work.turn.title" loading="lazy" />
        </figure>
      </div>
    </section>

    <section v-if="work.myPart?.length || evidence.length" class="shell case-block case-facts">
      <div v-if="work.myPart?.length">
        <h2 class="case-h2">{{ t.mine }}</h2>
        <p class="case-role">{{ work.role }}</p>
        <ul class="mine">
          <li v-for="m in work.myPart" :key="m">{{ m }}</li>
        </ul>
      </div>
      <div v-if="evidence.length">
        <h2 class="case-h2">{{ t.awards }}</h2>
        <ul class="awards">
          <li v-for="e in evidence" :key="e.date + e.title">
            <span class="figures">{{ formatDate(e.date) }}</span>
            <a v-if="e.evidence" :href="e.evidence" v-bind="linkAttrs(e.evidence)">{{ e.title }}</a>
            <span v-else>{{ e.title }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="shell case-block">
      <p class="stack"><span>{{ t.stack }}</span>{{ flatStack.join(' · ') }}</p>
      <p class="mt-8">
        <button type="button" class="back mono text-2xs" @click="goBack">← {{ backLabel }}</button>
      </p>
    </section>
  </article>
</template>

<script setup>
/**
 * One case study, in either language. The page files own routing and SEO;
 * this owns what the reader sees, so the Chinese and English editions cannot
 * drift into two different layouts again.
 */
const props = defineProps({
  work: { type: Object, required: true }, // already merged with its translation
  evidence: { type: Array, default: () => [] },
  locale: { type: String, default: 'zh' },
})

const router = useRouter()

const t = computed(() =>
  props.locale === 'en'
    ? { now: 'now', does: 'What it does', mine: 'What I did', awards: 'Awards and grants', stack: 'Built with', screen: 'screen', back: 'All work', backPrev: 'Back', home: '/en/portfolio/' }
    : { now: '現在', does: '它能做什麼', mine: '我負責的部分', awards: '得獎與補助', stack: '用到的技術', screen: '畫面', back: '看所有作品', backPrev: '回上一頁', home: '/portfolio/' }
)

/** Anything still marked TODO is not rendered. */
function ok(v) {
  return Boolean(v) && !String(v).startsWith('TODO')
}

const work = computed(() => props.work)
const outcomes = computed(() => (work.value.outcomes ?? []).filter((o) => ok(o.value)))
const highlights = computed(() => (work.value.highlights ?? []).filter((h) => ok(h.title)))
const phoneShots = computed(() => work.value.screenshotShape === 'phone')
const links = computed(() => (work.value.links ?? []).filter((l) => ok(l.href)))
const flatStack = computed(() => Object.values(work.value.stack ?? {}).flat().filter(ok))

/** Split a folded YAML scalar back into paragraphs (a newline is the author's break). */
function paragraphs(text) {
  return String(text ?? '').split(/\n+/).map((p) => p.trim()).filter(Boolean)
}

/**
 * Go back where the reader came from: router.back() only when this page was
 * pushed from this site; a cold landing gets the portfolio.
 */
const cameFrom = ref(false)
const backLabel = computed(() => (cameFrom.value ? t.value.backPrev : t.value.back))
onMounted(() => {
  cameFrom.value = window.history.length > 1 && document.referrer.startsWith(window.location.origin)
})
function goBack() {
  if (cameFrom.value) router.back()
  else router.push(t.value.home)
}
</script>

<style scoped>
.case {
  padding-top: var(--sp-8);
  padding-bottom: var(--sp-9);
}

.case-block {
  margin-top: var(--sp-9);
}

/* ---- hero ---------------------------------------------------------------- */
.case-hero {
  display: grid;
  gap: var(--sp-7);
  align-items: center;
}

@media (min-width: 960px) {
  .case-hero {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: var(--sp-8);
  }
}

.case-eyebrow {
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--pop-ink);
}

.case-title {
  margin-top: var(--sp-2);
  font-size: var(--step-5);
  font-weight: 900;
  line-height: 1.02;
}

.case-tagline {
  margin-top: var(--sp-4);
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 700;
  line-height: 1.35;
}

.case-summary {
  margin-top: var(--sp-4);
  max-width: var(--measure-han);
  color: var(--ink-2);
  line-height: 1.75;
}

.case-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2) var(--sp-4);
  margin-top: var(--sp-5);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.case-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-top: var(--sp-5);
}

.case-cover {
  overflow: hidden;
  border-radius: var(--r-3);
  background: var(--surface-2);
  box-shadow: var(--shadow-2);
}

.case-cover img {
  display: block;
  width: 100%;
  height: auto;
}

.case-cover--card {
  overflow: visible;
  background: none;
  box-shadow: none;
}

.pill {
  padding: 1px 10px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--ink-2);
  font-weight: 600;
}

/* ---- outcomes ------------------------------------------------------------ */
.case-outcomes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: var(--sp-6);
  margin-top: var(--sp-9);
  padding-block: var(--sp-6);
  border-block: 1px solid var(--rule);
}

.case-outcomes div {
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end; /* labels line up at the top even when a value wraps */
  gap: var(--sp-1);
}

.case-outcomes dd {
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 800;
  line-height: 1.1;
}

.case-outcomes dt {
  font-size: var(--step--1);
  color: var(--ink-3);
}

/* ---- highlights ---------------------------------------------------------- */
.case-h2 {
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 800;
}

.hl {
  display: grid;
  gap: var(--sp-8);
  margin-top: var(--sp-7);
}

@media (min-width: 760px) {
  .hl--phone {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--sp-6);
  }

  .hl:not(.hl--phone) .hl-item {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
    gap: var(--sp-7);
    align-items: center;
  }

  .hl:not(.hl--phone) .hl-item:nth-child(even) .screen {
    order: 2;
  }
}

.hl--phone .hl-text {
  margin-top: var(--sp-5);
}

.hl-text h3 {
  font-family: var(--font-display);
  font-size: var(--step-1);
  font-weight: 800;
}

.hl-text p {
  margin-top: var(--sp-2);
  color: var(--ink-2);
  line-height: 1.75;
}

/* A phone, not a screenshot with a border: rounded body, the screen inset. */
.device {
  max-width: 300px;
  margin-inline: auto;
  padding: 9px;
  border-radius: 44px;
  background: #16171a;
  box-shadow: var(--shadow-2);
}

.device img {
  display: block;
  width: 100%;
  aspect-ratio: 9 / 19.5;
  object-fit: cover;
  object-position: top;
  border-radius: 36px;
  background: #fff;
}

.screen {
  overflow: hidden;
  border-radius: var(--r-2);
  border: 1px solid var(--rule);
  background: var(--surface-2);
  box-shadow: var(--shadow-1);
}

.screen img {
  display: block;
  width: 100%;
  height: auto;
}

/* ---- the turn ------------------------------------------------------------ */
.turn {
  display: grid;
  gap: var(--sp-6);
  align-items: center;
  padding: var(--sp-7);
  border-radius: var(--r-3);
  background: var(--surface-2);
}

@media (min-width: 900px) {
  .turn {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: var(--sp-8);
  }
}

@media (max-width: 640px) {
  .turn {
    padding: var(--sp-5);
  }
}

.turn-text {
  margin-top: var(--sp-4);
  color: var(--ink-2);
  line-height: 1.8;
}

/* ---- role + awards ------------------------------------------------------- */
.case-facts {
  display: grid;
  gap: var(--sp-8);
}

@media (min-width: 900px) {
  .case-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.case-role {
  margin-top: var(--sp-2);
  font-weight: 700;
  color: var(--pop-ink);
}

.mine {
  margin-top: var(--sp-4);
  display: grid;
  gap: var(--sp-3);
}

.mine li {
  position: relative;
  padding-left: 1.2em;
  color: var(--ink-2);
  line-height: 1.7;
}

.mine li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--pop);
}

.awards {
  margin-top: var(--sp-4);
}

.awards li {
  display: grid;
  grid-template-columns: 5.2em 1fr;
  gap: var(--sp-3);
  padding-block: var(--sp-3);
  border-top: 1px solid var(--rule);
  font-size: var(--step--1);
  color: var(--ink-2);
}

.awards li:last-child {
  border-bottom: 1px solid var(--rule);
}

.awards .figures {
  color: var(--ink-3);
}

.stack {
  font-size: var(--step--1);
  color: var(--ink-2);
  line-height: 1.8;
}

.stack span {
  margin-right: var(--sp-3);
  font-weight: 700;
  color: var(--ink);
}

.back {
  color: var(--ink-2);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
  text-underline-offset: 0.24em;
}

.back:hover {
  color: var(--ink);
}

/* Wide screens in a row: tall captures are cut from the bottom, where a
   screen has the least to say, so no row towers over the others. */
.hl:not(.hl--phone) .screen img {
  max-height: 30rem;
  object-fit: cover;
  object-position: top;
}

.hl-item--text {
  display: block !important;
  padding: var(--sp-6);
  border-radius: var(--r-3);
  background: var(--surface-2);
}

.hl-text h3 a {
  text-decoration: none;
}

.hl-text h3 a:hover {
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
}

@media (min-width: 900px) {
  .turn--solo {
    grid-template-columns: minmax(0, 1fr);
  }
}

.turn--solo .turn-text {
  max-width: var(--measure-han);
}
</style>
