<!-- TechDashboard.vue - 技術儀表板主容器 -->
<template>
  <div class="tech-dashboard">
    <h2 class="mb-8 text-center text-2xl font-bold">技術能力圖譜</h2>
    <p class="mb-8 text-center text-lg text-gray-300">
      以視覺化方式展示我掌握的各種技術、框架與工具，點擊分類標籤可切換不同技術領域
    </p>

    <!-- 框架和工具經驗 -->
    <div class="dashboard-card">
      <framework-experience-chart />
    </div>
  </div>
</template>

<script setup>
import FrameworkExperienceChart from './FrameworkExperienceChart.vue'
</script>

<style scoped>
.tech-dashboard {
  padding: 2rem 0;
}

.dashboard-card {
  background: rgba(17, 24, 39, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
