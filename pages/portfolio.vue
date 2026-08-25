<template>
  <div class="pt-8">
    <WorkSection />
  </div>
</template>

<script setup>
import WorkSection from '~/components/sections/WorkSection.vue'

useSeoMeta({
  title: '作品集 | 黃鉅燊 Ju-Shen Huang',
  description:
    '黃鉅燊的交付紀錄：財伴 oSave（LLM Multi-Agent 理財助手）、PhishForge（生成式 AI 資安演練平台）、斐闊 Finctory，以及其他 Web／AI／資安專案。',
  ogTitle: '作品集 | 黃鉅燊 Ju-Shen Huang',
  ogUrl: 'https://www.ogmatcha.com/portfolio',
})
useHead({ link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com/portfolio' }] })
</script>
