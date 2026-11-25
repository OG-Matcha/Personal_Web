<template>
  <!-- Inside the site's own layout: the header, the footer and the way home
       are the same as on every other page. -->
  <NuxtLayout>
    <div class="shell wrap">
      <p class="mono code">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="mt-4 font-display">{{ c.headline }}</h1>
      <p class="mt-4 max-w-measure-han text-base text-ink-2">{{ c.lede }}</p>

      <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <li v-for="l in c.links" :key="l.to">
          <NuxtLink :to="l.to" class="link">{{ l.label }}</NuxtLink>
        </li>
      </ul>

      <!-- The page is gone, the desk is not: three of the prints from the
           homepage's work, so a dead link still lands somewhere worth it. -->
      <h2 class="er-h">{{ c.prints }}</h2>
      <ul class="er-prints">
        <li v-for="w in prints" :key="w.to">
          <NuxtLink :to="w.to" class="er-link">
            <span class="er-print"><SiteShot :src="w.img" :width="w.w" :height="w.h" fit="cover" sizes="(min-width: 1024px) 22rem, 90vw" /></span>
            <span class="er-title">{{ keep(w.title) }}</span>
            <span class="er-line">{{ keep(w.line) }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </NuxtLayout>
</template>

<script setup>
/**
 * Replaces Nuxt's built-in error pages.
 *
 * Two reasons, and the second one is the load-bearing one:
 *
 *  - The defaults are white, `dark:`-prefixed and use their own type stack, so
 *    a 404 on this site looked like a different site.
 *  - Nuxt ships them as two extra chunks and puts `<link rel="prefetch">` for
 *    both on every page. Cloudflare answers prefetch requests with 503, so
 *    every single page load logged two console errors for files the page did
 *    not need. Defining this component removes those chunks entirely.
 *
 * A 404 also gets links back into the site: crawlers and readers do land on
 * dead URLs, and a dead end is a worse answer than a way back.
 */
const props = defineProps({ error: { type: Object, default: null } })

const notFound = computed(() => props.error?.statusCode === 404)

const { locale } = useLocale()
const { en } = useContent()

const PRINTS = [
  { slug: 'medalink', w: 1600, h: 900 },
  { slug: 'osave', w: 1800, h: 1200 },
  { slug: 'phishforge', w: 1600, h: 894 },
]
const prints = computed(() =>
  PRINTS.map(({ slug, w, h }) => {
    const zh = useWork(slug)
    const e = locale.value === 'en' ? en.works?.[slug] ?? {} : {}
    return {
      to: `${locale.value === 'en' ? '/en' : ''}/work/${slug}/`,
      img: zh.cover,
      w,
      h,
      title: e.title ?? zh.title,
      line: e.tagline ?? zh.tagline,
    }
  })
)

const c = computed(() =>
  locale.value === 'en'
    ? {
        headline: notFound.value ? 'Nothing lives at this address' : 'Something went wrong here',
        prints: 'Or start with one of these',
        lede: notFound.value
          ? 'The link may be mistyped, or the page has moved. These three always have something on them.'
          : 'The page did not finish loading. Reloading usually fixes it; if not, come in through one of these.',
        links: [
          { to: '/en/', label: 'Home' },
          { to: '/en/portfolio/', label: 'Work' },
          { to: '/en/resume/', label: 'Résumé' },
        ],
      }
    : {
        headline: notFound.value ? '這個網址沒有東西' : '這裡出了點問題',
        prints: '或從這幾件作品看起',
        lede: notFound.value
          ? '可能是連結打錯了，或這一頁已經不在了。下面三個地方一定有東西。'
          : '頁面沒能載入完成。重新整理通常就好了；如果沒有，從下面任一個入口進來。',
        links: [
          { to: '/', label: '首頁' },
          { to: '/portfolio/', label: '作品集' },
          { to: '/resume/', label: '履歷' },
        ],
      }
)

// The same pattern as the other pages in each language.
const title = computed(() => `${props.error?.statusCode ?? 500} | ${locale.value === 'en' ? 'Ju-Shen Huang' : '黃鉅燊 Ju-Shen Huang'}`)
const lang = computed(() => (locale.value === 'en' ? 'en' : 'zh-Hant-TW'))
useHead({ htmlAttrs: { lang } })
// An error page has no business in an index.
useSeoMeta({ title, robots: 'noindex, follow' })

// On a static host every dead URL is served 404.html, the bare app shell, and
// the error is thrown while the app is still starting. Nuxt holds back head
// updates until start-up finishes, which it never does here, so the calls
// above never reach the page: it kept the home page's title, `index, follow`
// and <html lang="zh-Hant-TW"> (an English page read in a Chinese voice).
// Write them directly; leaving through a link clears the error and Nuxt's
// head takes over again.
// Nuxt's head does not know about these writes, so the robots tag is put back
// by hand on the way out, or the next page would stay `noindex`.
let robots = null
let robotsWas = null
onMounted(() => {
  document.documentElement.lang = lang.value
  document.title = title.value
  robots = document.querySelector('meta[name="robots"]')
  robotsWas = robots?.getAttribute('content') ?? null
  if (!robots) {
    robots = document.createElement('meta')
    robots.setAttribute('name', 'robots')
    document.head.append(robots)
  }
  robots.setAttribute('content', 'noindex, follow')
})
onBeforeUnmount(() => {
  if (robotsWas === null) robots?.remove()
  else robots?.setAttribute('content', robotsWas)
})
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 70vh;
  padding-block: var(--sp-9);
}

.code {
  font-size: var(--step-3);
  color: var(--pop-ink);
  letter-spacing: 0.1em;
}

h1 {
  font-size: var(--step-4);
  font-weight: 900;
  line-height: 1.15;
}

.link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 700;
  color: var(--ink-2);
  text-decoration: underline;
  text-decoration-color: var(--rule-strong);
  text-underline-offset: 0.22em;
}

.link:hover {
  color: var(--ink);
}

.er-h {
  margin-top: var(--sp-9);
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--pop-ink);
}

.er-prints {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: var(--sp-6) var(--sp-5);
  width: 100%;
  margin-top: var(--sp-4);
  list-style: none;
}

.er-link {
  display: grid;
  gap: var(--sp-2);
  color: inherit;
  text-decoration: none;
}

/* The homepage's prints: white border, a slight alternating tilt, picked
   up (straightened, lifted) on hover. */
.er-print {
  display: block;
  margin-bottom: var(--sp-2);
  padding: 8px 8px 10px;
  border-radius: 3px;
  background: var(--print);
  box-shadow:
    0 1px 1px rgb(var(--shadow-rgb) / 0.12),
    0 18px 28px -16px rgb(var(--shadow-rgb) / 0.45);
  rotate: -0.8deg;
  transition:
    rotate 260ms var(--ease-entrance),
    transform 260ms var(--ease-entrance);
}

.er-prints li:nth-child(even) .er-print {
  rotate: 0.9deg;
}

.er-link:hover .er-print,
.er-link:focus-visible .er-print {
  rotate: 0deg;
  transform: translateY(-4px);
}

.er-print :deep(.shot) {
  aspect-ratio: 16 / 10;
}

.er-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-1);
  line-height: 1.3;
}

.er-link:hover .er-title {
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
  text-underline-offset: 0.2em;
}

.er-line {
  font-size: var(--step--1);
  color: var(--ink-2);
  text-wrap: pretty;
}
</style>
