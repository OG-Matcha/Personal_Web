<template>
  <div class="pt-8 pb-section">
    <!-- The page had no h1 at all, so its only subject signal was the title
         tag. Visually hidden because CaseStudies already carries the visible
         heading; .sr-only clips, it does not display:none, so it ships. -->
    <h1 class="sr-only">作品集 · 黃鉅燊 Ju-Shen Huang</h1>
    <CaseStudies />
    <AlsoBuilt />
  </div>
</template>

<script setup>
import CaseStudies from '~/components/sections/CaseStudies.vue'
import AlsoBuilt from '~/components/sections/AlsoBuilt.vue'

// One string, three meta fields. Passing only `description` let the site-wide
// blurb from nuxt.config win for og: and, by fallback, for the X card - so the
// page advertised the homepage's summary to every scraper.
const TITLE = '作品集 | 黃鉅燊 Ju-Shen Huang'
// 「LLM Multi-Agent 理財助手」described 發票醫生, the product before the pivot.
// content/work/osave.yml says the opposite: three layers of classification and
// only the last one calls a model.
const DESC =
  '黃鉅燊的交付紀錄：財伴 oSave（以會計邏輯記帳、算出六項財務健康指標的 iOS／Android App）、PhishForge（生成式 AI 資安演練平台）、醫數行銷 MedaLink、斐闊 Finctory，以及其他 Web／AI／資安專案。'

useSeoMeta({
  title: TITLE,
  description: DESC,
  ogTitle: TITLE,
  ogDescription: DESC,
  ogUrl: 'https://www.ogmatcha.com/portfolio/',
  // Globally 'profile', which is true of the homepage and of nothing else.
  ogType: 'website',
  twitterTitle: TITLE,
  twitterDescription: DESC,
})
useHead({
  link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com/portfolio/' }],
  script: [
    jsonLdScript(
      pageNode({
        type: 'CollectionPage',
        url: 'https://www.ogmatcha.com/portfolio/',
        name: TITLE,
      })
    ),
  ],
})
</script>
