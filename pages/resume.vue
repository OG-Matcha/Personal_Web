<template>
  <ResumePage />
</template>

<script setup>
import ResumePage from '~/components/pages/ResumePage.vue'

const { site } = useContent()

usePageSeo({
  path: '/resume/',
  lang: 'zh',
  type: 'WebPage',
  dateModified: site.asOf,
  title: '履歷 | 黃鉅燊 Ju-Shen Huang',
  // Counted from content/timeline.yml, never remembered.
  description: `黃鉅燊完整年表：${site.counts.awards} 項競賽獎項（含 ${site.counts.topPrizes} 座全國首獎）、${site.counts.researchGrants} 個國科會研究計畫、工研院產科國際所、斐闊 Finctory 共同創辦人暨技術長、醫數行銷 MedaLink 共同創辦人暨前線部署工程師、中央大學資訊管理學系（商業智慧與分析、人工智慧跨域應用學分學程）。`,
})
</script>
