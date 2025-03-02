<template>
  <div class="app-container">
    <!-- 初次載入動畫 -->
    <PageLoader v-if="!pageInitialLoaded" @completed="onPageLoadComplete" />

    <!-- 頁面過渡效果 -->
    <PageTransition>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </PageTransition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import PageLoader from '~/components/animation/PageLoader.vue'
import PageTransition from '~/components/animation/PageTransition.vue'
import ProfileCard from '~/components/profile/ProfileCard.vue'
import NavBar from '~/components/navigation/NavBar.vue'
import AboutSection from '~/components/about/AboutSection.vue'
import ServicesSection from '~/components/services/ServicesSection.vue'

// 頁面初始載入狀態
const pageInitialLoaded = ref(false)

// 確保頁面可以滾動
const ensurePageScrollable = () => {
  // 移除任何可能阻止滾動的類
  document.body.classList.remove('overflow-hidden')

  // 確保右側內容區域可滾動
  const mainContent = document.getElementById('mainContent')
  if (mainContent) {
    mainContent.style.overflowY = 'auto'
  }

  // 如果仍有滾動問題，強制啟用滾動
  if (window.getComputedStyle(document.body).overflow === 'hidden') {
    document.body.style.overflow = 'auto'
  }
}

// 首次訪問頁面時檢查
onMounted(() => {
  // 檢查是否有之前訪問過
  const hasVisitedBefore = localStorage.getItem('hasVisitedBefore')

  if (hasVisitedBefore) {
    // 如果之前訪問過，立即完成初始加載
    pageInitialLoaded.value = true

    // 確保頁面可滾動（對於後續訪問）
    nextTick(() => {
      ensurePageScrollable()
    })
  }
})

// 頁面加載完成處理函數
const onPageLoadComplete = () => {
  pageInitialLoaded.value = true

  // 記錄訪問狀態，下次訪問不再顯示完整加載動畫
  localStorage.setItem('hasVisitedBefore', 'true')

  // 確保動畫結束後頁面可以滾動
  nextTick(() => {
    ensurePageScrollable()

    // 延遲再次檢查，以防其他代碼影響滾動
    setTimeout(ensurePageScrollable, 300)
    setTimeout(ensurePageScrollable, 1000)
  })
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: #1a1a1a;
}

body {
  box-sizing: border-box;
  position: relative;
}

.app-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* 調整行動裝置的樣式 */
@media screen and (max-width: 425px) {
  html,
  body {
    width: 100%;
    min-width: 320px; /* 確保有最小寬度 */
  }

  .nuxt-page-enter-active,
  .nuxt-page-leave-active,
  .nuxt-layout-enter-active,
  .nuxt-layout-leave-active {
    transition: all 0.2s;
  }

  .nuxt-page-enter-from,
  .nuxt-page-leave-to,
  .nuxt-layout-enter-from,
  .nuxt-layout-leave-to {
    opacity: 0;
  }
}

/* 添加全局動畫類 */
.animate-on-view {
  opacity: 0;
  will-change: opacity, transform;
}

.animate-on-view.animated {
  opacity: 1;
  transition:
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-fadeup {
  transform: translateY(30px);
}
.animate-fadeup.animated {
  transform: translateY(0);
}

.animate-fadedown {
  transform: translateY(-30px);
}
.animate-fadedown.animated {
  transform: translateY(0);
}

.animate-fadeleft {
  transform: translateX(-30px);
}
.animate-fadeleft.animated {
  transform: translateX(0);
}

.animate-faderight {
  transform: translateX(30px);
}
.animate-faderight.animated {
  transform: translateX(0);
}

.animate-zoom {
  transform: scale(0.9);
}
.animate-zoom.animated {
  transform: scale(1);
}

/* 動畫延遲類 */
.delay-1 {
  transition-delay: 0s;
}
.delay-2 {
  transition-delay: 0.2s;
}
.delay-3 {
  transition-delay: 0.4s;
}
.delay-4 {
  transition-delay: 0.6s;
}
.delay-5 {
  transition-delay: 0.8s;
}
</style>
