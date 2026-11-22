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
  title: `Ju-Shen Huang résumé: ${site.counts.awards} awards, ${site.counts.topPrizes} national top prizes | 黃鉅燊`,
  description: `Ju-Shen Huang's full record: ${site.counts.awards} competition awards (${site.counts.topPrizes} national top prizes), ${site.counts.researchGrants} NSTC grants, ITRI, Finctory CTO, MedaLink co-founder, NCU.`,
})
</script>
