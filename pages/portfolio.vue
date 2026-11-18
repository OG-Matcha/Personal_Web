<template>
  <PortfolioPage />
</template>

<script setup>
import PortfolioPage from '~/components/pages/PortfolioPage.vue'

usePageSeo({
  path: '/portfolio/',
  lang: 'zh',
  type: 'CollectionPage',
  title: '作品集 | 黃鉅燊 Ju-Shen Huang',
  description:
    '黃鉅燊做過的產品：財伴 oSave（算出財務健康分數的記帳 App）、醫數行銷 MedaLink（診所的 AI 櫃檯）、PhishForge（AI 資安演練）、找好康 SurPrice（跨通路找特價）、淘換算（淘寶價格換成台幣），以及其他 Web／AI／資安專案。',
})
</script>
