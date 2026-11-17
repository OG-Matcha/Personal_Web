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
    'What Ju-Shen Huang has shipped: oSave (an iOS / Android app that keeps books with accounting logic and computes six financial-health indicators), PhishForge (a generative-AI security-drill platform), MedaLink, Finctory, and other web, AI and security projects.',
})
</script>
