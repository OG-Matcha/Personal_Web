<template>
  <HomePage />
</template>

<script setup>
// Named for app.vue's keepalive: the home page is kept when the reader leaves it.
defineOptions({ name: 'HomeRoute' })
import HomePage from '~/components/pages/HomePage.vue'

const { en, site } = useContent()

const TITLE = 'Ju-Shen Huang 黃鉅燊'
// Under 160 characters, so search results show all of it (en.intro alone ran to 300).
const DESC = `Ju-Shen Huang (OG Matcha), co-founder and CTO of Finctory, puts LLMs inside products people use. ${site.counts.awards} awards, ${site.counts.topPrizes} national top prizes.`

useSeoMeta({
  title: TITLE,
  description: DESC,
  ogTitle: TITLE,
  ogDescription: DESC,
  ogUrl: 'https://www.ogmatcha.com/en/',
  ogLocale: 'en_US',
  twitterTitle: TITLE,
  twitterDescription: DESC,
  ogImage: 'https://www.ogmatcha.com/images/og/site-en.jpg',
  twitterImage: 'https://www.ogmatcha.com/images/og/site-en.jpg',
})
useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'canonical', href: 'https://www.ogmatcha.com/en/' },
    { rel: 'alternate', hreflang: 'zh-Hant-TW', href: 'https://www.ogmatcha.com/' },
    { rel: 'alternate', hreflang: 'en', href: 'https://www.ogmatcha.com/en/' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://www.ogmatcha.com/' },
  ],
  script: [
    jsonLdScript(
      pageNode({
        type: 'ProfilePage',
        url: 'https://www.ogmatcha.com/en/',
        name: TITLE,
        dateModified: site.asOf,
        // The profile page names whose profile it is, like the Chinese one.
        primary: true,
      })
    ),
  ],
})
</script>
