<!-- NavLink.vue -->
<template>
  <NuxtLink
    :to="to"
    :class="[
      'relative whitespace-nowrap text-sm sm:text-sm md:text-sm lg:text-base xl:text-lg',
      'transition-colors duration-300',
      active ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-300 hover:text-white',
      'after:absolute',
      'after:bottom-[-2px]',
      'after:left-0',
      'after:h-[2px]',
      'after:rounded-full',
      getUnderlineClass,
      'after:bg-gradient-to-r',
      'after:from-yellow-400',
      'after:to-amber-500',
      'after:transition-all',
      'after:duration-300',
      'after:ease-out',
      'nav-link',
      'overflow-hidden',
      'text-overflow-ellipsis',
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
  </NuxtLink>
</template>

<script setup>
import { ref, inject, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

// 創建或使用導航狀態存儲
const navStore = inject('navStore', {
  hasActiveLink: false,
  setHasActiveLink: (val) => {},
  updateActiveLink: (path, isActive) => {},
})

// 當前路由
const route = useRoute()

// 滑鼠懸停狀態
const isHovered = ref(false)

// 計算底線樣式類
const getUnderlineClass = computed(() => {
  // 如果當前項目是active，必須顯示底線
  if (props.active) {
    return 'after:w-full'
  }

  // 如果有任何項目是active且當前項目沒被懸停，不顯示底線
  if (navStore.hasActiveLink && !isHovered.value) {
    return 'after:w-0'
  }

  // 如果沒有active項目，則根據懸停狀態顯示底線
  return isHovered.value ? 'after:w-full' : 'after:w-0'
})

// 處理滑鼠進入事件
const handleMouseEnter = () => {
  isHovered.value = true
}

// 處理滑鼠離開事件
const handleMouseLeave = () => {
  isHovered.value = false
}

// 監視active屬性變化，更新全局狀態
watch(
  () => props.active,
  (newValue) => {
    if (newValue) {
      navStore.setHasActiveLink(true)
      navStore.updateActiveLink(props.to, true)
    } else if (props.to === route.path) {
      navStore.updateActiveLink(props.to, false)
    }
  },
  { immediate: true }
)

// 路由變化時重置懸停狀態
watch(
  () => route.path,
  () => {
    isHovered.value = false
  }
)
</script>

<style scoped>
/* 基礎 NavLink 樣式 */
.nav-link {
  @apply rounded-lg px-2 py-1 text-sm transition-colors duration-200 hover:bg-white/10;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-basis: auto;
  min-width: 0; /* 允許項目縮小到小於內容寬度 */
}

/* 針對超小螢幕的文字大小調整 */
@media (max-width: 530px) {
  a {
    font-size: 0.75rem !important;
    padding: 0.1rem 0.2rem;
  }

  /* 超小螢幕的 nav-link 設定 */
  .nav-link {
    min-width: unset; /* 取消最小寬度限制 */
    overflow: hidden; /* 隱藏溢出內容避免布局問題 */
    text-overflow: ellipsis; /* 文字溢出時顯示省略號 */
    white-space: nowrap; /* 確保文字不換行 */
    max-width: 100%; /* 確保不超出容器 */
  }
}

/* 新增：520px-640px 過渡區間優化 */
@media (min-width: 521px) and (max-width: 639px) {
  a {
    font-size: 0.75rem !important;
    padding: 0.1rem 0.25rem;
    letter-spacing: -0.005em;
  }
}

/* 新增：解決 640px-715px 區間顯示問題 */
@media (min-width: 640px) and (max-width: 715px) {
  .nav-link {
    font-size: 0.8rem !important;
    padding: 0.1rem 0.25rem;
    letter-spacing: -0.01em;
  }

  /* Portfolio 頁面特殊處理 */
  a[href='/portfolio'].router-link-active,
  a[href='/portfolio'].router-link-exact-active {
    font-weight: normal !important;
    letter-spacing: -0.02em !important;
  }
}

/* 針對中等螢幕上特殊優化 */
@media (min-width: 768px) and (max-width: 900px) {
  .nav-link {
    font-size: 0.8rem !important;
    padding: 0 0.1rem;
    letter-spacing: -0.01em;
  }

  /* Portfolio 頁面特殊處理 */
  a[href='/portfolio'].router-link-active,
  a[href='/portfolio'].router-link-exact-active {
    font-weight: normal !important;
    letter-spacing: -0.03em !important;
  }
}

/* 針對大螢幕增強導航樣式 */
@media (min-width: 1024px) {
  a {
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  a::after {
    height: 2.5px !important;
    bottom: -3px !important;
    box-shadow:
      0 0 10px rgba(251, 191, 36, 0.7),
      0 0 3px rgba(251, 146, 36, 0.9);
  }

  a:hover {
    transform: translateY(-1px);
  }
}

/* 增強大螢幕顯示效果 */
@media (min-width: 1280px) {
  a::after {
    height: 3px !important;
    bottom: -4px !important;
  }

  a.router-link-active,
  a.router-link-exact-active {
    font-weight: 500;
  }
}

/* 超大螢幕顯示效果 */
@media (min-width: 1536px) {
  a {
    font-size: 1.25rem !important; /* 大螢幕使用更大字體 */
    letter-spacing: 0.02em;
    font-weight: 500;
  }

  a::after {
    height: 4px !important;
    bottom: -5px !important;
    box-shadow:
      0 0 15px rgba(251, 191, 36, 0.8),
      0 0 5px rgba(251, 146, 36, 0.9);
  }

  a:hover {
    transform: translateY(-2px);
  }
}

/* 增強底線動畫效果 */
a::after {
  content: '';
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  transform-origin: left center;
  opacity: 0.95;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.7);
}
</style>
