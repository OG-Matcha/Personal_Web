<!-- ServicesSection.vue -->
<template>
  <section>
    <section-title>我的技能體系</section-title>

    <!-- 使用六邊形技能網絡組件 -->
    <hexagon-skill-network />

    <!-- 原始服務卡片（已隱藏） -->
    <div class="hidden">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <service-card v-for="service in services" :key="service.title" v-bind="service" />
      </div>
    </div>
  </section>
</template>

<script setup>
import SectionTitle from '../common/SectionTitle.vue'
import ServiceCard from './ServiceCard.vue'
import HexagonSkillNetwork from './HexagonSkillNetwork.vue'

const services = [
  {
    icon: 'design.svg',
    title: 'Web Design',
    description: 'The most modern and high-quality design made at a professional level.',
  },
  {
    icon: 'dev.svg',
    title: 'Web Development',
    description: 'High-quality development of sites at the professional level.',
  },
  {
    icon: 'dev.svg',
    title: 'Mobile Apps',
    description: 'Professional development of applications for iOS and Android.',
  },
  {
    icon: 'photo.svg',
    title: 'Photography',
    description: 'I make high-quality photos of any category at a professional level.',
  },
]
</script>
