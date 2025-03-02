<template>
  <div>
    <!-- 只在提供button插槽時才顯示按鈕 -->
    <slot name="button"></slot>

    <!-- 側邊欄背景遮罩 -->
    <Transition name="fade">
      <div
        v-if="isSidebarOpen"
        @click="closeSidebar"
        class="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm"
      ></div>
    </Transition>

    <!-- 側邊欄內容 -->
    <Transition name="slide">
      <div
        v-if="isSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 flex h-full w-[85%] flex-col bg-[#1A1A1A] p-4 shadow-2xl sm:w-[300px]"
      >
        <div class="mt-4 flex-grow overflow-auto pb-16">
          <slot name="content"></slot>
        </div>
        <div class="absolute bottom-4 left-0 right-0 px-4">
          <button
            @click="closeSidebar"
            class="flex w-full items-center justify-center gap-2 rounded-[15px] bg-gradient-to-br from-[#2a2a2a] to-[#242424] px-4 py-3 text-sm font-medium text-white shadow transition-all duration-300 hover:from-[#333] hover:to-[#292929]"
          >
            <span class="text-yellow-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
            關閉選單
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  if (isSidebarOpen.value) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
}

const closeSidebar = () => {
  isSidebarOpen.value = false
  document.body.classList.remove('overflow-hidden')
}

// 監聽 escape 鍵關閉側邊欄
onMounted(() => {
  const handleEscKey = (e) => {
    if (e.key === 'Escape' && isSidebarOpen.value) {
      closeSidebar()
    }
  }
  window.addEventListener('keydown', handleEscKey)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscKey)
  })
})

// 暴露方法給父組件使用
defineExpose({
  toggleSidebar,
  closeSidebar,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
