<!-- FrameworkExperienceChart.vue - 框架和工具經驗圖表 -->
<template>
  <div class="framework-experience-chart">
    <!-- 過濾分類 -->
    <div class="mb-6 flex flex-wrap justify-center gap-2">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="activeCategory = category.id"
        class="rounded-full px-4 py-1 text-sm transition duration-300"
        :class="
          activeCategory === category.id
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        "
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 縮放控制 -->
    <div class="mb-6 flex items-center justify-center">
      <span class="mr-2 text-sm text-gray-400">縮小</span>
      <input
        type="range"
        min="50"
        max="100"
        step="5"
        v-model="zoomLevel"
        class="zoom-slider"
        @input="updateContainerHeight"
      />
      <span class="ml-2 text-sm text-gray-400">放大</span>
      <span class="ml-4 text-xs text-gray-500">{{ zoomLevel }}%</span>
    </div>

    <!-- 框架卡片網格容器 -->
    <div class="grid-container" :style="{ height: containerHeight + 'px' }">
      <!-- 框架卡片網格 -->
      <div
        ref="gridRef"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
      >
        <div v-for="framework in filteredFrameworks" :key="framework.name" class="framework-card">
          <div class="framework-icon">{{ framework.icon }}</div>
          <div class="framework-name">{{ framework.name }}</div>
          <div class="framework-experience-bar">
            <div class="progress-fill" :style="{ width: `${framework.experience}%` }"></div>
          </div>
          <div class="framework-experience-years">{{ framework.years }}年經驗</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

// 縮放級別
const zoomLevel = ref(80) // 預設為 80%
const gridRef = ref(null)
const containerHeight = ref(0)

// 更新容器高度
const updateContainerHeight = async () => {
  await nextTick()
  if (gridRef.value) {
    // 獲取網格的原始高度並根據縮放比例計算容器高度
    const originalHeight = gridRef.value.scrollHeight
    containerHeight.value = originalHeight * (zoomLevel.value / 100)
  }
}

// 組件掛載後初始化容器高度
onMounted(async () => {
  await updateContainerHeight()
  // 監聽窗口大小變化，更新容器高度
  window.addEventListener('resize', updateContainerHeight)
})

// 技術分類
const categories = [
  { id: 'all', name: '全部' },
  { id: 'lang', name: '程式語言' },
  { id: 'ai', name: 'AI/自動化' },
  { id: 'data', name: '資料處理' },
  { id: 'frontend', name: '前端' },
  { id: 'backend', name: '後端' },
  { id: 'framework', name: '框架' },
  { id: 'cloud', name: '雲服務' },
  { id: 'devtools', name: '開發工具' },
  { id: 'design', name: '設計' },
  { id: 'ide', name: 'IDE' },
]

const activeCategory = ref('all')

// 框架和工具數據
const frameworks = ref([
  // 程式語言
  {
    name: 'C',
    icon: '©️',
    category: 'lang',
    experience: 92,
    years: 4,
  },
  {
    name: 'C++',
    icon: '➕➕',
    category: 'lang',
    experience: 88,
    years: 3,
  },
  {
    name: 'Python',
    icon: '🐍',
    category: 'lang',
    experience: 92,
    years: 4,
  },
  {
    name: 'Java',
    icon: '☕',
    category: 'lang',
    experience: 88,
    years: 3,
  },
  {
    name: 'JavaScript',
    icon: '🟡',
    category: 'lang',
    experience: 88,
    years: 3,
  },
  {
    name: 'Dart',
    icon: '🎯',
    category: 'lang',
    experience: 72,
    years: 1,
  },
  {
    name: 'PHP',
    icon: '🐘',
    category: 'lang',
    experience: 75,
    years: 1,
  },

  // AI/自動化
  {
    name: 'PyTorch',
    icon: '🔥',
    category: 'ai',
    experience: 80,
    years: 2,
  },
  {
    name: 'TensorFlow',
    icon: '➿',
    category: 'ai',
    experience: 78,
    years: 2,
  },
  {
    name: 'scikit-learn',
    icon: '🧠',
    category: 'ai',
    experience: 86,
    years: 3,
  },
  {
    name: 'LangChain',
    icon: '🔗',
    category: 'ai',
    experience: 70,
    years: 1,
  },
  {
    name: 'Selenium',
    icon: '🤖',
    category: 'ai',
    experience: 82,
    years: 2,
  },

  // 資料處理
  {
    name: 'NumPy',
    icon: '🧮',
    category: 'data',
    experience: 88,
    years: 3,
  },
  {
    name: 'Pandas',
    icon: '🐼',
    category: 'data',
    experience: 90,
    years: 3,
  },
  {
    name: 'Matplotlib',
    icon: '📊',
    category: 'data',
    experience: 87,
    years: 3,
  },
  {
    name: 'Seaborn',
    icon: '🌊',
    category: 'data',
    experience: 85,
    years: 3,
  },

  // 前端
  {
    name: 'HTML',
    icon: '📄',
    category: 'frontend',
    experience: 85,
    years: 2,
  },
  {
    name: 'CSS',
    icon: '🎨',
    category: 'frontend',
    experience: 83,
    years: 2,
  },
  {
    name: 'Vue.js',
    icon: '🟢',
    category: 'frontend',
    experience: 88,
    years: 2,
  },
  {
    name: 'Nuxt.js',
    icon: '💚',
    category: 'frontend',
    experience: 82,
    years: 2,
  },
  {
    name: 'Sass',
    icon: '💅',
    category: 'frontend',
    experience: 78,
    years: 2,
  },
  {
    name: 'Tailwind CSS',
    icon: '💨',
    category: 'frontend',
    experience: 85,
    years: 2,
  },

  // 後端
  {
    name: 'Node.js',
    icon: '🟩',
    category: 'backend',
    experience: 85,
    years: 2,
  },
  {
    name: 'Express',
    icon: '🚂',
    category: 'backend',
    experience: 83,
    years: 2,
  },
  {
    name: 'Django',
    icon: '🦎',
    category: 'backend',
    experience: 87,
    years: 3,
  },
  {
    name: 'FastAPI',
    icon: '⚡',
    category: 'backend',
    experience: 88,
    years: 3,
  },
  {
    name: 'Flask',
    icon: '🧪',
    category: 'backend',
    experience: 86,
    years: 3,
  },
  {
    name: 'Sequelize',
    icon: '🔄',
    category: 'backend',
    experience: 80,
    years: 2,
  },
  {
    name: 'GraphQL',
    icon: '⚛️',
    category: 'backend',
    experience: 72,
    years: 1,
  },
  {
    name: 'Spring',
    icon: '🌱',
    category: 'backend',
    experience: 70,
    years: 1,
  },
  {
    name: 'Nginx',
    icon: '🟩',
    category: 'backend',
    experience: 78,
    years: 2,
  },
  {
    name: 'MySQL',
    icon: '🐬',
    category: 'backend',
    experience: 84,
    years: 2,
  },
  {
    name: 'PostgreSQL',
    icon: '🐘',
    category: 'backend',
    experience: 86,
    years: 3,
  },
  {
    name: 'SQLite',
    icon: '💾',
    category: 'backend',
    experience: 87,
    years: 3,
  },
  {
    name: 'Redis',
    icon: '🔴',
    category: 'backend',
    experience: 80,
    years: 2,
  },

  // 框架
  {
    name: 'Qt',
    icon: '🧩',
    category: 'framework',
    experience: 86,
    years: 3,
  },
  {
    name: 'Flutter',
    icon: '🦋',
    category: 'framework',
    experience: 72,
    years: 1,
  },
  {
    name: 'Laravel',
    icon: '🔶',
    category: 'framework',
    experience: 75,
    years: 1,
  },
  {
    name: 'Discord BOT',
    icon: '🎮',
    category: 'framework',
    experience: 85,
    years: 2,
  },

  // 雲服務
  {
    name: 'GCP',
    icon: '☁️',
    category: 'cloud',
    experience: 73,
    years: 1,
  },
  {
    name: 'Heroku',
    icon: '🟣',
    category: 'cloud',
    experience: 82,
    years: 2,
  },

  // 開發工具
  {
    name: 'Docker',
    icon: '🐳',
    category: 'devtools',
    experience: 82,
    years: 2,
  },
  {
    name: 'Git',
    icon: '🌿',
    category: 'devtools',
    experience: 94,
    years: 4,
  },
  {
    name: 'Linux',
    icon: '🐧',
    category: 'devtools',
    experience: 88,
    years: 3,
  },
  {
    name: 'Postman',
    icon: '👨‍🚀',
    category: 'devtools',
    experience: 87,
    years: 3,
  },

  // 設計
  {
    name: 'Canva',
    icon: '🎭',
    category: 'design',
    experience: 87,
    years: 3,
  },
  {
    name: 'Figma',
    icon: '🧩',
    category: 'design',
    experience: 83,
    years: 2,
  },
  {
    name: 'Markdown',
    icon: '📝',
    category: 'design',
    experience: 88,
    years: 3,
  },

  // IDE
  {
    name: 'VS Code',
    icon: '📘',
    category: 'ide',
    experience: 95,
    years: 4,
  },
  {
    name: 'Eclipse',
    icon: '🌓',
    category: 'ide',
    experience: 78,
    years: 2,
  },
  {
    name: 'Jupyter',
    icon: '🪐',
    category: 'ide',
    experience: 87,
    years: 3,
  },
])

// 過濾顯示的框架
const filteredFrameworks = computed(() => {
  if (activeCategory.value === 'all') {
    return frameworks.value
  }
  return frameworks.value.filter((f) => f.category === activeCategory.value)
})

// 當過濾的框架改變時，更新容器高度
watch(filteredFrameworks, async () => {
  await updateContainerHeight()
})
</script>

<style scoped>
.framework-experience-chart {
  padding: 1rem;
}

/* 網格容器 */
.grid-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  transition: height 0.3s ease;
}

/* 縮放滑塊樣式 */
.zoom-slider {
  -webkit-appearance: none;
  width: 150px;
  height: 6px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 3px;
  outline: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-slider::-webkit-slider-thumb:hover {
  background: #4f46e5;
  transform: scale(1.1);
}

.zoom-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.zoom-slider::-moz-range-thumb:hover {
  background: #4f46e5;
  transform: scale(1.1);
}

.framework-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.framework-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
}

.framework-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.framework-name {
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-align: center;
}

.framework-experience-bar {
  width: 100%;
  height: 6px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #6366f1, #8b5cf6);
  border-radius: 3px;
  transition: width 1s ease-out;
}

.framework-experience-years {
  font-size: 0.75rem;
  color: #94a3b8;
}
</style>
