<template>
  <HomePage />
</template>

<script setup>
import HomePage from '~/components/pages/HomePage.vue'

const { about, site } = useContent()

// Counts come from the timeline (useContent), never from a remembered number.
const DESC = `${about.intro}把 LLM 放進會出貨的系統裡：財伴 oSave、PhishForge、診所營運系統。${site.counts.awards} 項競賽獎項含 ${site.counts.topPrizes} 座全國首獎，${site.counts.researchGrants} 個國科會研究計畫。`

useSeoMeta({
  description: DESC,
  ogDescription: DESC,
  twitterDescription: DESC,
})
useHead({
  link: [
    { rel: 'canonical', href: 'https://www.ogmatcha.com/' },
    { rel: 'alternate', hreflang: 'zh-Hant-TW', href: 'https://www.ogmatcha.com/' },
    { rel: 'alternate', hreflang: 'en', href: 'https://www.ogmatcha.com/en/' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://www.ogmatcha.com/' },
  ],
  script: [
    jsonLdScript(
      pageNode({
        type: 'ProfilePage',
        url: 'https://www.ogmatcha.com/',
        name: `${site.person.nameZh} ${site.person.nameEn}`,
        dateModified: site.asOf,
        primary: true,
      })
    ),
  ],
})
</script>
