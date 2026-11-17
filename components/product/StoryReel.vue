<template>
  <!--
    The years, as five questions. On a wide screen with the scene on, the
    section pins and scrolling moves the five panels sideways; anywhere else
    they simply stack. Each panel's events are its date range on the
    timeline, so this can never disagree with /resume.
  -->
  <section id="record" ref="root" class="sr" aria-labelledby="sr-title">
    <div class="sr-pin">
      <header class="sr-head">
        <h2 id="sr-title" class="sr-title">{{ c.title }}</h2>
        <p class="sr-lede">{{ c.lede }}</p>
        <div class="sr-progress" aria-hidden="true"><span ref="bar" /></div>
      </header>

      <ol ref="strip" class="sr-strip">
        <li v-for="(b, i) in panels" :key="b.id" class="sr-panel">
          <p class="sr-when figures">
            <span class="sr-num">{{ String(i + 1).padStart(2, '0') }}</span>
            {{ range(b) }}
          </p>
          <h3 class="sr-q">{{ b.title }}</h3>
          <p v-if="b.lede" class="sr-text">{{ b.lede }}</p>
          <ul class="sr-events">
            <li v-for="e in b.shown" :key="e.date + e.title">
              <time class="figures" :datetime="e.date">{{ formatDate(e.date) }}</time>
              <span>{{ e.title }}</span>
            </li>
          </ul>
          <p v-if="b.more" class="sr-more">
            <NuxtLink :to="`${pre}/resume/`">{{ c.more(b.more) }}</NuxtLink>
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
const { beats, en } = useContent()
const { locale } = useLocale()
const isEn = computed(() => locale.value === 'en')
const pre = computed(() => (isEn.value ? '/en' : ''))

const SHOW = 5

const c = computed(() =>
  isEn.value
    ? {
        title: 'The years in between',
        lede: 'Five questions I had to answer, each followed by what actually happened.',
        more: (n) => `${n} more in the full record`,
      }
    : {
        title: '這幾年',
        lede: '五個我得回答的問題，每一個後面接著當時實際發生的事。',
        more: (n) => `還有 ${n} 筆，見完整年表`,
      }
)

const panels = computed(() =>
  beats.map((b) => {
    const tr = isEn.value ? en.beats?.[b.id] ?? {} : {}
    const events = b.events.map((e) => {
      const t = isEn.value ? en.timeline?.[`${e.date} ${e.title}`] ?? {} : {}
      return { date: e.date, title: t.title ?? e.title }
    })
    // Newest-last inside a panel reads as a story; keep the latest few.
    const shown = events.length > SHOW ? events.slice(-SHOW) : events
    return { id: b.id, from: b.from, to: b.to, title: tr.title ?? b.title, lede: tr.lede ?? b.lede, shown, more: events.length - shown.length }
  })
)

const range = (b) => (b.from.slice(0, 4) === b.to.slice(0, 4) && b.from.endsWith('-01') && b.to.endsWith('-12') ? b.from.slice(0, 4) : `${formatDate(b.from)} – ${formatDate(b.to)}`)

const root = ref(null)
const strip = ref(null)
const bar = ref(null)
let ctx = null
let mm = null

onMounted(async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    mm = gsap.matchMedia()
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      if (!('scene' in document.documentElement.dataset)) return
      const distance = () => strip.value.scrollWidth - strip.value.clientWidth
      const tw = gsap.to(strip.value, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.value,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: root.value.querySelector('.sr-pin'),
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (st) => bar.value && (bar.value.style.transform = `scaleX(${st.progress})`),
        },
      })
      root.value.classList.add('is-reel')
      return () => {
        tw.scrollTrigger?.kill()
        tw.kill()
        root.value?.classList.remove('is-reel')
      }
    })
  }, root.value)
})

onBeforeUnmount(() => {
  mm?.revert()
  ctx?.revert()
})
</script>

<style scoped>
.sr {
  border-top: 1px solid var(--rule);
}

.sr-pin {
  padding-block: var(--sp-9);
}

.sr-head {
  padding-inline: clamp(var(--sp-4), 6vw, 9rem);
  max-width: 60rem;
}

.sr-title {
  font-family: var(--font-display);
  font-size: var(--step-5);
  font-weight: 900;
  line-height: 1.05;
}

.sr-lede {
  margin-top: var(--sp-4);
  font-size: var(--step-1);
  color: var(--ink-2);
  max-width: 34em;
}

.sr-progress {
  display: none;
}

.sr-strip {
  display: grid;
  gap: var(--sp-6);
  margin-top: var(--sp-8);
  padding-inline: clamp(var(--sp-4), 6vw, 9rem);
  list-style: none;
}

.sr-panel {
  padding: var(--sp-7);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-2);
  max-width: 50rem;
}

.sr-when {
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.sr-num {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: var(--step-2);
  color: var(--pop-ink);
}

.sr-q {
  word-break: keep-all;
  overflow-wrap: anywhere;
  margin-top: var(--sp-4);
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 900;
  line-height: 1.15;
  text-wrap: balance;
}

.sr-text {
  margin-top: var(--sp-4);
  color: var(--ink-2);
  max-width: 34em;
}

.sr-events {
  display: grid;
  gap: var(--sp-2);
  margin-top: var(--sp-6);
  padding-top: var(--sp-5);
  border-top: 1px solid var(--rule);
  list-style: none;
  font-size: var(--step--1);
}

.sr-events li {
  display: grid;
  grid-template-columns: 4.5em 1fr;
  gap: var(--sp-3);
}

.sr-events time {
  color: var(--ink-3);
}

.sr-more {
  margin-top: var(--sp-4);
  font-size: var(--step--1);
}

.sr-more a {
  color: var(--pop-ink);
  font-weight: 600;
}

/* ---- The reel: one row, moved sideways by scroll ------------------ */

.sr.is-reel .sr-pin {
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-block: calc(var(--header-h) + var(--sp-5)) var(--sp-6);
  overflow: hidden;
}

.sr.is-reel .sr-head {
  max-width: none;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: end;
  gap: var(--sp-2) var(--sp-7);
}

.sr.is-reel .sr-lede {
  margin-top: 0;
}

.sr.is-reel .sr-progress {
  display: block;
  grid-column: 1 / -1;
  height: 3px;
  margin-top: var(--sp-4);
  border-radius: 999px;
  background: var(--rule);
  overflow: hidden;
}

.sr.is-reel .sr-progress span {
  display: block;
  height: 100%;
  background: var(--pop);
  transform-origin: left;
  transform: scaleX(0);
}

.sr.is-reel .sr-strip {
  display: flex;
  gap: var(--sp-6);
  margin-top: var(--sp-6);
  width: 100%;
  will-change: transform;
}

.sr.is-reel .sr-panel {
  flex: 0 0 min(36rem, 42vw);
  padding: var(--sp-6);
}
</style>
