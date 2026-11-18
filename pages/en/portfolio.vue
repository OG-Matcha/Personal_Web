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
    'What Ju-Shen Huang has built: oSave (a budgeting app that scores your financial health), MedaLink (an AI front desk for clinics), PhishForge (AI-written phishing drills), SurPrice (deals across every supermarket chain), Taobao Exchange (Taobao prices in NT$), and other web, AI and security projects.',
})
</script>
