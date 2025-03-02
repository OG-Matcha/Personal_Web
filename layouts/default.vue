<!-- layouts/default.vue -->
<template>
  <div
    class="flex min-h-screen w-full flex-col bg-[#1A1A1A] text-white antialiased lg:h-screen lg:overflow-hidden"
  >
    <div
      class="flex flex-1 flex-col px-2 py-3 sm:px-3 sm:py-4 md:px-5 md:py-6 lg:h-full lg:px-6 lg:py-8"
    >
      <div
        class="mx-auto grid w-full max-w-7xl flex-1 grid-rows-1 gap-3 sm:gap-4 md:gap-5 lg:h-full lg:grid-cols-[300px,1fr] lg:gap-8 xl:gap-10"
      >
        <!-- 左側個人資料卡片（僅在大螢幕顯示） -->
        <div class="hidden h-full lg:block">
          <div class="h-full lg:sticky lg:top-8">
            <AnimateOnView animation-type="fade-right" :delay="1">
              <profile-card class="animate-on-page-enter h-full" />
            </AnimateOnView>
          </div>
        </div>

        <!-- 右側內容區域 - 確保此區域可以滾動 -->
        <div class="h-full w-full lg:col-start-2 lg:h-full lg:overflow-auto">
          <div
            class="xs:rounded-[15px] flex h-full flex-col overflow-hidden rounded-[12px] bg-[#242424] shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] sm:rounded-[18px] md:rounded-[22px] lg:rounded-[28px]"
          >
            <!-- 導航欄 -->
            <AnimateOnView animation-type="fade-down" :delay="1">
              <nav-bar @toggle-menu="toggleSidebar" class="animate-on-page-enter" />
            </AnimateOnView>

            <!-- 主要內容 - 增加滾動恢復檢查 -->
            <div
              id="mainContent"
              class="dark-scroll smooth-scroll content-container xs:p-4 flex-1 overflow-y-auto p-3 sm:p-5 md:p-6"
              ref="mainContentRef"
            >
              <AnimateOnView animation-type="fade-up" :delay="2">
                <slot />
              </AnimateOnView>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 簡約 Sticky 導航欄（僅在小螢幕滾動時顯示） -->
    <sticky-nav @toggle-menu="toggleSidebar" :show-threshold="150" />

    <!-- 側邊選單 (僅使用內容部分，按鈕已在NavBar中) -->
    <hamburger-menu ref="hamburgerMenu">
      <template #content>
        <profile-card class="h-full" />
      </template>
    </hamburger-menu>
  </div>
</template>

<script setup>
import ProfileCard from '~/components/profile/ProfileCard.vue'
import NavBar from '~/components/navigation/NavBar.vue'
import HamburgerMenu from '~/components/navigation/HamburgerMenu.vue'
import StickyNav from '~/components/navigation/StickyNav.vue'
import AnimateOnView from '~/components/animation/AnimateOnView.vue'
import { ref, provide, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const hamburgerMenu = ref(null)
const route = useRoute()
const mainContentRef = ref(null)

// 確保內容區域可以滾動
const ensureContentScrollable = () => {
  if (mainContentRef.value) {
    mainContentRef.value.style.overflowY = 'auto'
  }
}

// 在組件掛載後確保滾動
onMounted(() => {
  ensureContentScrollable()

  // 延遲檢查，確保在動畫完成後仍能滾動
  setTimeout(ensureContentScrollable, 1000)
  setTimeout(ensureContentScrollable, 2000)
})

// 導航狀態管理
const navStore = reactive({
  hasActiveLink: false,
  activeLinks: new Map(),
  currentRoute: null, // 新增：儲存當前路由路徑

  // 設置全局活動狀態
  setHasActiveLink(value) {
    this.hasActiveLink = value
  },

  // 更新特定路徑的活動狀態
  updateActiveLink(path, isActive) {
    if (isActive) {
      this.activeLinks.set(path, true)
      this.hasActiveLink = true
    } else {
      this.activeLinks.delete(path)
      this.hasActiveLink = this.activeLinks.size > 0
    }
  },

  // 設置當前路由
  setCurrentRoute(path) {
    this.currentRoute = path

    // 路由變化時確保內容可滾動
    setTimeout(ensureContentScrollable, 100)
  },
})

// 監聽路由變化，僅更新當前路由信息，不直接設置活動狀態
watch(
  () => route.path,
  (newPath) => {
    // 僅更新當前路由信息
    navStore.setCurrentRoute(newPath)
  },
  { immediate: true }
)

// 提供導航狀態給所有組件
provide('navStore', navStore)

// 側欄切換函數
const toggleSidebar = () => {
  if (hamburgerMenu.value) {
    hamburgerMenu.value.toggleSidebar()
  }
}
</script>

<style>
/* 自定義滾動條 */
.dark-scroll::-webkit-scrollbar {
  width: 8px;
}

.dark-scroll::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 4px;
}

.dark-scroll::-webkit-scrollbar-thumb {
  background-color: #3d3d3d;
  border-radius: 4px;
}

.dark-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #4d4d4d;
}

/* 平滑滾動 */
.smooth-scroll {
  scroll-behavior: smooth;
}

/* 防止iOS滑動彈性效果 */
.content-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* 針對超小螢幕的自定義斷點 */
@media (min-width: 400px) {
  .xs\:p-4 {
    padding: 1rem;
  }

  .xs\:rounded-\[15px\] {
    border-radius: 15px;
  }
}
</style>
