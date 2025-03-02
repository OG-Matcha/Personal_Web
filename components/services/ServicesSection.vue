<!-- ServicesSection.vue -->
<template>
  <section>
    <section-title>我的技能體系</section-title>
    <!-- 使用六邊形技能網絡組件 -->
    <hexagon-skill-network />
  </section>
</template>

<script setup>
import SectionTitle from '../common/SectionTitle.vue'
import HexagonSkillNetwork from './HexagonSkillNetwork.vue'
</script>
