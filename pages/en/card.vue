<template>
  <CardPage />
</template>

<script setup>
import CardPage from '~/components/pages/CardPage.vue'

definePageMeta({ layout: false })
usePageSeo({
  path: '/card/',
  lang: 'en',
  type: 'WebPage',
  title: 'Ju-Shen Huang’s card | 黃鉅燊',
  description: 'Ju-Shen Huang (OG Matcha), as a contact card: save it to your phone in one tap, or leave yours.',
})
useCardHead()
</script>
