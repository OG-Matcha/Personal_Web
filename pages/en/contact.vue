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
  description: 'Write to Ju-Shen Huang (OG Matcha) about generative-AI and agent architecture, early-stage technical partnerships, talks and workshops. Leave a message on the page or send an email.',
})
</script>
