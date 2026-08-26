<template>
  <div class="pt-8 pb-section">
    <!-- A real header, not a hidden one. This page used to open straight into
         a component the homepage also renders, which made it read as a
         fragment of the homepage rather than a destination. It is the index:
         everything, in one place, with no film in front of it. -->
    <div class="shell pb-9">
      <h1 class="font-display text-3xl">作品集</h1>
      <p class="measure mt-3 text-base text-ink-2">{{ works.length }} 件寫成案例研究，另外 {{ alsoBuilt.length }} 件列在後面。首頁只放案例研究，其餘的都在這一頁。</p>
    </div>

    <CaseStudies />
    <AlsoBuilt />
  </div>
</template>

<script setup>
import CaseStudies from '~/components/sections/CaseStudies.vue'
import AlsoBuilt from '~/components/sections/AlsoBuilt.vue'

const { works, alsoBuilt } = useContent()

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
