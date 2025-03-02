<!-- components/news/NewsFilter.vue -->
<template>
  <div class="mb-6">
    <!-- 標籤過濾器 -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-400">按標籤過濾：</span>

      <!-- 全部標籤 -->
      <button
        @click="$emit('filterChange', '')"
        class="rounded-full px-4 py-1.5 text-sm transition-colors duration-200"
        :class="[
          !activeTag ? 'bg-blue-600 text-white' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]',
        ]"
      >
        全部
      </button>

      <!-- 篩選標籤 -->
      <button
        v-for="tag in tags"
        :key="tag"
        @click="$emit('filterChange', tag)"
        class="rounded-full px-4 py-1.5 text-sm transition-colors duration-200"
        :class="[
          activeTag === tag
            ? 'bg-blue-600 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333333]',
        ]"
      >
        #{{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup>
// 定義 props
const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  activeTag: {
    type: String,
    default: '',
  },
})

// 定義事件
defineEmits(['filterChange'])
</script>
