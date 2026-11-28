<template>
  <CasePage v-if="work" :work="work" :evidence="evidence" />
</template>

<script setup>
import CasePage from '~/components/pages/CasePage.vue'

const route = useRoute()
const { timeline } = useContent()

const work = useWork(route.params.slug)

if (!work) {
  throw createError({ statusCode: 404, statusMessage: '找不到這個案例', fatal: true })
}

const evidence = computed(() =>
  timeline.filter((e) => e.project === work.slug && (e.kind === 'award' || e.kind === 'grant'))
)

// A case may name itself the way people search for it (seoTitle) and lead its
// snippet with who and what (seoDescription); otherwise its title and summary.
const seoTitle = `${work.seoTitle ?? work.title} | 黃鉅燊 Ju-Shen Huang`
const seoDescription = work.seoDescription ?? work.summary

// The products with a share card of their own (public/images/og/, made by scripts/make-og.mjs).
const OG_WORKS = new Set(['finctory', 'medalink', 'osave', 'phishforge', 'surprice', 'taobao', 'catalyst', 'ifalab'])

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogUrl: `https://www.ogmatcha.com/work/${work.slug}/`,
  // Globally 'profile', which told every scraper that a product page was a
  // personal profile.
  ogType: 'article',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  // Each product shared to LINE or LinkedIn shows its own picture, not the site's.
  ...(OG_WORKS.has(work.slug) ? { ogImage: `https://www.ogmatcha.com/images/og/${work.slug}-card.jpg`, twitterImage: `https://www.ogmatcha.com/images/og/${work.slug}-card.jpg` } : {}),
})

// The product node and breadcrumb, shared with the English page.
const url = `https://www.ogmatcha.com/work/${work.slug}/`
const schema = workSchema(work, { lang: 'zh', name: work.title, description: work.summary })

useHead({
  link: [
    { rel: 'canonical', href: url },
    { rel: 'alternate', hreflang: 'zh-Hant-TW', href: url },
    { rel: 'alternate', hreflang: 'en', href: `https://www.ogmatcha.com/en/work/${work.slug}/` },
    { rel: 'alternate', hreflang: 'x-default', href: url },
  ],
  script: [
    jsonLdScript({
      '@context': 'https://schema.org',
      '@graph': [
        { ...pageNode({ type: 'WebPage', url, name: work.title }), mainEntity: { '@id': schema.id } },
        schema.node,
        schema.crumbs,
      ],
    }),
  ],
})
</script>
