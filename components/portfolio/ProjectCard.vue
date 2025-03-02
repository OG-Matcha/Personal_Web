<!-- components/portfolio/ProjectCard.vue -->
<template>
  <div
    class="group relative box-border w-full max-w-full overflow-hidden rounded-xl bg-[#1A1A1A] shadow-lg transition-all duration-300 hover:translate-y-[-6px] hover:shadow-xl"
  >
    <!-- 項目縮圖 -->
    <div class="aspect-[16/10] w-full overflow-hidden bg-gray-800">
      <div v-if="!project.thumbnail">
        <placeholder-image />
      </div>
      <img
        v-else
        :src="project.thumbnail"
        :alt="project.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        @error="onImageError"
      />
    </div>

    <!-- 項目基本信息 -->
    <div
      class="card-content box-border flex min-h-[180px] w-full max-w-full flex-col overflow-hidden p-4 md:min-h-[200px] md:p-5 lg:min-h-[170px] lg:p-3 xl:min-h-[180px] xl:p-4 2xl:min-h-[200px] 2xl:p-5"
    >
      <div class="mb-2 flex items-center justify-between md:mb-3 lg:mb-2">
        <h3
          class="max-w-[70%] truncate text-base font-bold text-white md:text-lg lg:text-base xl:text-lg"
        >
          {{ project.title }}
        </h3>
        <span
          v-if="project.isPublic"
          class="status-tag rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400 md:px-2.5 md:py-1 lg:px-2 lg:py-0.5 xl:px-2.5 xl:py-1"
          >公開</span
        >
        <span
          v-else
          class="status-tag rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400 md:px-2.5 md:py-1 lg:px-2 lg:py-0.5 xl:px-2.5 xl:py-1"
          >私有</span
        >
      </div>

      <p
        class="mb-3 line-clamp-2 h-[2.6rem] w-full max-w-full overflow-hidden text-xs leading-relaxed text-gray-300 md:mb-4 md:h-[3rem] md:text-sm lg:mb-3 lg:h-[2.6rem] lg:text-xs xl:mb-3 xl:text-sm"
      >
        {{ project.description }}
      </p>

      <!-- 使用技術標籤 -->
      <div
        class="tech-tags mb-4 flex min-h-[2rem] w-full max-w-full flex-wrap items-center gap-1.5 overflow-hidden md:mb-5 md:min-h-[2.5rem] md:gap-2 lg:mb-3 lg:min-h-[2rem] lg:gap-1 xl:mb-4 xl:gap-1.5"
      >
        <span
          v-for="(tech, index) in displayedTechnologies"
          :key="index"
          class="tech-tag rounded-full bg-[#252525] px-2 py-0.5 text-xs text-gray-300 md:px-2.5 md:py-1 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-0.5 2xl:px-2.5 2xl:py-1"
        >
          {{ tech }}
        </span>
        <span
          v-if="project.technologies.length > maxTags"
          class="tech-tag rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300 md:px-2.5 md:py-1 lg:px-1.5 lg:py-0.5 xl:px-2 xl:py-0.5 2xl:px-2.5 2xl:py-1"
        >
          +{{ project.technologies.length - maxTags }}
        </span>
      </div>

      <!-- 操作按鈕 -->
      <div
        class="card-actions mt-auto flex h-[36px] w-full max-w-full gap-1.5 md:h-[40px] md:gap-2 lg:h-[32px] lg:gap-1 xl:h-[36px] xl:gap-1.5 2xl:h-[40px] 2xl:gap-2"
      >
        <button
          @click="$emit('view-details', project)"
          class="card-button flex-1 truncate rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 md:px-3.5 md:py-2 md:text-sm lg:px-2.5 lg:py-1 lg:text-xs xl:px-3 xl:py-1.5 2xl:px-3.5 2xl:py-2 2xl:text-sm"
        >
          <span v-if="project.isPublic">查看詳情</span>
          <span v-else>專案細節</span>
        </button>

        <a
          v-if="project.isPublic && project.repoUrl"
          :href="project.repoUrl"
          target="_blank"
          class="card-icon flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a] text-white transition-colors hover:bg-[#333] md:h-[40px] md:w-[40px] lg:h-[32px] lg:w-[32px] xl:h-[36px] xl:w-[36px] 2xl:h-[40px] 2xl:w-[40px]"
          aria-label="原始碼"
          title="查看原始碼"
        >
          <svg
            class="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3 lg:w-3 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </a>

        <a
          v-if="project.isPublic && project.demoUrl"
          :href="project.demoUrl"
          target="_blank"
          class="card-icon flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a] text-white transition-colors hover:bg-[#333] md:h-[40px] md:w-[40px] lg:h-[32px] lg:w-[32px] xl:h-[36px] xl:w-[36px] 2xl:h-[40px] 2xl:w-[40px]"
          aria-label="在線演示"
          title="查看演示"
        >
          <svg
            class="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-3 lg:w-3 xl:h-3.5 xl:w-3.5 2xl:h-4 2xl:w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlaceholderImage from '../common/PlaceholderImage.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

defineEmits(['view-details'])

// 限制顯示的技術標籤數量
const maxTags = computed(() => {
  // 在伺服器端渲染時返回預設值
  if (typeof window === 'undefined') {
    return 3
  }
  // 在中等寬度螢幕上只顯示2個標籤
  return window.innerWidth >= 1024 && window.innerWidth < 1280 ? 2 : 3
})

// 最多只顯示maxTags個技術標籤
const displayedTechnologies = computed(() => {
  return props.project.technologies.slice(0, maxTags.value)
})

// 圖片加載失敗處理
function onImageError(e) {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  parent.innerHTML = '<placeholder-image />'
}
</script>

<style scoped>
/* 自定義懸停效果 - 陰影與提升效果增強質感 */
.group {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateZ(0);
  will-change: transform;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.group:hover {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

/* 改進文字剪裁方式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 100%;
}

/* 針對超小螢幕的特殊調整 */
@media (max-width: 520px) {
  .group {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .card-content {
    min-height: 160px !important;
    padding: 0.5rem 0.75rem !important;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  h3 {
    font-size: 0.875rem !important;
    max-width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-tag {
    font-size: 0.6rem !important;
    padding: 0.1rem 0.4rem !important;
  }

  p.line-clamp-2 {
    margin-bottom: 0.5rem !important;
    font-size: 0.7rem !important;
    height: 2.2rem !important;
    max-width: 100%;
    overflow: hidden;
  }

  .tech-tags {
    min-height: 1.5rem !important;
    margin-bottom: 0.5rem !important;
    gap: 0.25rem !important;
    max-width: 100%;
    overflow: hidden;
  }

  .tech-tag {
    font-size: 0.65rem !important;
    padding: 0.1rem 0.3rem !important;
  }

  .card-actions {
    height: 28px !important;
    gap: 0.25rem !important;
    max-width: 100%;
  }

  .card-actions button {
    font-size: 0.7rem !important;
    padding: 0.1rem 0.5rem !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-icon {
    height: 28px !important;
    width: 28px !important;
    flex-shrink: 0;
  }

  .card-icon svg {
    height: 0.75rem !important;
    width: 0.75rem !important;
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  /* 處理中等寬度螢幕上的卡片樣式 */
  .group {
    max-width: 100%;
  }

  /* 調整中等寬度螢幕上的內容區域 */
  .card-content {
    min-height: 160px !important;
    padding: 0.75rem !important;
  }

  /* 調整字體大小 */
  h3 {
    font-size: 0.9rem !important;
  }

  /* 調整技術標籤大小 */
  .tech-tag {
    font-size: 0.7rem !important;
    padding: 0.1rem 0.5rem !important;
    line-height: 1.5;
  }

  /* 統一按鈕高度為32px */
  .card-actions button,
  .card-actions a {
    height: 32px !important;
  }

  .card-actions button {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem !important;
  }

  .card-actions a {
    width: 32px !important;
  }

  .card-actions a svg {
    height: 0.75rem;
    width: 0.75rem;
  }
}
</style>
