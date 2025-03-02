<!-- ServiceCard.vue -->
<template>
  <div
    class="group relative overflow-hidden rounded-[24px] bg-[#1A1A1A] p-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_4px_16px_rgba(0,0,0,0.2)] md:p-8"
  >
    <!-- 背景裝飾 -->
    <div
      class="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] opacity-5 transition-transform duration-300 group-hover:translate-y-[-12px]"
    >
      <img :src="iconPath" :alt="title" class="h-full w-full" />
    </div>

    <div class="flex items-start gap-4 md:gap-6">
      <div
        class="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 shadow-lg transition-transform duration-300 group-hover:scale-110 md:h-14 md:w-14"
      >
        <div class="absolute inset-0 rounded-2xl bg-[#242424] opacity-80"></div>
        <img
          :src="iconPath"
          :alt="title"
          class="relative h-6 w-6 md:h-7 md:w-7"
          @error="handleImageError"
        />
      </div>
      <div class="flex-1">
        <h3 class="mb-2 text-lg font-semibold tracking-tight md:mb-3 md:text-xl">{{ title }}</h3>
        <p class="text-sm leading-relaxed text-gray-300 md:text-base">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

const handleImageError = (error) => {
  console.error(`圖片載入失敗: ${props.icon}`, error)
}

const {
  public: { baseURL },
} = useRuntimeConfig()
const iconPath = computed(() => `/images/icon-${props.icon}`)
</script>
