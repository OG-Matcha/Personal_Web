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
    "Ju-Shen Huang's products: oSave, MedaLink, PhishForge, SurPrice, Taobao Exchange and Oshi Board, plus AI, web and security projects with source.",
})
</script>
