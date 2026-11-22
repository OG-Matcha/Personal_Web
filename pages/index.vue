<template>
  <HomePage />
</template>

<script setup>
// Named for app.vue's keepalive: the home page is kept when the reader leaves it.
defineOptions({ name: 'HomeRoute' })
import HomePage from '~/components/pages/HomePage.vue'

const { site } = useContent()

// Counts come from the timeline (useContent), never from a remembered number.
// About 80 characters: LINE and Facebook cut a preview around there, and the
// 188-character version lost the awards off its end.
const DESC = `黃鉅燊（OG_Matcha），斐闊 Finctory 技術長、MedaLink 共同創辦人。把 AI 從展示品做到三個月後還有人在用；${site.counts.awards} 項競賽獎項，${site.counts.topPrizes} 座全國首獎。`

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
