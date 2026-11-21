<template>
  <ContactPage />
</template>

<script setup>
import ContactPage from '~/components/pages/ContactPage.vue'

usePageSeo({
  path: '/contact/',
  lang: 'zh',
  type: 'ContactPage',
  title: '聯絡黃鉅燊：合作、演講與工作坊 | Ju-Shen Huang',
  description: '寫信給黃鉅燊（OG Matcha）：生成式 AI 與 agent 架構、早期技術合作、演講與工作坊。可以直接在網頁上留言，或寄 email。',
})
</script>
