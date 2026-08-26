<template>
  <div class="shell wrap">
    <p class="mono code">{{ error?.statusCode ?? 500 }}</p>
    <h1 class="mt-4 font-display">{{ headline }}</h1>
    <p class="mt-4 max-w-measure-han text-base text-ink-2">{{ lede }}</p>

    <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
      <li v-for="l in links" :key="l.to">
        <NuxtLink :to="l.to" class="mono text-2xs link">{{ l.label }}</NuxtLink>
      </li>
    </ul>
  </div>
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

const headline = computed(() => (notFound.value ? '這個網址沒有東西' : '這裡出了點問題'))

const lede = computed(() =>
  notFound.value
    ? '可能是連結打錯了，或這一頁已經不在了。下面三個地方一定有東西。'
    : '頁面沒能載入完成。重新整理通常就好了；如果沒有，從下面任一個入口進來。'
)

const links = [
  { to: '/', label: '首頁' },
  { to: '/portfolio/', label: '作品集' },
  { to: '/resume/', label: '履歷' },
]

useSeoMeta({
  title: computed(() => `${props.error?.statusCode ?? 500} | 黃鉅燊 Ju-Shen Huang`),
  // An error page has no business in an index.
  robots: 'noindex, follow',
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
  font-size: var(--step-3);
}

.link {
  color: var(--ink-2);
  text-decoration: underline;
  text-decoration-color: var(--rule-strong);
  text-underline-offset: 0.22em;
}

.link:hover {
  color: var(--ink);
}
</style>
