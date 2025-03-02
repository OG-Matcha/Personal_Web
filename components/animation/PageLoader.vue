<template>
  <Transition name="fade">
    <div v-if="show" class="page-loader">
      <div class="loader-content">
        <div class="logo-animation">
          <!-- Logo動畫 -->
          <svg width="120" height="120" viewBox="0 0 120 120" class="animated-logo">
            <g class="logo-parts">
              <circle class="logo-circle" cx="60" cy="60" r="50" />
              <polygon class="logo-polygon" points="60,25 80,40 80,70 60,85 40,70 40,40" />
              <circle class="logo-dot" cx="60" cy="60" r="5" />
            </g>
          </svg>
        </div>
        <div class="loader-text">
          <div class="typing-text">Welcome</div>
        </div>
        <div class="loader-progress">
          <div class="progress-bar" :style="`width: ${progress}%`"></div>
        </div>
      </div>
      <!-- 背景粒子效果 -->
      <div class="particles">
        <div v-for="n in 20" :key="n" class="particle" :class="`particle-${n % 5}`"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 控制加載器顯示
const show = ref(true)
const progress = ref(0)
let progressInterval = null

// 確保滾動恢復的函數
const ensureScrollingEnabled = () => {
  // 移除 body 的 overflow-hidden 類
  document.body.classList.remove('overflow-hidden')

  // 如果右側內容區域也有滾動問題，確保它可以滾動
  const mainContent = document.getElementById('mainContent')
  if (mainContent) {
    mainContent.style.overflowY = 'auto'
  }

  // 如果仍然有滾動問題，嘗試強制啟用滾動
  setTimeout(() => {
    if (window.getComputedStyle(document.body).overflow === 'hidden') {
      document.body.style.overflow = 'auto'
    }
  }, 100)
}

// 模擬加載進度
onMounted(() => {
  // 禁止頁面滾動
  document.body.classList.add('overflow-hidden')

  // 模擬加載進度
  progressInterval = setInterval(() => {
    if (progress.value < 100) {
      // 非線性進度增加，開始快，結束慢
      const increment = Math.max(1, 10 * Math.pow((100 - progress.value) / 100, 2))
      progress.value = Math.min(100, progress.value + increment)
    } else {
      clearInterval(progressInterval)

      // 加載完成後延遲隱藏加載器
      setTimeout(() => {
        show.value = false

        // 使用增強的恢復滾動函數
        ensureScrollingEnabled()

        // 確保在任何情況下都能恢復滾動
        setTimeout(ensureScrollingEnabled, 300)

        // 發送完成事件
        emit('completed')
      }, 500)
    }
  }, 80)
})

onBeforeUnmount(() => {
  // 清理定時器
  if (progressInterval) {
    clearInterval(progressInterval)
  }

  // 確保組件卸載時恢復滾動
  ensureScrollingEnabled()
})

// 定義事件
const emit = defineEmits(['completed'])
</script>

<style scoped>
.page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.logo-animation {
  margin-bottom: 2rem;
}

/* Logo動畫 */
.animated-logo {
  transform-origin: center;
}

.logo-circle {
  fill: none;
  stroke: rgba(255, 204, 0, 0.7);
  stroke-width: 2;
  stroke-dasharray: 315;
  stroke-dashoffset: 315;
  animation: draw-circle 2.5s ease forwards;
}

.logo-polygon {
  fill: none;
  stroke: rgba(255, 204, 0, 0.85);
  stroke-width: 2;
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
  animation: draw-polygon 2s ease 0.5s forwards;
}

.logo-dot {
  fill: #ffd700;
  opacity: 0;
  transform-origin: center;
  animation: pop-dot 0.5s ease 2s forwards;
}

/* 文字動畫 */
.loader-text {
  margin-bottom: 2rem;
  perspective: 1000px;
}

.typing-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  animation: typing 2s steps(8, end) forwards;
  width: 0;
}

.typing-text::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 5%;
  height: 90%;
  width: 2px;
  background-color: rgba(255, 255, 255, 0.7);
  animation: blink 0.7s step-end infinite;
}

/* 進度條 */
.loader-progress {
  width: 200px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff9d00);
  border-radius: 2px;
  transition: width 0.2s ease;
}

/* 粒子背景 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  animation: float 10s infinite ease-in-out;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(-10px) translateX(20px);
  }
  75% {
    transform: translateY(10px) translateX(-10px);
  }
}

.particle-0 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.particle-1 {
  width: 120px;
  height: 120px;
  top: 70%;
  left: 20%;
  animation-delay: -1s;
}
.particle-2 {
  width: 100px;
  height: 100px;
  top: 40%;
  left: 80%;
  animation-delay: -2s;
}
.particle-3 {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 60%;
  animation-delay: -3s;
}
.particle-4 {
  width: 150px;
  height: 150px;
  top: 20%;
  left: 50%;
  animation-delay: -4s;
}

/* 顯示/隱藏過渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s cubic-bezier(0.19, 1, 0.22, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes draw-circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes draw-polygon {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pop-dot {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes typing {
  to {
    width: 8ch;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
