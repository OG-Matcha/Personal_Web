<template>
  <PortfolioPage />
</template>

<script setup>
import PortfolioPage from '~/components/pages/PortfolioPage.vue'

usePageSeo({
  path: '/portfolio/',
  lang: 'en',
  type: 'CollectionPage',
  title: 'Work | Ju-Shen Huang 黃鉅燊',
  description:
    "Ju-Shen Huang's products: Finctory, oSave, MedaLink, PhishForge, SurPrice and Taobao Exchange, plus smaller AI, web and security projects.",
})
</script>
