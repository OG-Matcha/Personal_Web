<!-- NavBar.vue -->
<template>
  <nav class="flex items-center border-b border-[#2D2D2D] p-4 sm:p-5 md:p-6">
    <!-- 漢堡選單按鈕 (只在小螢幕顯示) -->
    <div class="lg:hidden">
      <button
        @click="$emit('toggle-menu')"
        class="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#2a2a2a] to-[#242424] shadow-lg transition-all duration-300 hover:from-[#333] hover:to-[#292929] focus:outline-none"
        aria-label="開啟側邊選單"
      >
        <span class="relative block h-4 w-5">
          <span
            class="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
          ></span>
          <span
            class="absolute left-0 top-1.5 h-0.5 w-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
          ></span>
          <span
            class="absolute left-0 top-3 h-0.5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
          ></span>
        </span>
      </button>
    </div>

    <!-- 導航連結 - 確保容器有明確最大寬度，防止溢出 -->
    <div class="nav-links-wrapper flex justify-end">
      <div class="nav-links-container flex gap-3 sm:gap-4 md:gap-5 lg:gap-7 xl:gap-8">
        <nav-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :active="!stickyNavVisible && route.path === item.to"
          :class="{
            'portfolio-page-active': item.text === 'Portfolio' && route.path === '/portfolio',
          }"
        >
          {{ item.text }}
        </nav-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import NavLink from './NavLink.vue'
import { useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'

const route = useRoute()
defineEmits(['toggle-menu'])

// 檢查StickyNav的可見狀態
const stickyNavVisible = ref(false)

// 監聽滾動事件以檢測StickyNav的可見狀態
const checkStickyNavVisible = () => {
  stickyNavVisible.value = window.scrollY > 150 // 與StickyNav的showThreshold保持一致
}

onMounted(() => {
  window.addEventListener('scroll', checkStickyNavVisible, { passive: true })
  // 初始檢查
  checkStickyNavVisible()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', checkStickyNavVisible)
})

const navItems = [
  { to: '/', text: 'About' },
  { to: '/resume', text: 'Resume' },
  { to: '/portfolio', text: 'Portfolio' },
  { to: '/news', text: 'News' },
]
</script>

<style scoped>
/* 確保滾動條不可見 */
.overflow-hidden {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.overflow-hidden::-webkit-scrollbar {
  display: none;
}

/* 導航容器包裝器 - 固定寬度並防止溢出 */
.nav-links-wrapper {
  display: flex;
  max-width: calc(100% - 60px); /* 減去漢堡選單的寬度和一些間距 */
  overflow-x: auto; /* 允許水平滾動 */
  scrollbar-width: none; /* 隱藏滾動條 */
}

.nav-links-wrapper::-webkit-scrollbar {
  display: none; /* Chrome/Safari 隱藏滾動條 */
}

/* 導航項目容器 */
.nav-links-container {
  justify-content: flex-end;
  flex-wrap: nowrap;
  width: max-content; /* 確保容器可以容納所有項目 */
}

/* 針對超小螢幕的特殊調整 */
@media (max-width: 530px) {
  nav {
    padding: 0.75rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 確保漢堡菜單和導航項目之間的間距合理 */
  }

  .nav-links-container {
    gap: 0.5rem;
  }

  button.flex.h-10.w-10 {
    height: 2rem;
    width: 2rem;
  }

  button span.h-4.w-5 {
    height: 0.75rem;
    width: 1rem;
  }

  /* 調整導航包裝器寬度和定位 */
  .nav-links-wrapper {
    max-width: calc(100% - 45px); /* 增加空間 */
  }
}

/* 新增：520px-640px 過渡區間優化 */
@media (min-width: 521px) and (max-width: 639px) {
  .nav-links-container {
    gap: 0.5rem;
  }

  nav {
    padding: 0.75rem 0.6rem;
  }
}

/* 難點斷點區間 (640px-900px) 特殊處理 */
@media (min-width: 640px) and (max-width: 900px) {
  /* 其他項目也適當縮小 */
  .nav-link {
    flex-basis: auto; /* 根據內容確定基礎大小 */
  }
}

/* 調整困難區段的特殊設定 */
@media (min-width: 768px) and (max-width: 830px) {
  .nav-links-container {
    gap: 0.375rem !important; /* 適度縮小間距 */
  }
}
</style>
