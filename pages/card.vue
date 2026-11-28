<template>
  <CardPage />
</template>

<script setup>
import CardPage from '~/components/pages/CardPage.vue'

// A page for the phone in someone's hand, reached by QR or NFC: no site
// header or footer, and kept out of search (the contact page is the one to find).
definePageMeta({ layout: false })
usePageSeo({
  path: '/card/',
  lang: 'zh',
  type: 'WebPage',
  title: '黃鉅燊的名片 | Ju-Shen Huang',
  description: '黃鉅燊（OG Matcha）的電子名片：一鍵存到通訊錄，也可以留下你的聯絡方式。',
})
useCardHead()
</script>
