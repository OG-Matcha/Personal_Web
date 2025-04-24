<template>
  <Transition name="slide-down">
    <div v-if="showNav" class="fixed left-0 right-0 top-0 z-50 px-2 py-3 lg:hidden">
      <div
        class="mx-auto flex items-center justify-between rounded-[15px] bg-[#242424]/85 px-4 py-3 shadow-lg backdrop-blur-sm"
      >
        <!-- 漢堡選單按鈕 -->
        <button
          @click="$emit('toggle-menu')"
          class="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2a2a2a] to-[#242424] shadow transition-all duration-300 hover:from-[#333] hover:to-[#292929] focus:outline-none"
          aria-label="開啟側邊選單"
        >
          <span class="relative block h-3.5 w-4">
            <span
              class="absolute left-0 top-0 h-0.5 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
            ></span>
            <span
              class="absolute left-0 top-1.5 h-0.5 w-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
            ></span>
            <span
              class="absolute left-0 top-3 h-0.5 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
            ></span>
          </span>
        </button>

        <!-- 導航連結 -->
        <div class="nav-links-scroll flex flex-1 justify-end gap-3">
          <nav-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :active="showNav && route.path === item.to"
            class="text-sm"
          >
            {{ item.text }}
          </nav-link>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavLink from './NavLink.vue'

const props = defineProps({
  showThreshold: {
    type: Number,
    default: 100,
  },
})

const emit = defineEmits(['toggle-menu'])
const route = useRoute()
const showNav = ref(false)

// 導航項目
const navItems = [
  { text: 'About', to: '/' },
  { text: 'Resume', to: '/resume' },
  { text: 'Portfolio', to: '/portfolio' },
  { text: 'News', to: '/news' },
]

// 監聽滾動事件，控制導航欄顯示
const handleScroll = () => {
  // 確保使用props傳入的閾值
  const threshold = props.showThreshold || 150 // 使用props值或默認為150px
  showNav.value = window.scrollY > threshold

  // 為了debug，你可以在開發環境中取消下面的註釋
  // console.log(`Threshold: ${threshold}, ScrollY: ${window.scrollY}, ShowNav: ${showNav.value}`);
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 初始檢查
  handleScroll()

  // 記錄實際使用的閾值
  //   console.log(`StickyNav mounted, using threshold: ${props.showThreshold}`)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 確保滾動條不可見 */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.overflow-x-auto::-webkit-scrollbar {
  display: none;
}

/* 新增導航滾動樣式 */
.nav-links-scroll {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  width: max-content;
  max-width: calc(100% - 50px); /* 為按鈕預留空間 */
}

.nav-links-scroll::-webkit-scrollbar {
  display: none;
}

/* 針對超小螢幕的特殊調整 */
@media (max-width: 530px) {
  .fixed.left-0.right-0.top-0 {
    padding: 0.5rem 0.25rem;
    position: fixed; /* 確保定位屬性正確 */
    width: 100%; /* 確保寬度正確 */
  }

  .rounded-\[15px\] {
    border-radius: 0.75rem;
  }

  .px-4.py-3 {
    padding: 0.5rem 0.375rem;
  }

  .flex.gap-3 {
    gap: 0.375rem;
  }

  .h-9.w-9 {
    height: 1.75rem;
    width: 1.75rem;
  }

  .rounded-\[10px\] {
    border-radius: 0.5rem;
  }

  /* 確保內容容器正確定位和間距 */
  .mx-auto.flex.items-center.justify-between {
    max-width: 100%; /* 確保容器不會超出視口 */
    justify-content: space-between; /* 確保內容分布合理 */
  }
}

/* 更窄螢幕的特殊處理 */
@media (min-width: 521px) and (max-width: 639px) {
  /* 調整字體大小 */
  .text-sm {
    font-size: 0.75rem;
  }
}
</style>
