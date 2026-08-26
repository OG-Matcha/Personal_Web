<template>
  <article v-if="work" class="pt-8">
    <header class="shell">
      <h1 class="font-display text-4xl">{{ work.title }}</h1>
      <p class="mt-4 max-w-measure-han font-display text-xl text-ink-2">{{ work.summary }}</p>

      <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span class="pill">{{ work.status }}</span>
        <span class="mono text-2xs tabular-nums text-ink-2">
          {{ formatDate(work.period.start) }} –
          {{ work.period.end ? formatDate(work.period.end) : '現在' }}
        </span>
        <span class="mono text-2xs text-ink-2">{{ work.role }}</span>
      </div>

      <!-- Where you can actually get it. A case study for a shipped product
           that does not link to the product is a case study about a product
           nobody can check. -->
      <p v-if="links.length" class="mt-5 flex flex-wrap gap-3">
        <a v-for="l in links" :key="l.href" class="btn" :href="l.href" rel="noopener">{{ l.label }}</a>
      </p>
    </header>

    <figure v-if="work.cover" class="shell mt-7">
      <img
        :src="work.cover"
        :alt="work.title"
        width="1600"
        height="900"
        fetchpriority="high"
        class="aspect-[16/9] w-full rounded-sm object-cover object-top"
      />
    </figure>

    <!-- Results first: on a showcase page the outcome is the headline and the
         story below is for whoever wants it. -->
    <section v-if="results.length" class="shell mt-9">
      <dl class="grid gap-6 border-y border-rule py-7 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="r in results" :key="r.metric">
          <dt class="mono text-2xs text-ink-2">{{ r.metric }}</dt>
          <dd class="mt-2 font-display text-xl">{{ r.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="shell mt-9">
      <h2 class="font-display text-2xl">在解什麼問題</h2>
      <div class="mt-4 flex max-w-measure-han flex-col gap-4">
        <p v-for="(p, i) in paragraphs(work.problem)" :key="i" class="text-base text-ink-2">
          {{ p }}
        </p>
      </div>
    </section>

    <section v-if="decisions.length" class="shell mt-9">
      <h2 class="font-display text-2xl">架構決策</h2>
      <ol class="mt-5 flex flex-col gap-7">
        <li v-for="(d, i) in decisions" :key="i" class="decision">
          <p class="mono text-2xs text-ink-3">
            {{ String(i + 1).padStart(2, '0') }}
            <span v-if="d.date && !String(d.date).startsWith('TODO')" class="ml-3">
              {{ formatDate(d.date) }}
            </span>
          </p>
          <p class="mt-2 max-w-measure-han font-display text-lg">{{ d.decision }}</p>

          <dl class="mt-4 grid gap-4 sm:grid-cols-3">
            <div v-if="ok(d.rejected)">
              <dt class="mono text-2xs text-ink-3">沒選的</dt>
              <dd class="mt-1 text-sm text-ink-2">{{ d.rejected }}</dd>
            </div>
            <div v-if="ok(d.why)" class="sm:col-span-2">
              <dt class="mono text-2xs text-ink-3">為什麼</dt>
              <dd class="mt-1 flex flex-col gap-3 text-sm text-ink-2">
                <span v-for="(p, k) in paragraphs(d.why)" :key="k">{{ p }}</span>
              </dd>
            </div>
            <div v-if="ok(d.cost)" class="sm:col-span-3">
              <dt class="mono text-2xs text-ink-3">代價</dt>
              <dd class="mt-1 text-sm text-ink-2">{{ d.cost }}</dd>
            </div>
          </dl>
        </li>
      </ol>
    </section>

    <section v-if="trace.length" class="shell mt-9">
      <h2 class="font-display text-2xl">資料怎麼流</h2>
      <ol class="mt-5 flex flex-col">
        <li v-for="(t, i) in trace" :key="i" class="trace-step">
          <span class="mono text-2xs text-ink-3">{{ String(i + 1).padStart(2, '0') }}</span>
          <div>
            <p class="font-display text-base">{{ t.step }}</p>
            <p v-if="ok(t.detail)" class="mt-1 max-w-measure-han text-sm text-ink-2">
              {{ t.detail }}
            </p>
            <p v-if="ok(t.note)" class="mt-1 max-w-measure-han text-sm text-ink-3">{{ t.note }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- App screens are 9:19.5, not 16:10. Two of them across a full-width
         grid renders each one taller than the viewport, and the hardcoded
         1200x750 box reserved the wrong space and jumped on load.

         They are cropped to one height rather than left at their natural
         ones: these frames are as tall as their content, so a row of them
         ends on three different baselines and reads as a layout bug. The
         crop takes from the bottom, which is where a screen has the least
         to say. -->
    <section v-if="work.screenshots?.length" class="shell mt-9">
      <div class="grid gap-5" :class="phoneShots ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
        <img
          v-for="(src, i) in work.screenshots"
          :key="src"
          :src="src"
          :alt="`${work.title} 畫面 ${i + 1}`"
          :width="phoneShots ? 750 : 1200"
          :height="phoneShots ? 1624 : 750"
          loading="lazy"
          class="w-full rounded-sm border border-rule"
          :class="phoneShots ? 'aspect-[375/812] object-cover object-top' : ''"
        />
      </div>
    </section>

    <section v-if="evidence.length" class="shell mt-9">
      <h2 class="font-display text-2xl">得獎</h2>
      <ul class="mt-4 flex flex-wrap gap-3">
        <li v-for="e in evidence" :key="e.date + e.title" class="award-pill">
          <span class="mono tabular-nums text-ink-2">{{ formatDate(e.date) }}</span>
          <span>{{ e.title }}</span>
        </li>
      </ul>
    </section>

    <section v-if="ok(work.retrospect)" class="shell mt-9">
      <h2 class="font-display text-2xl">回頭看</h2>
      <div class="mt-4 flex max-w-measure-han flex-col gap-4">
        <p v-for="(p, i) in paragraphs(work.retrospect)" :key="i" class="text-base text-ink-2">
          {{ p }}
        </p>
      </div>
    </section>

    <section class="shell mt-9">
      <h2 class="font-display text-2xl">技術</h2>
      <ul class="mt-4 flex flex-wrap gap-2">
        <li v-for="t in flatStack" :key="t" class="chip">{{ t }}</li>
      </ul>

      <p class="mt-8">
        <button type="button" class="back mono text-2xs" @click="goBack">← {{ backLabel }}</button>
      </p>
    </section>
  </article>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { timeline } = useContent()

const work = useWork(route.params.slug)

if (!work) {
  throw createError({ statusCode: 404, statusMessage: '找不到這個案例', fatal: true })
}

// Unfilled metrics are dropped rather than shown as placeholders.
const results = computed(() =>
  (work.results ?? []).filter((r) => r.value && !String(r.value).startsWith('TODO'))
)

const flatStack = computed(() =>
  Object.values(work.stack ?? {})
    .flat()
    .filter(ok)
)

/**
 * The single rule this page runs on: anything still marked TODO is not
 * rendered. Blank is honest; a placeholder in front of a recruiter is not.
 */
function ok(v) {
  return Boolean(v) && !String(v).startsWith('TODO')
}

/**
 * The decisions are the point of this page. Anyone can list a stack; what
 * separates the cases is which option was rejected and what the choice cost.
 */
const phoneShots = computed(() => work.screenshotShape === 'phone')
const links = computed(() => (work.links ?? []).filter((l) => ok(l.href)))
const decisions = computed(() => (work.decisions ?? []).filter((d) => ok(d.decision)))
const trace = computed(() => (work.trace ?? []).filter((t) => ok(t.step)))

/**
 * Go back where the reader came from, not to a fixed anchor.
 *
 * This page is reached from the film, from /portfolio, and from a search
 * result. Sending all three to the film's work beat means two of them get
 * dropped into the middle of a nine-screen scroll they never asked for.
 * `router.back()` only fires when this page was actually pushed onto the
 * stack; a cold landing gets the portfolio, which is a page, not a beat.
 */
const cameFrom = ref(false)
const backLabel = computed(() => (cameFrom.value ? '回上一頁' : '看所有作品'))

onMounted(() => {
  cameFrom.value = window.history.length > 1 && document.referrer.startsWith(window.location.origin)
})

function goBack() {
  if (cameFrom.value) router.back()
  else router.push('/portfolio')
}
const evidence = computed(() =>
  timeline.filter((e) => e.project === work.slug && (e.kind === 'award' || e.kind === 'grant'))
)

/** YAML block scalars keep blank lines; split them back into paragraphs. */
function paragraphs(text) {
  return String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

useSeoMeta({
  title: `${work.title} | 黃鉅燊 Ju-Shen Huang`,
  description: work.summary,
  ogTitle: `${work.title} | 黃鉅燊 Ju-Shen Huang`,
  ogDescription: work.summary,
  ogUrl: `https://www.ogmatcha.com/work/${work.slug}`,
})
useHead({ link: [{ rel: 'canonical', href: `https://www.ogmatcha.com/work/${work.slug}` }] })
</script>

<style scoped>
.back {
  color: var(--ink-2);
  text-decoration: underline;
  text-decoration-color: var(--rule-strong);
  text-underline-offset: 0.22em;
}

.back:hover {
  color: var(--ink);
}

.pill {
  padding: 3px 12px;
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font-family: var(--font-mono);
  font-size: var(--step--1);
}

.decision {
  padding-left: var(--sp-5);
  border-left: 1px solid var(--rule);
}

.trace-step {
  display: grid;
  grid-template-columns: 2.4em 1fr;
  gap: var(--sp-4);
  padding-block: var(--sp-4);
  border-top: 1px solid var(--rule);
}

.trace-step:last-child {
  border-bottom: 1px solid var(--rule);
}

.award-pill {
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--rule);
  border-radius: var(--r-1);
  font-size: var(--step--1);
}
</style>
