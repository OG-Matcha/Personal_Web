<template>
  <div class="page-transition-container">
    <!-- 頁面過渡效果 -->
    <transition
      name="page-transition"
      mode="out-in"
      @before-leave="beforeLeave"
      @enter="enter"
      @after-enter="afterEnter"
    >
      <slot />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 當前頁面狀態
const isFirstLoad = ref(true)

// 過渡動畫鉤子
const beforeLeave = (el) => {
  // 離開前儲存滾動位置
  el.dataset.scrollY = window.scrollY.toString()
}

const enter = (el, done) => {
  // 新頁面載入時重置滾動位置
  window.scrollTo(0, 0)

  // 首次加載不應用進入動畫
  if (isFirstLoad.value) {
    isFirstLoad.value = false
    done()
    return
  }

  // 為子元素添加動畫效果
  applyEnterAnimationToChildren(el)

  done()
}

const afterEnter = (el) => {
  // 過渡完成後的清理工作
}

// 為子元素添加進入動畫
const applyEnterAnimationToChildren = (el) => {
  const children = el.querySelectorAll('.animate-on-page-enter')
  children.forEach((child, index) => {
    child.style.opacity = '0'
    child.style.transform = 'translateY(20px)'

    // 延遲依序顯示元素
    setTimeout(
      () => {
        child.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
        child.style.opacity = '1'
        child.style.transform = 'translateY(0)'
      },
      100 + index * 100
    )
  })
}

onMounted(() => {
  setTimeout(() => {
    isFirstLoad.value = false
  }, 1000)
})
</script>

<style scoped>
.page-transition-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 頁面過渡效果 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 避免在過渡期間可以互動 */
.page-transition-enter-from,
.page-transition-leave-to {
  pointer-events: none;
}
</style>
