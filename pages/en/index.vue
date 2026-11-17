<template>
  <HomePage />
</template>

<script setup>
import HomePage from '~/components/pages/HomePage.vue'

const { en, site } = useContent()

const TITLE = 'Ju-Shen Huang 黃鉅燊'
const DESC = `${en.intro} Ships LLMs inside systems people use: oSave, PhishForge, a clinic operations system. ${site.counts.awards} competition awards including ${site.counts.topPrizes} national top prizes, ${site.counts.researchGrants} NSTC research grants.`

useSeoMeta({
  title: TITLE,
  description: DESC,
  ogTitle: TITLE,
  ogDescription: DESC,
  ogUrl: 'https://www.ogmatcha.com/en/',
  ogLocale: 'en_US',
  twitterTitle: TITLE,
  twitterDescription: DESC,
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
      })
    ),
  ],
})
</script>
