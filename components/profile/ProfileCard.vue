<!-- ProfileCard.vue -->
<template>
  <div
    class="flex h-full flex-col justify-start overflow-hidden rounded-[20px] bg-[#242424] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] sm:p-5 md:rounded-[25px] md:p-6 lg:min-h-[520px] lg:rounded-[30px] lg:p-8"
  >
    <!-- 頭像與基本信息 -->
    <div class="flex flex-shrink-0 flex-grow-0 flex-col items-center lg:mb-2">
      <div
        class="profile-image-container relative mb-2 h-[110px] w-[110px] flex-shrink-0 overflow-hidden rounded-full border-4 border-[#2D2D2D] sm:mb-3 sm:h-[130px] sm:w-[130px] md:h-[140px] md:w-[140px] lg:h-[clamp(140px,18vh,170px)] lg:w-[clamp(140px,18vh,170px)]"
      >
        <img
          src="/images/my-avatar.jpg"
          alt="Ju-Shen Huang"
          class="h-full w-full object-cover"
          @error="handleImageError"
        />
      </div>

      <h1
        class="mb-1 text-center text-xl font-bold text-white sm:text-2xl md:mb-2 md:text-3xl lg:text-[clamp(1.75rem,3vw,2.25rem)]"
      >
        Ju-Shen Huang
      </h1>

      <!-- 翻轉標籤容器 -->
      <div
        ref="titleBadgeContainer"
        class="badge-container perspective-[1000px] relative mt-1 cursor-pointer"
        :class="{ 'is-flipped': isFlipped }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="toggleFlip"
        @touchstart="handleTouchStart"
      >
        <!-- 正面：Web Developer -->
        <div
          ref="titleBadgeFront"
          class="title-badge badge-front relative overflow-hidden will-change-transform"
          :style="{
            transform: !isFlipped
              ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
              : 'rotateY(180deg)',
            transition:
              isHovering && !isFlipped
                ? 'transform 0.2s ease, box-shadow 0.3s ease'
                : 'transform 0.5s ease, box-shadow 0.5s ease',
          }"
          @mousemove="!isFlipped && handleMouseMove"
        >
          <h2
            class="px-4 py-1.5 text-center text-sm font-medium text-gray-300 sm:px-5 sm:py-2 sm:text-base md:text-lg lg:text-[clamp(1rem,1.5vw,1.125rem)]"
          >
            Web Developer
          </h2>
          <span v-if="showPulse && !isFlipped" class="pulse-effect"></span>
        </div>

        <!-- 背面：六邊形戰士 -->
        <div
          class="title-badge badge-back relative overflow-hidden will-change-transform"
          :style="{
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
            transition: 'transform 0.5s ease, box-shadow 0.5s ease',
          }"
        >
          <h2
            class="px-4 py-1.5 text-center text-sm font-medium text-gray-300 sm:px-5 sm:py-2 sm:text-base md:text-lg lg:text-[clamp(1rem,1.5vw,1.125rem)]"
          >
            六邊形戰士💪
          </h2>
        </div>
      </div>

      <!-- 分隔線 -->
      <div
        class="mx-auto my-2 h-[2px] max-w-[60px] bg-gradient-to-r from-yellow-400 to-amber-300 sm:my-3 sm:max-w-[70px] md:my-4 md:max-w-[80px] lg:my-[clamp(1rem,2.5vh,1.5rem)]"
      ></div>
    </div>

    <!-- 聯絡資訊 -->
    <contact-info-list
      class="mb-2 flex-shrink-0 sm:mb-3 md:mb-4 lg:mb-[clamp(0.75rem,2vh,1.25rem)]"
    />

    <!-- 社交媒體連結 -->
    <div class="mt-auto flex-shrink-0">
      <!-- 分隔線 -->
      <div
        class="mx-auto mb-2 h-[2px] max-w-[60px] bg-gradient-to-r from-yellow-400 to-amber-300 sm:mb-3 sm:max-w-[70px] md:mb-4 md:max-w-[80px] lg:mb-3"
      ></div>
      <social-media-links />
    </div>
  </div>
</template>

<script setup>
import { useRuntimeConfig } from '#imports'
import ContactInfoList from './ContactInfoList.vue'
import SocialMediaLinks from './SocialMediaLinks.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const handleImageError = (error) => {
  console.error('頭像圖片載入失敗:', error)
}

const titleBadgeContainer = ref(null)
const titleBadgeFront = ref(null)
const rotateX = ref(0)
const rotateY = ref(0)
const scale = ref(1)
const isHovering = ref(false)
const showPulse = ref(false)
const isFlipped = ref(false)
let touchTimeout = null

const handleMouseMove = (e) => {
  if (!titleBadgeFront.value || isFlipped.value) return

  const rect = titleBadgeFront.value.getBoundingClientRect()
  // 計算滑鼠在元素上的相對位置 (從-0.5到0.5)
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5

  // 根據滑鼠位置計算傾斜角度 (最大±10度)
  rotateX.value = -y * 10
  rotateY.value = x * 10
}

const handleMouseEnter = () => {
  if (window.matchMedia('(hover: hover)').matches) {
    isHovering.value = true
    scale.value = 1.05
    if (!isFlipped.value) {
      setTimeout(() => {
        isFlipped.value = true
      }, 500)
    }
  }
}

const handleMouseLeave = () => {
  isHovering.value = false
  scale.value = 1
  rotateX.value = 0
  rotateY.value = 0
  if (isFlipped.value && window.matchMedia('(hover: hover)').matches) {
    isFlipped.value = false
  }
}

const handleMouseDown = () => {
  scale.value = 0.98
}

const handleMouseUp = () => {
  scale.value = 1.05
}

const triggerPulse = () => {
  showPulse.value = true
  setTimeout(() => {
    showPulse.value = false
  }, 700)
}

const toggleFlip = () => {
  // 在非懸停設備上（如行動裝置），點擊時切換翻轉狀態
  if (!window.matchMedia('(hover: hover)').matches) {
    isFlipped.value = !isFlipped.value
    triggerPulse()
  }
}

const handleTouchStart = () => {
  // 清除之前的觸摸計時器
  if (touchTimeout) {
    clearTimeout(touchTimeout)
  }

  // 設置新的計時器，用於偵測觸摸結束
  touchTimeout = setTimeout(() => {
    toggleFlip()
  }, 100)
}

const {
  public: { baseURL },
} = useRuntimeConfig()
</script>

<style scoped>
@keyframes glow {
  0%,
  100% {
    opacity: 0.5;
    box-shadow: 0 0 5px rgba(250, 204, 21, 0.5);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
  }
}

.bg-gradient-to-r {
  animation: glow 3s infinite;
}

@keyframes shiftGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes sparkleLeft {
  0% {
    opacity: 0;
    left: -10px;
    top: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    opacity: 0;
    left: 30%;
    top: 100%;
  }
  100% {
    opacity: 0;
    left: -10px;
    top: 0;
  }
}

@keyframes sparkleRight {
  0% {
    opacity: 0;
    right: -10px;
    bottom: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    opacity: 0;
    right: 40%;
    bottom: 100%;
  }
  100% {
    opacity: 0;
    right: -10px;
    bottom: 0;
  }
}

@keyframes pulseEffect {
  0% {
    opacity: 0.8;
    transform: scale(0.2);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.badge-container {
  position: relative;
  width: 100%;
  max-width: 200px;
  min-height: 42px;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
  margin-bottom: 3px;
}

.title-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b, #f59e0b, #fbbf24);
  background-size: 200% 200%;
  animation: shiftGradient 8s ease infinite;
  padding: 3px;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  transform-style: preserve-3d;
}

.badge-front,
.badge-back {
  transition: transform 0.6s ease;
  width: 100%;
  height: 100%;
}

.is-flipped .badge-front {
  transform: rotateY(180deg) !important;
}

.is-flipped .badge-back {
  transform: rotateY(0deg) !important;
}

.badge-back {
  transform: rotateY(-180deg);
}

.badge-container:hover .title-badge {
  animation: shiftGradient 4s ease infinite;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
}

.title-badge::before {
  content: '';
  position: absolute;
  width: 15px;
  height: 1px;
  background: white;
  opacity: 0;
  left: -10px;
  top: 0;
  animation: sparkleLeft 4s linear infinite;
}

.title-badge::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 1px;
  background: white;
  opacity: 0;
  right: -10px;
  bottom: 0;
  animation: sparkleRight 5s linear infinite;
  animation-delay: 1s;
}

.title-badge h2 {
  display: block;
  border-radius: 9px;
  background-color: #242424;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, rgba(251, 191, 36, 0) 70%);
  transform: translate(-50%, -50%);
  animation: pulseEffect 0.7s ease-out forwards;
  pointer-events: none;
}

/* 添加視角特效 */
.perspective-\[1000px\] {
  perspective: 1000px;
}

/* 為極小螢幕添加自定義斷點 */
@media (min-width: 400px) {
  .xs\:p-5 {
    padding: 1.25rem;
  }

  .xs\:mb-4 {
    margin-bottom: 1rem;
  }

  .xs\:my-4 {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .xs\:h-20 {
    height: 5rem;
  }

  .xs\:w-20 {
    width: 5rem;
  }

  .xs\:rounded-\[16px\] {
    border-radius: 16px;
  }

  .xs\:h-1\.5 {
    height: 0.375rem;
  }

  .xs\:w-1\.5 {
    width: 0.375rem;
  }

  .xs\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .xs\:h-2 {
    height: 0.5rem;
  }

  .xs\:w-2 {
    width: 0.5rem;
  }

  .xs\:gap-1\.5 {
    gap: 0.375rem;
  }

  .xs\:px-2\.5 {
    padding-left: 0.625rem;
    padding-right: 0.625rem;
  }

  .xs\:py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .xs\:rounded-\[15px\] {
    border-radius: 15px;
  }
}

/* 漢堡選單模式下的特殊處理 */
@media (max-width: 1023px) {
  .title-badge {
    margin-top: 0.25rem;
  }

  .title-badge h2 {
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
  }
}

/* 添加對極高或極矮螢幕的特殊處理 */
@media (min-height: 1000px) {
  .lg\:h-\[clamp\(140px\,18vh\,170px\)\] {
    height: clamp(150px, 15vh, 180px);
  }

  .lg\:w-\[clamp\(140px\,18vh\,170px\)\] {
    width: clamp(150px, 15vh, 180px);
  }
}

@media (max-height: 700px) {
  .lg\:h-\[clamp\(140px\,18vh\,170px\)\] {
    height: clamp(120px, 16vh, 140px);
  }

  .lg\:w-\[clamp\(140px\,18vh\,170px\)\] {
    width: clamp(120px, 16vh, 140px);
  }
}

/* 漢堡選單模式下的額外優化 */
@media (max-width: 639px) and (max-height: 750px) {
  .mb-2 {
    margin-bottom: 0.375rem;
  }

  .my-2 {
    margin-top: 0.375rem;
    margin-bottom: 0.375rem;
  }
}

/* 確保照片容器不變形 */
.profile-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1 / 1;
}

.profile-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 針對小螢幕額外優化 */
@media (max-width: 520px) {
  .profile-image-container {
    width: 110px !important;
    height: 110px !important;
    flex-shrink: 0;
    flex-grow: 0;
    aspect-ratio: 1/1 !important;
    overflow: hidden;
  }

  .profile-image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}
</style>
