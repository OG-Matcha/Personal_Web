<!-- components/portfolio/ProjectModal.vue -->
<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-250 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm lg:p-6"
      >
        <!-- 背景覆蓋層 -->
        <div class="absolute inset-0 bg-black/75 transition-opacity" @click="$emit('close')"></div>

        <!-- 模態窗內容 -->
        <div
          class="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#121212] shadow-2xl ring-1 ring-white/5"
          @click.stop
        >
          <!-- 關閉按鈕 -->
          <button
            @click="$emit('close')"
            class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white/90"
            aria-label="關閉"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div class="p-6 md:p-8">
            <!-- 標題和狀態 -->
            <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 class="text-2xl font-bold leading-tight text-white md:text-3xl">
                {{ project.title }}
              </h2>
              <span
                :class="[
                  'flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium',
                  project.isPublic
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400',
                ]"
              >
                <span class="mr-1.5 text-lg">•</span>
                {{ project.isPublic ? '公開項目' : '私有項目' }}
              </span>
            </div>

            <!-- 項目圖片展示區域 -->
            <div v-if="displayImage" class="relative mb-8 overflow-hidden rounded-xl">
              <div class="bg-gradient-to-b from-gray-800 to-gray-900 shadow-inner">
                <div v-if="!currentImage" class="flex h-64 w-full items-center justify-center">
                  <div class="text-center">
                    <div class="text-6xl font-light text-gray-600">{{ project.title[0] }}</div>
                    <div class="mt-2 text-sm text-gray-500">無截圖</div>
                  </div>
                </div>
                <img
                  v-else
                  :src="currentImage"
                  :alt="`${project.title} - 截圖 ${currentImageIndex + 1}`"
                  class="h-auto w-full object-cover"
                  @error="onImageError"
                />
              </div>

              <!-- 圖片導航按鈕 (如果有多張) -->
              <div
                v-if="project.screenshots && project.screenshots.length > 1"
                class="absolute inset-x-0 bottom-0 flex justify-between px-4 py-3 backdrop-blur-sm backdrop-brightness-50"
              >
                <button
                  @click="prevImage"
                  class="rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                  aria-label="上一張"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span class="flex items-center gap-2 text-sm font-medium text-white">
                  <span class="text-white/80"
                    >{{ currentImageIndex + 1 }} / {{ project.screenshots.length }}</span
                  >
                </span>
                <button
                  @click="nextImage"
                  class="rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                  aria-label="下一張"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div class="content-grid grid grid-cols-1 gap-8 md:grid-cols-3">
              <div class="md:col-span-2">
                <!-- 項目描述 -->
                <div class="mb-6">
                  <h3 class="mb-3 text-xl font-bold text-white">項目描述</h3>
                  <p class="text-base leading-relaxed text-gray-300">{{ project.description }}</p>
                </div>

                <!-- 功能特點 -->
                <div v-if="project.features && project.features.length > 0" class="mb-6">
                  <h3 class="mb-3 text-xl font-bold text-white">主要功能</h3>
                  <ul class="grid grid-cols-1 gap-2 text-gray-300 sm:grid-cols-2">
                    <li
                      v-for="(feature, index) in project.features"
                      :key="index"
                      class="flex items-start"
                    >
                      <svg
                        class="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <!-- 技術棧 -->
                <div class="mb-6">
                  <h3 class="mb-3 text-xl font-bold text-white">使用技術</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(tech, index) in project.technologies"
                      :key="index"
                      class="rounded-full bg-[#252525] px-3 py-1.5 text-sm text-gray-300 shadow-sm"
                    >
                      {{ tech }}
                    </span>
                  </div>
                </div>

                <!-- 挑戰與解決方案 -->
                <div v-if="project.challenges" class="mb-6">
                  <h3 class="mb-3 text-xl font-bold text-white">挑戰與解決方案</h3>
                  <p class="text-sm leading-relaxed text-gray-300">{{ project.challenges }}</p>
                </div>

                <!-- 項目連結 (公開項目) -->
                <div v-if="project.isPublic" class="flex flex-col gap-3">
                  <a
                    v-if="project.repoUrl"
                    :href="project.repoUrl"
                    target="_blank"
                    class="flex w-full items-center justify-center rounded-lg bg-[#2C2C2C] px-4 py-3 text-white transition-colors hover:bg-[#3a3a3a]"
                  >
                    <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    查看原始碼庫
                  </a>

                  <a
                    v-if="project.demoUrl"
                    :href="project.demoUrl"
                    target="_blank"
                    class="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
                  >
                    <svg
                      class="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    訪問在線演示
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PlaceholderImage from '../common/PlaceholderImage.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  show: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

// 當前顯示的圖片索引
const currentImageIndex = ref(0)

// 判斷是否有可顯示的圖片
const displayImage = computed(() => {
  return (
    (props.project.screenshots && props.project.screenshots.length > 0) || props.project.thumbnail
  )
})

// 當前顯示的圖片
const currentImage = computed(() => {
  if (!props.project.screenshots || props.project.screenshots.length === 0) {
    return props.project.thumbnail || null
  }
  return props.project.screenshots[currentImageIndex.value]
})

// 當項目變更時重置圖片索引
watch(
  () => props.project,
  () => {
    currentImageIndex.value = 0
  }
)

// 顯示上一張圖片
function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = props.project.screenshots.length - 1
  }
}

// 顯示下一張圖片
function nextImage() {
  if (currentImageIndex.value < props.project.screenshots.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

// 圖片加載失敗處理
function onImageError(e) {
  // 顯示首字母佔位圖片
  e.target.style.display = 'none'
  e.target.parentElement.classList.add('flex', 'justify-center', 'items-center')

  // 創建佔位元素
  const placeholder = document.createElement('div')
  placeholder.className = 'text-center'
  placeholder.innerHTML = `
    <div class="text-6xl font-light text-gray-600">${props.project.title[0]}</div>
    <div class="mt-2 text-sm text-gray-500">圖片加載失敗</div>
  `

  e.target.parentElement.appendChild(placeholder)
}

// 防止模態窗顯示時頁面滾動
watch(
  () => props.show,
  (value) => {
    if (value) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 滾動條美化 */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.4);
  border-radius: 10px;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 100, 0.7);
}

/* 確保模態窗動畫流暢 */
div[class*='transition'] {
  transform-origin: center;
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
}
</style>
