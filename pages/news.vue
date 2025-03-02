<!-- pages/news.vue -->
<template>
  <div class="p-8">
    <section-title>最新消息</section-title>

    <div
      class="overflow-hidden rounded-[24px] bg-[#1A1A1A] p-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm"
    >
      <!-- 加載狀態 -->
      <div v-if="isLoading" class="py-10 text-center">
        <p class="text-gray-400">載入新聞中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="py-10 text-center">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <!-- 內容區域 -->
      <div v-else>
        <!-- 標籤過濾器 -->
        <news-filter :tags="allTags" :active-tag="activeTag" @filter-change="setActiveTag" />

        <!-- 無內容提示 -->
        <div v-if="filteredNews.length === 0" class="py-10 text-center">
          <p class="text-gray-400">
            {{ activeTag ? `沒有與 #${activeTag} 相關的新聞` : '暫無新聞內容' }}
          </p>
        </div>

        <!-- 新聞列表 -->
        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <news-card v-for="(item, index) in filteredNews" :key="index" :news="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SectionTitle from '~/components/common/SectionTitle.vue'
import NewsCard from '~/components/news/NewsCard.vue'
import NewsFilter from '~/components/news/NewsFilter.vue'
import { useNews } from '~/composables/useNews'
import { useRuntimeConfig } from '#imports'

// 從 runtimeConfig 獲取 baseURL
const {
  public: { baseURL },
} = useRuntimeConfig()

// 狀態
const newsContent = ref(null)
const isLoading = ref(true)
const error = ref(null)
const activeTag = ref('')

// 從 composable 獲取方法
const { parseNews, filterNewsByTag, getAllTags } = useNews()

// 計算屬性
const parsedNews = computed(() => {
  if (!newsContent.value) return []
  return parseNews(newsContent.value)
})

const allTags = computed(() => {
  return getAllTags(parsedNews.value)
})

const filteredNews = computed(() => {
  return filterNewsByTag(parsedNews.value, activeTag.value)
})

// 方法
const setActiveTag = (tag) => {
  activeTag.value = tag
}

// 加載新聞內容
const loadNewsContent = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 使用 fetch 獲取 Markdown 文件內容，加上 baseURL 前綴
    const response = await fetch(`/Personal_Web/content/news.md`)

    if (!response.ok) {
      throw new Error(`無法加載新聞內容 (${response.status})`)
    }

    newsContent.value = await response.text()
  } catch (err) {
    console.error('加載新聞內容失敗:', err)
    error.value = '無法加載新聞內容，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// 生命週期鉤子
onMounted(() => {
  loadNewsContent()
})
</script>
