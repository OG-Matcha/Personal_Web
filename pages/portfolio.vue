<!-- pages/portfolio.vue -->
<template>
  <div class="box-border w-full max-w-full overflow-hidden p-8">
    <!-- 移除居中包裝 div，使標題與其他頁面一致 -->
    <section-title>作品集</section-title>
    <p class="mb-5 max-w-3xl text-base text-gray-300 md:mb-6 md:text-lg lg:mb-5 xl:mb-8">
      這裡展示了我的部分專案作品，包含個人和團隊開發的項目
    </p>

    <!-- 項目過濾器 -->
    <project-filters
      :categories="categories"
      :active-category="activeCategory"
      :visibility-filter="visibilityFilter"
      @update:category="activeCategory = $event"
      @update:visibility="visibilityFilter = $event"
    />

    <!-- 項目卡片網格 - 調整網格佈局和間距 -->
    <div
      class="mt-6 box-border grid w-full max-w-full grid-cols-1 gap-5 overflow-hidden sm:grid-cols-2 md:mt-8 lg:mt-6 lg:gap-4 xl:mt-8 xl:gap-5 2xl:gap-6"
    >
      <project-card
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @view-details="openProjectModal"
      />
    </div>

    <!-- 無項目顯示 -->
    <div
      v-if="filteredProjects.length === 0"
      class="mt-6 flex flex-col items-center justify-center py-6 md:mt-8 md:py-8"
    >
      <div class="rounded-full bg-gray-800/50 p-6 md:p-8">
        <svg
          class="h-10 w-10 text-gray-500 md:h-12 md:w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.663 17h4.673M12 3v1m0 16v1m-8-8h1m15 0h1m-8-8l-0.565 0.565M12 12v.01M16 16l-4-4 4-4-4 4-4-4 4 4-4 4 4-4"
          ></path>
        </svg>
      </div>
      <h3 class="mt-4 text-xl font-medium text-gray-400">無符合條件的項目</h3>
      <p class="mt-2 text-center text-gray-500">請嘗試調整過濾條件以查看更多項目</p>
    </div>

    <!-- 項目詳情模態窗 -->
    <project-modal
      v-if="selectedProject"
      :project="selectedProject"
      :show="showModal"
      @close="closeProjectModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SectionTitle from '~/components/common/SectionTitle.vue'
import ProjectCard from '~/components/portfolio/ProjectCard.vue'
import ProjectFilters from '~/components/portfolio/ProjectFilters.vue'
import ProjectModal from '~/components/portfolio/ProjectModal.vue'

// 項目分類
const categories = [
  { id: 'all', name: '全部' },
  { id: 'web', name: 'Web應用' },
  { id: 'fintech', name: '金融科技' },
  { id: 'security', name: '資訊安全' },
  { id: 'chatbot', name: '聊天機器人' },
  { id: 'tool', name: '工具類' },
]

// 活動狀態
const activeCategory = ref('all')
const visibilityFilter = ref('all') // 'all', 'public', 'private'
const showModal = ref(false)
const selectedProject = ref(null)

// 項目數據
const projects = ref([
  {
    id: 1,
    title: 'Finctory.com',
    description: '斐闊 Finctory 官方網站，結合了社群媒體連結管理和成就展示的功能。',
    category: 'web',
    isPublic: true,
    repoUrl: 'https://github.com/OG-Matcha/Finctory-Official-Website',
    demoUrl: 'https://www.finctory.com/',
    technologies: ['Vue.js', 'Nuxt.js', 'Tailwind CSS', 'Github Actions'],
    features: ['社群連結整合', '響應式設計', 'SEO 優化'],
    challenges:
      '設計一個既美觀又實用的響應式介面，確保在各種裝置上都能完美呈現，優化網站效能，確保在載入多媒體內容的同時保持快速的存取速度。',
  },
  {
    id: 2,
    title: 'Catalyst',
    description:
      'Catalyst 是一款革新性的軟體開發生命週期（SDLC）自動化平台，採用先進的 Multi-Agent 框架，實現從需求分析到部署維護的全流程自動化。系統透過多個專業化的 AI 代理協同工作，能夠智能分析需求文件、自動生成程式碼、執行測試案例，並處理部署流程。',
    thumbnail: './images/catalyst-1.png',
    category: 'tool',
    isPublic: false,
    technologies: [
      'Smart Graph',
      'Autogen',
      'Streamlit',
      'FAISS Index',
      'Docker',
      'Kubernetes',
      'GCP',
    ],
    screenshots: ['./images/catalyst-2.png'],
    features: [
      '智能需求分析',
      '程式碼自動生成',
      '程式碼自動生成',
      'CI/CD 流程整合',
      '多代理協同作業',
      '程式碼品質監控',
    ],
    challenges:
      '協調多個 AI 代理之間的溝通和任務分配，確保各個開發階段能夠順暢銜接，自動生成程式碼時，確保程式碼品質和安全性。',
  },
  {
    id: 3,
    title: '發票醫生',
    description:
      '發票醫生是一款專為社會新鮮人打造的智能理財助手，運用先進的大語言模型（LLM）技術，將繁瑣的發票管理轉變為個人化的財務顧問服務。系統透過多模組 LLM Multi-Agent 架構，不只是被動的記帳工具，更是主動提供財務建議的智能夥伴。結合自動化數據處理和自然語言互動，讓使用者能以最直覺的方式管理財務、獲取建議，實現精明理財的目標。',
    thumbnail: './images/invoicedoctor-1.jpg',
    category: 'web',
    isPublic: false,
    technologies: [
      'Nuxt.js',
      'Tailwind CSS',
      'FastAPI',
      'LangChain',
      'LangGraph',
      'PostgreSQL',
      'OpenAI API',
      'Docker',
      'Heroku',
    ],
    screenshots: ['./images/invoicedoctor-2.png', './images/invoicedoctor-3.png'],
    features: [
      '電子發票自動識別與分類',
      '提供個人化理財建議和消費分析',
      '智能比價系統',
      '互動式客服',
      '動態財務分析',
    ],
    challenges:
      '優化多模組 LLM 系統的協同運作，確保各個功能模組能夠順暢銜接，設計精準的 Prompt Engineering，使 AI 能夠準確理解使用者的財務狀況並提供有價值的建議。',
  },
  {
    id: 4,
    title: 'PhishForge',
    description:
      'PhishForge 透過整合生成式 AI 技術，能夠自動產生高度客製化的模擬釣魚郵件和仿製網站，並快速部署至雲端環境。平台不僅自動化了整個滲透測試流程，還能即時收集和分析使用者的互動行為，為企業提供全方位的資安意識培訓解決方案。',
    thumbnail: './images/phishforge-1.png',
    category: 'security',
    isPublic: false,
    technologies: [
      'Vue.js',
      'LangChain',
      'Gemini API',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'Docker',
      'AWS',
    ],
    screenshots: ['./images/phishforge-2.png', './images/phishforge-3.png'],
    features: ['高度定制的釣魚郵件模板', '員工行為追踪與分析', '培訓效果評估報告'],
    challenges:
      '確保 AI 生成的內容既真實可信又不會造成實際危害，建立一個能夠快速部署且安全隔離的雲端環境。設計一個既能收集完整數據又不侵犯隱私的分析系統。',
  },
  {
    id: 5,
    title: 'Ched.AI',
    description: 'Ched.AI 是一個創新的金融科技解決方案，專注於改革傳統徵信流程。',
    thumbnail: './images/chedai-1.png',
    category: 'fintech',
    isPublic: true,
    repoUrl: 'https://github.com/OG-Matcha/Credit-Report',
    technologies: ['Python', 'OpenAI API', 'LLaMA 3', 'Gradio', 'Flask'],
    screenshots: ['./images/chedai-2.png', './images/chedai-3.png'],
    features: [
      '自動化財務報表分析',
      '徵信風險評估',
      '財務資料檢索提供',
      '多種 AI 模型支持（OpenAI 和 LLaMA）',
    ],
    challenges:
      '確保 AI 模型能夠準確理解和分析專業的金融資訊，在保證資訊安全的前提下實現高效的本地化運算。通過採用先進的向量索引技術和優化的本地模型。',
  },
  {
    id: 6,
    title: '2024新生知訊網聊天機器人',
    description: '為中央大學新生開發的智能問答系統，幫助新生快速了解校園資訊和入學流程',
    category: 'chatbot',
    isPublic: true,
    repoUrl: 'https://github.com/OG-Matcha/NCU_Fresh_Web_ChatBot',
    technologies: ['Python', 'Flask', 'OpenAI API', 'LangChain', 'Streamlit', 'Gradio'],
    features: ['校園信息智能問答', '入學流程指導', '常見問題解答', '個性化推薦資源', '多語言支持'],
    challenges: '建立準確且全面的校園知識庫，並確保聊天機器人能夠理解多樣化的問題表述方式',
  },
  {
    id: 7,
    title: 'Cow of Answer',
    description:
      '一款結合《答案之書》和《Find the Invisible Cow》概念的心靈放鬆遊戲，通過有趣的互動方式幫助用戶紓解壓力，尋找屬於自己的答案',
    thumbnail: './images/cowofanswer-1.png',
    category: 'web',
    isPublic: true,
    repoUrl: 'https://github.com/OG-Matcha/Cow-of-Answer',
    technologies: [
      'Nuxt.js',
      'Tailwind CSS',
      'Laravel',
      'PostgreSQL',
      'Redis',
      'Nginx',
      'Docker',
      'Azure',
    ],
    screenshots: ['./images/cowofanswer-2.png', './images/cowofanswer-3.png'],
    features: [
      '趣味性隨機答案生成系統',
      '聲音導向的互動尋找遊戲',
      '心理紓壓主題設計',
      '成就蒐集系統',
      '輕鬆有趣的用戶界面',
    ],
    challenges:
      '設計一個能夠平衡遊戲趣味性和心理紓壓功能的系統，實現準確的聲音反饋機制，同時創造輕鬆但有意義的使用者體驗。需要特別注意聲音設計的準確性和反應速度，以及如何通過遊戲化方式幫助用戶真正達到放鬆心情的目的',
  },
  {
    id: 8,
    title: 'BrainLib',
    description:
      '致力於提供專注於學術交流的平台，讓全球研究者分享研究成果和見解，並透過評論、討論和私訊建立學術社群。',
    thumbnail: './images/brainlib-1.png',
    category: 'web',
    isPublic: true,
    repoUrl: 'https://github.com/OG-Matcha/BrainLib',
    technologies: ['Vue.js', 'Tailwind CSS', 'Spring', 'Hibernate', 'PostgreSQL', 'Docker'],
    screenshots: ['./images/brainlib-1.png', './images/brainlib-2.png', './images/brainlib-3.png'],
    features: [
      '學術文章發布與分享系統',
      '跨學科討論區與知識交流',
      '學術活動組織與報名管理',
      '研究者之間的私密通訊系統',
      '學術社群建立與管理工具',
    ],
    challenges:
      '設計兼顧學術嚴謹性與良好用戶體驗的界面，建立有效的內容審核機制確保學術品質，同時平衡開放交流與知識產權保護，整合線上討論與線下活動體驗，構建支持多種學科特殊需求的統一平台',
  },
])

// 過濾項目
const filteredProjects = computed(() => {
  let result = projects.value

  // 過濾類別
  if (activeCategory.value !== 'all') {
    result = result.filter((project) => project.category === activeCategory.value)
  }

  // 過濾可見性
  if (visibilityFilter.value === 'public') {
    result = result.filter((project) => project.isPublic)
  } else if (visibilityFilter.value === 'private') {
    result = result.filter((project) => !project.isPublic)
  }

  return result
})

// 打開項目詳情模態窗
function openProjectModal(project) {
  selectedProject.value = project
  showModal.value = true
}

// 關閉項目詳情模態窗
function closeProjectModal() {
  showModal.value = false
  // 短暫延遲後清除選中的項目，使得關閉動畫能夠順利完成
  setTimeout(() => {
    selectedProject.value = null
  }, 300)
}
</script>

<style>
/* 確保在portfolio頁面所有元素正確限制寬度 */
.project-card,
.project-filters,
.section-title,
.grid {
  max-width: 100%;
  overflow-x: hidden;
}

/* 確保模態窗口不受影響 */
.project-modal {
  max-width: none;
  overflow: visible;
}

/* 針對小螢幕特別優化 */
@media (max-width: 520px) {
  .grid {
    width: 100%;
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
