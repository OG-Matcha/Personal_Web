<!-- pages/index.vue -->
<template>
  <div class="p-8">
    <AnimateOnView animation-type="fade-up" :delay="1">
      <about-section class="mb-16" />
    </AnimateOnView>

    <AnimateOnView animation-type="fade-up" :delay="2">
      <services-section class="mb-16" />
    </AnimateOnView>

    <AnimateOnView animation-type="fade-up" :delay="3">
      <tech-dashboard-section />
    </AnimateOnView>
  </div>
</template>

<script setup>
import { useHead } from '#imports'
import AboutSection from '~/components/about/AboutSection.vue'
import ServicesSection from '~/components/services/ServicesSection.vue'
import TechDashboardSection from '~/components/dashboard/TechDashboard.vue'
import AnimateOnView from '~/components/animation/AnimateOnView.vue'

// 設置頁面元數據
useHead({
  title: 'Portfolio | Ju-Shen Huang - OG_Matcha | Finctory CTO',
  meta: [
    { name: 'description', content: '黃鉅燊的個人網站，展示專業技能、作品集與履歷' },
    {
      name: 'keywords',
      content: '黃鉅燊, Ju-Shen Huang, OG_Matcha, 斐闊, Finctory, 作品集, 網頁開發, 前端開發',
    },
    { property: 'og:title', content: 'Portfolio | Ju-Shen Huang - OG_Matcha | Finctory CTO' },
    { property: 'og:description', content: 'OG_Matcha 的個人網站，展示作品集與專業經歷' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.ogmatcha.com' },
    {
      property: 'og:image',
      content: 'https://www.ogmatcha.com/images/my-avatar.jpg',
    },
  ],
  link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com' }],
})
</script>
