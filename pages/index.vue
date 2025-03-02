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
import AboutSection from '~/components/about/AboutSection.vue'
import ServicesSection from '~/components/services/ServicesSection.vue'
import TechDashboardSection from '~/components/dashboard/TechDashboard.vue'
import AnimateOnView from '~/components/animation/AnimateOnView.vue'
</script>
