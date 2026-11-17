<template>
  <ResumePage />
</template>

<script setup>
import ResumePage from '~/components/pages/ResumePage.vue'

const { site } = useContent()

usePageSeo({
  path: '/resume/',
  lang: 'en',
  type: 'WebPage',
  dateModified: site.asOf,
  title: 'Résumé | Ju-Shen Huang 黃鉅燊',
  description: `Ju-Shen Huang's full record: ${site.counts.awards} competition awards (${site.counts.topPrizes} national top prizes), ${site.counts.researchGrants} NSTC research grants, ITRI ISTI, co-founder and CTO of Finctory, co-founder and forward-deployed engineer at MedaLink, Information Management at National Central University (credit programs in Business Intelligence & Analytics and Cross-domain Applications of AI).`,
})
</script>
