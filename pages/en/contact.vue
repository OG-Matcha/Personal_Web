<template>
  <ContactPage />
</template>

<script setup>
import ContactPage from '~/components/pages/ContactPage.vue'

usePageSeo({
  path: '/contact/',
  lang: 'en',
  type: 'ContactPage',
  title: 'Contact Ju-Shen Huang: projects, talks and workshops | 黃鉅燊',
  description: 'Write to Ju-Shen Huang (OG Matcha) about generative-AI and agent architecture, technical partnerships, talks or workshops: leave a message or email.',
})
</script>
