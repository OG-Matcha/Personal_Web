<!-- components/portfolio/ProjectFilters.vue -->
<template>
  <div
    class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-6 md:gap-4 lg:mb-4 lg:gap-3 xl:mb-6 xl:gap-4"
  >
    <!-- 類別過濾器 -->
    <div class="filterbar overflow-x-auto pb-1">
      <div class="flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-1.5 xl:gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="updateCategory(category.id)"
          :class="[
            'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 md:px-4 md:py-2 lg:px-2.5 lg:py-1.5 xl:px-3.5 xl:py-2',
            activeCategory === category.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-[#252525] text-gray-300 hover:bg-[#303030] hover:text-white',
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 可見性過濾器 -->
    <div class="flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-1.5 xl:gap-2">
      <button
        v-for="option in visibilityOptions"
        :key="option.id"
        @click="updateVisibility(option.id)"
        :class="[
          'rounded-lg px-2 py-1.5 text-xs font-medium transition-all duration-200 md:px-3 md:py-1.5 lg:px-2 lg:py-1 xl:px-2.5 xl:py-1.5',
          visibilityFilter === option.id
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
            : 'bg-[#252525] text-gray-300 hover:bg-[#303030] hover:text-white',
        ]"
      >
        <div class="flex items-center gap-1 md:gap-1.5 lg:gap-1">
          <span v-if="option.id === 'all'" class="text-base md:text-lg lg:text-base xl:text-lg"
            >•••</span
          >
          <span
            v-else-if="option.id === 'public'"
            class="text-base text-green-400 md:text-lg lg:text-base xl:text-lg"
            >•</span
          >
          <span
            v-else-if="option.id === 'private'"
            class="text-base text-yellow-400 md:text-lg lg:text-base xl:text-lg"
            >•</span
          >
          {{ option.name }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  activeCategory: {
    type: String,
    required: true,
  },
  visibilityFilter: {
    type: String,
    default: 'all',
  },
})

const emit = defineEmits(['update:category', 'update:visibility'])

// 可見性選項
const visibilityOptions = [
  { id: 'all', name: '全部' },
  { id: 'public', name: '公開' },
  { id: 'private', name: '私有' },
]

// 更新當前選擇的類別
function updateCategory(categoryId) {
  emit('update:category', categoryId)
}

// 更新可見性過濾器
function updateVisibility(visibilityId) {
  emit('update:visibility', visibilityId)
}
</script>

<style scoped>
/* 過濾器捲動條美化 */
.filterbar {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* 火狐瀏覽器 */
  position: relative;
}

.filterbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari 等瀏覽器 */
}

/* 按鈕點擊效果 */
button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: inherit;
  top: 0;
  left: 0;
  opacity: 0;
  transform: scale(2);
  transition:
    opacity 0.4s,
    transform 0.6s;
}

button:active::after {
  opacity: 0.1;
  transform: scale(0);
  transition: transform 0s;
}

/* 中等寬度螢幕優化 */
@media (min-width: 1024px) and (max-width: 1279px) {
  .filterbar {
    max-width: 100%;
    margin-bottom: 0.375rem;
  }

  /* 所有按鈕基本樣式 */
  button {
    font-size: 0.75rem; /* 更小的字體 */
    padding: 0.25rem 0.75rem;
  }

  /* 類別過濾器按鈕 */
  .filterbar button {
    padding: 0.25rem 0.625rem;
  }

  /* 可見性過濾器按鈕 */
  .flex.gap-1\.5 button {
    padding: 0.25rem 0.5rem;
  }

  /* 調整間距 */
  .gap-1\.5 {
    gap: 0.25rem;
  }

  /* 調整點指示符號大小 */
  button .text-base {
    font-size: 0.875rem;
  }
}

/* 更小螢幕的進一步優化 */
@media (max-width: 640px) {
  .mb-5 {
    margin-bottom: 0.75rem;
  }

  .gap-3 {
    gap: 0.5rem;
  }
}

/* 超小螢幕特殊優化 */
@media (max-width: 520px) {
  /* 整體調整 */
  .mb-5 {
    margin-bottom: 0.5rem;
  }

  .gap-3 {
    gap: 0.25rem;
  }

  /* 按鈕大小調整 */
  .whitespace-nowrap.rounded-full {
    font-size: 0.65rem !important;
    padding: 0.2rem 0.6rem !important;
    line-height: 1.2;
  }

  .rounded-lg {
    font-size: 0.65rem !important;
    padding: 0.2rem 0.5rem !important;
    line-height: 1.2;
  }

  /* 確保文字換行時仍能清晰 */
  button {
    line-height: 1.2;
  }

  /* 調整點指示符號大小 */
  .text-base,
  .text-base.text-green-400,
  .text-base.text-yellow-400 {
    font-size: 0.75rem !important;
  }

  /* 確保間距合理 */
  .filterbar {
    margin-bottom: 0.3rem;
    width: 100%;
  }

  /* 過濾器行間距 */
  .flex.gap-1\.5 {
    gap: 0.2rem;
  }
}
</style>
