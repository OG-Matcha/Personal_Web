<!-- components/news/NewsCard.vue -->
<template>
  <div
    class="news-card overflow-hidden rounded-xl bg-[#1E1E1E] shadow-md transition-all duration-300 hover:translate-y-[-6px] hover:shadow-lg"
  >
    <div class="p-5">
      <!-- 標題和日期 -->
      <div class="mb-3">
        <h3 class="mb-1 text-lg font-semibold text-white">{{ news.title }}</h3>
        <div class="text-sm text-gray-400">
          <span>{{ formatDate(news.date) }}</span>
        </div>
      </div>

      <!-- 摘要 -->
      <p class="mb-4 text-sm leading-relaxed text-gray-300">
        {{ news.summary }}
      </p>

      <!-- 標籤 -->
      <div class="mb-4 flex flex-wrap gap-2">
        <span
          v-for="tag in news.tags"
          :key="tag"
          class="rounded-full bg-[#2A2A2A] px-3 py-1 text-xs text-gray-300"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- 閱讀連結 -->
      <div class="text-right">
        <a
          :href="news.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-blue-500 hover:text-blue-400"
        >
          閱讀完整報導 →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定義props
const props = defineProps({
  news: {
    type: Object,
    required: true,
  },
})

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return dateStr // 如果日期無效，直接返回原始字符串
  }

  // 格式化為 YYYY 年 MM 月 DD 日
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // 月份從0開始
  const day = date.getDate()

  return `${year} 年 ${month} 月 ${day} 日`
}
</script>

<style scoped>
.news-card {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
