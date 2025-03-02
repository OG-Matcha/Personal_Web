<template>
  <div
    ref="elementRef"
    :class="{
      'animate-on-view': true,
      'animate-on-page-enter': animateOnPageLoad,
      animated: hasAnimated,
      [`animation-type-${animationType}`]: true,
      [`animation-delay-${delay}`]: true,
    }"
  >
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 組件屬性
const props = defineProps({
  // 動畫類型: fade, slide-up, slide-left, slide-right, scale
  animationType: {
    type: String,
    default: 'fade-up',
  },
  // 動畫延遲 (1-5)
  delay: {
    type: Number,
    default: 1,
  },
  // 是否在頁面載入時也應用動畫
  animateOnPageLoad: {
    type: Boolean,
    default: false,
  },
  // 視口觸發閾值 (0-1)
  threshold: {
    type: Number,
    default: 0.2,
  },
})

const elementRef = ref(null)
const hasAnimated = ref(false)
let observer = null

// 設置 IntersectionObserver 監聽元素進入視圖
onMounted(() => {
  // 創建觀察器實例
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 元素進入視口
        if (entry.isIntersecting && !hasAnimated.value) {
          hasAnimated.value = true
          // 一旦動畫觸發後，停止觀察
          observer.disconnect()
        }
      })
    },
    {
      root: null, // 使用視口作為根
      rootMargin: '0px',
      threshold: props.threshold,
    }
  )

  // 開始觀察目標元素
  if (elementRef.value) {
    observer.observe(elementRef.value)
  }
})

// 清理觀察器
onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.animate-on-view {
  opacity: 0;
  will-change: opacity, transform;
}

.animate-on-view.animated {
  animation-fill-mode: forwards;
}

/* 動畫類型 */
.animation-type-fade-up.animated {
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-type-fade-down.animated {
  animation: fadeDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-type-fade-left.animated {
  animation: fadeLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-type-fade-right.animated {
  animation: fadeRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animation-type-zoom.animated {
  animation: zoom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 延遲類 */
.animation-delay-1.animated {
  animation-delay: 0s;
}

.animation-delay-2.animated {
  animation-delay: 0.2s;
}

.animation-delay-3.animated {
  animation-delay: 0.4s;
}

.animation-delay-4.animated {
  animation-delay: 0.6s;
}

.animation-delay-5.animated {
  animation-delay: 0.8s;
}

/* 淡入上移動畫 */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 淡入下移動畫 */
@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 淡入左移動畫 */
@keyframes fadeLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 淡入右移動畫 */
@keyframes fadeRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 縮放動畫 */
@keyframes zoom {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
