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
    '黃鉅燊的交付紀錄：財伴 oSave（以會計邏輯記帳、算出六項財務健康指標的 iOS／Android App）、PhishForge（生成式 AI 資安演練平台）、醫數行銷 MedaLink、斐闊 Finctory，以及其他 Web／AI／資安專案。',
})
</script>
