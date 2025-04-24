<!-- resume.vue -->
<template>
  <div class="resume-container">
    <section-title>職業生涯</section-title>

    <!-- 頂部導航與下載按鈕整合 -->
    <div
      class="mb-4 flex flex-col flex-wrap items-center justify-between gap-3 sm:mb-6 sm:flex-row lg:mb-10"
    >
      <div
        class="mb-3 flex w-full flex-wrap justify-center gap-2 sm:mb-0 sm:w-auto sm:justify-start sm:gap-3"
      >
        <button
          v-for="section in sections"
          :key="section.id"
          @click="(e) => scrollToSection(section.id, e)"
          class="group flex cursor-pointer items-center rounded-full border border-gray-700 px-3 py-1.5 text-xs text-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 sm:px-4 sm:py-2 sm:text-sm"
          :class="[
            'hover:border-yellow-400/40 hover:bg-[#242424] hover:text-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.1)] focus:ring-yellow-400/50',
          ]"
        >
          <span class="mr-1.5 flex h-3.5 w-3.5 items-center justify-center sm:mr-2 sm:h-4 sm:w-4">
            <svg
              class="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="section.id === 'experience'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
              <path v-if="section.id === 'education'" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path
                v-if="section.id === 'education'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
              />
              <path
                v-if="section.id === 'research'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
              <path
                v-if="section.id === 'achievements'"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </span>
          {{ section.title }}
        </button>
      </div>

      <button
        @click="downloadResume"
        class="group flex w-full items-center justify-center rounded-full border border-yellow-400/40 px-4 py-1.5 text-xs text-yellow-400 transition-all duration-300 hover:bg-[#242424] hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] focus:outline-none focus:ring-2 focus:ring-yellow-400/50 sm:w-auto sm:justify-start sm:px-6 sm:py-2 sm:text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12 sm:mr-2 sm:h-5 sm:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        下載完整履歷
      </button>
    </div>

    <div class="resume-content">
      <div
        ref="experienceSection"
        id="experience"
        class="mb-4 flex scroll-mt-20 items-center space-x-2 sm:mb-6 sm:scroll-mt-24 sm:space-x-4 lg:mb-10"
      >
        <span
          class="inline-block rounded bg-yellow-400/10 p-1.5 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.1)] sm:p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </span>
        <h2 class="text-base font-bold text-white sm:text-lg lg:text-xl">專業經驗</h2>
      </div>

      <ResumeSection />

      <div
        ref="educationSection"
        id="education"
        class="mb-4 flex scroll-mt-20 items-center space-x-2 sm:mb-6 sm:scroll-mt-24 sm:space-x-4 lg:mb-10"
      >
        <span
          class="inline-block rounded bg-yellow-400/10 p-1.5 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.1)] sm:p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
        </span>
        <h2 class="text-base font-bold text-white sm:text-lg lg:text-xl">教育背景</h2>
      </div>

      <EducationSection />

      <div
        ref="researchSection"
        id="research"
        class="mb-4 flex scroll-mt-20 items-center space-x-2 sm:mb-6 sm:scroll-mt-24 sm:space-x-4 lg:mb-10"
      >
        <span
          class="inline-block rounded bg-yellow-400/10 p-1.5 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.1)] sm:p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </span>
        <h2 class="text-base font-bold text-white sm:text-lg lg:text-xl">研究</h2>
      </div>

      <ResearchSection />

      <div
        ref="achievementsSection"
        id="achievements"
        class="mb-4 flex scroll-mt-20 items-center space-x-2 sm:mb-6 sm:scroll-mt-24 sm:space-x-4 lg:mb-10"
      >
        <span
          class="inline-block rounded bg-yellow-400/10 p-1.5 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.1)] sm:p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </span>
        <h2 class="text-base font-bold text-white sm:text-lg lg:text-xl">
          獎項、領導經驗與社團活動
        </h2>
      </div>

      <div
        class="overflow-hidden rounded-[16px] bg-[#1A1A1A] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:shadow-[inset_0_0_25px_rgba(0,0,0,0.3)] sm:rounded-[20px] sm:p-6 lg:rounded-[24px] lg:p-8"
      >
        <!-- 按鈕過濾器 -->
        <div class="mb-4 flex flex-wrap justify-center gap-2 sm:mb-6 sm:gap-1.5 sm:gap-3 lg:mb-8">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="updateFilter(filter.value)"
            class="rounded-full px-3 py-1.5 text-xs transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm"
            :class="[
              activeFilter === filter.value
                ? 'bg-yellow-400/20 text-yellow-400'
                : 'bg-[#262626] text-gray-300 hover:bg-[#2A2A2A]',
            ]"
            :aria-pressed="activeFilter === filter.value"
            role="button"
          >
            {{ filter.label }}
            <span
              v-if="filter.value !== 'all'"
              class="ml-1 rounded-full bg-[#333] px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-xs"
            >
              {{
                filter.value === 'award'
                  ? awards.length
                  : filter.value === 'leadership'
                    ? leadership.length
                    : filter.value === 'activity'
                      ? activities.length
                      : 0
              }}
            </span>
          </button>
        </div>

        <div class="relative">
          <!-- 時間線 -->
          <div
            class="absolute left-0 ml-[7px] h-full border-l-2 border-[#333333] sm:ml-[8px] lg:ml-[9px]"
          ></div>

          <TransitionGroup name="items-fade" tag="div" class="achievements-container" mode="out-in">
            <!-- 獎項與領導經驗項目 -->
            <div
              v-for="(item, index) in filteredItems"
              :key="item.title"
              class="timeline-item group relative mb-6 sm:mb-8 lg:mb-10"
            >
              <!-- 時間線指示器 -->
              <div
                class="border-3 absolute left-0 z-10 -ml-[1px] h-[14px] w-[14px] rounded-full border-[#1A1A1A] transition-all duration-300 group-hover:scale-110 sm:h-[16px] sm:w-[16px] sm:border-4 lg:h-[18px] lg:w-[18px]"
                :class="[
                  { 'animate-pulse': activePulse === index },
                  item.type === 'award'
                    ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)] group-hover:shadow-[0_0_15px_rgba(96,165,250,0.4)]'
                    : item.type === 'leadership'
                      ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)] group-hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                      : 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)] group-hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]',
                ]"
                @mouseenter="activePulse = index"
                @mouseleave="activePulse = null"
              ></div>

              <!-- 項目內容 -->
              <div
                class="ml-7 transform transition-all duration-500 group-hover:translate-x-1 sm:ml-9 lg:ml-12"
              >
                <div class="mb-1 flex flex-col items-start sm:mb-2 sm:flex-row sm:items-center">
                  <!-- 類型標籤 -->
                  <span
                    class="mb-1.5 mr-0 mt-0 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold sm:mb-0 sm:mr-2 sm:mr-3 sm:mt-1 sm:px-3 sm:py-1 sm:text-xs"
                    :class="[
                      item.type === 'award'
                        ? 'bg-blue-400/20 text-blue-400'
                        : item.type === 'leadership'
                          ? 'bg-green-400/20 text-green-400'
                          : 'bg-yellow-400/20 text-yellow-400',
                    ]"
                  >
                    {{
                      item.type === 'award'
                        ? '獎項'
                        : item.type === 'leadership'
                          ? '領導經驗'
                          : '社團活動'
                    }}
                  </span>

                  <div
                    class="flex w-full flex-grow flex-col gap-1 sm:w-auto sm:flex-row sm:justify-between sm:gap-2"
                  >
                    <h4
                      class="text-base font-bold text-white transition-colors duration-300 sm:text-lg"
                      :class="[
                        item.type === 'award'
                          ? 'group-hover:text-blue-400'
                          : item.type === 'leadership'
                            ? 'group-hover:text-green-400'
                            : 'group-hover:text-yellow-400',
                      ]"
                    >
                      {{ item.title }}
                    </h4>
                    <div
                      class="flex items-center whitespace-normal text-xs text-gray-400 sm:whitespace-nowrap sm:text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="mr-1 h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {{ item.date || item.period }}
                    </div>
                  </div>
                </div>

                <div class="mb-1 text-xs text-gray-400 sm:mb-2 sm:text-sm">
                  <span
                    class="font-semibold"
                    :class="[
                      item.type === 'award'
                        ? 'text-blue-400'
                        : item.type === 'leadership'
                          ? 'text-green-400'
                          : 'text-yellow-400',
                    ]"
                    >{{ item.organization || item.issuer }}</span
                  >
                  <span v-if="item.location" class="ml-2"> | {{ item.location }} </span>
                </div>

                <p class="text-xs text-gray-300 sm:text-sm">{{ item.description }}</p>

                <!-- 成長指標 -->
                <div
                  v-if="item.growthIndicators && item.growthIndicators.length > 0"
                  class="mt-2 flex flex-wrap gap-1.5"
                >
                  <span
                    v-for="(indicator, i) in item.growthIndicators"
                    :key="i"
                    class="mb-1 inline-block rounded-md px-2 py-0.5 text-[10px] sm:text-xs"
                    :class="[
                      item.type === 'award'
                        ? 'bg-blue-400/10 text-blue-400'
                        : item.type === 'leadership'
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-yellow-400/10 text-yellow-400',
                    ]"
                  >
                    {{ indicator }}
                  </span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from '#app'
import SectionTitle from '~/components/common/SectionTitle.vue'
import ResumeSection from '~/components/resume/ResumeSection.vue'
import EducationSection from '~/components/resume/EducationSection.vue'
import ResearchSection from '~/components/resume/ResearchSection.vue'

const router = useRouter()

// 使用ref直接引用各個區塊
const experienceSection = ref(null)
const educationSection = ref(null)
const researchSection = ref(null)
const achievementsSection = ref(null)

// 各部分定義
const sections = [
  {
    id: 'experience',
    title: '專業經驗',
    ref: experienceSection,
  },
  {
    id: 'education',
    title: '教育背景',
    ref: educationSection,
  },
  {
    id: 'research',
    title: '研究',
    ref: researchSection,
  },
  {
    id: 'achievements',
    title: '獎項、領導經驗與社團活動',
    ref: achievementsSection,
  },
]

// 過濾器選項
const filters = [
  { label: '全部', value: 'all' },
  { label: '獎項', value: 'award' },
  { label: '領導', value: 'leadership' },
  { label: '社團', value: 'activity' },
]

const activeFilter = ref('all')
const activePulse = ref(null)
const showBackToTop = ref(false)

// 獎項資料，包含類型標記
const awards = [
  {
    type: 'award',
    title: '第六屆台積電校園黑客松 - AI維運懶人包組 - 第一名',
    issuer: '台積電',
    date: '2025年2月',
    description:
      '開發AI維運自動化工具，提升系統維護效率並降低人力成本，在眾多參賽團隊中脫穎而出獲得第一名。',
    growthIndicators: ['AI應用開發', '軟體開發生命週期', '自動化CI/CD', '技術創新'],
  },
  {
    type: 'award',
    title: '第七屆社會企業創業提案競賽 - 後起之秀組 - 優選',
    issuer: '社團法人台灣永續典範永續發展協會',
    date: '2025年2月',
    description:
      '以「發票醫生」專案參賽，運用AI及數據分析技術提供低成本理財建議服務（SDGs 1.4），並透過便捷的財務管理降低使用者心理壓力（SDGs 3.4），實現普惠金融與心理健康的雙重社會價值。',
    growthIndicators: ['Finctory', 'SDGs實踐', '普惠金融', '社會創新', '心理健康'],
  },
  {
    type: 'award',
    title: '臺北市智慧城市青年舉政徵件提案競賽 - 佳作',
    issuer: '臺北市政府青年局',
    date: '2024年12月',
    description: '「發票醫生」專案展現智慧城市應用潛力，期望與北市府合作，提升城市智慧化程度。',
    growthIndicators: ['Finctory', '智慧城市', '數位轉型', '創新應用'],
  },
  {
    type: 'award',
    title: '第29屆大專校院資訊應用服務創新競賽 - 資安應用組 - 第一名',
    issuer: '數位發展部 | 教育部 | 中華民國資訊管理學會',
    date: '2024年11月',
    description:
      '以「PhishForge」專案參賽，開發創新的社交工程防禦系統，運用生成式AI技術提升資安防護能力。',
    growthIndicators: ['資訊安全', '社交工程', '生成式AI', '系統開發', '技術整合'],
  },
  {
    type: 'award',
    title: '第29屆大專校院資訊應用服務創新競賽 - 資訊應用組IP-06 - 佳作',
    issuer: '數位發展部 | 教育部 | 中華民國資訊管理學會',
    date: '2024年11月',
    description: '「PhishForge」專案在資訊應用組展現優異表現，展示AI技術在資安領域的創新應用。',
    growthIndicators: ['資訊安全', '社交工程', '生成式AI', '系統開發', '技術整合'],
  },
  {
    type: 'award',
    title: '臺灣數創大賞 - 數位+組 - 金獎',
    issuer: '經濟部產業園區管理局 | 臺灣臺中軟體園區發展產學訓聯盟 | 東海大學',
    date: '2024年11月',
    description:
      '以「發票醫生」專案獲獎，透過數位科技創新解決企業發票管理痛點，展現卓越的商業價值。',
    growthIndicators: ['Finctory', '數位創新', '商業應用', '技術實踐'],
  },
  {
    type: 'award',
    title: 'GenAI Stars 生成式 AI 百工百業應用選拔 - 創意創客組 - 優選',
    issuer: '國家科學及技術委員會 | 台北市電腦公會',
    date: '2024年10月',
    description: '開發「GenAI企業金融助手」，運用生成式AI技術優化企業金融服務流程，提升服務效率。',
    growthIndicators: ['生成式AI', '金融科技', '服務創新'],
  },
  {
    type: 'award',
    title: '桃園新創之星 X 創天下競賽 - 科技應用組 - 入圍決賽',
    issuer: '中原大學 | 桃園市政府青年事務局',
    date: '2024年9月',
    description: '「發票醫生」從眾多參賽團隊中脫穎而出進入前10名，展現產品市場價值與發展潛力。',
    growthIndicators: ['Finctory', '創新創業', '市場開發', '商業發展'],
  },
  {
    type: 'award',
    title: '第六屆 Startup 創業競技場競賽 - 第一名',
    issuer: '國立臺灣師範大學 | 教育部',
    date: '2024年6月',
    description: '以「發票醫生」專案參賽，展現創新商業模式與技術方案，獲得評審一致好評。',
    growthIndicators: ['Finctory', '創業規劃', '商業模式', '創新思維'],
  },
  {
    type: 'award',
    title: '桃園青創力學生創業競賽 - 佳作',
    issuer: '龍華科技大學 | 桃園市政府青年事務局',
    date: '2024年6月',
    description: '以「發票醫生」參與競賽，展現青年創業實力，獲得創業輔導資源。',
    growthIndicators: ['Finctory', '創業實踐', '商業規劃', '團隊合作'],
  },
  {
    type: 'award',
    title: '第 7 屆致青春 ‧創未來全國選拔大賽 - 優等獎',
    issuer: '致理科技大學',
    date: '2024年5月',
    description: '「發票醫生」展現青年創新創業能力，以技術解決實際商業問題，展現市場發展潛力。',
    growthIndicators: ['Finctory', '創新應用', '市場分析', '創業實踐'],
  },
  {
    type: 'award',
    title: '中央新創擂台賽 - 優選',
    issuer: '國立中央大學',
    date: '2024年1月',
    description: '「發票醫生」專案在校內創新創業競賽中脫穎而出，獲得創業資源支持。',
    growthIndicators: ['Finctory', '創新研發', '創業規劃', '商業驗證'],
  },
  {
    type: 'award',
    title: '金匠獎程式競賽 Python 組 - 優獎',
    issuer: '巨匠電腦 | 神通資科',
    date: '2023年9月',
    description: '在程式設計競賽中展現優秀的Python程式開發能力。',
    growthIndicators: ['Python', '人工智慧', '程式設計', '問題解決'],
  },
]

// 領導經驗資料，包含類型標記
const leadership = [
  {
    type: 'leadership',
    title: '2024 新生知訊網副執行長',
    organization: '國立中央大學諮商中心',
    period: '2023年10月 - 2024年12月',
    description:
      '帶領企劃、程式、美工和影音四組團隊開發新生資訊平台，負責專案進度管理、品質驗收和技術指導。成功於暑期上線提供新生諮詢、註冊與活動資訊等服務，獲得良好回響。',
    growthIndicators: ['專案管理', '跨部門協調', '技術指導', '使用者體驗'],
  },
  {
    type: 'leadership',
    title: '男九 B 宿舍副舍長',
    organization: '國立中央大學住宿服務組',
    period: '2024年9月 - 2025年6月',
    description:
      '連任宿舍幹部，在熟悉基本營運的基礎上創新宿舍活動形式，結合校內資源提升住宿品質，並帶領團隊共同處理突發狀況，強化危機處理能力。',
    growthIndicators: ['創新規劃', '危機處理', '資源整合', '團隊領導'],
  },
  {
    type: 'leadership',
    title: 'United Developer Club 資訊社群副召集人',
    organization: '國立中央大學教學發展中心',
    period: '2023年9月 - 2023年12月',
    description:
      '共同創立 UDC 並擔任副召集人，開設「從零開始的 Python 專案」課程，採用專案導向式教學。促進跨社群合作，規劃工作坊與沙龍講座，建立整合性技術學習平台，協助同學完成實際專案開發。',
    growthIndicators: ['技術教學', '社群營運', '資源整合', '課程規劃'],
  },
  {
    type: 'leadership',
    title: '男九 A 宿舍副舍長',
    organization: '國立中央大學住宿服務組',
    period: '2023年9月 - 2024年6月',
    description:
      '負責住宿環境管理、同儕關係協調和活動規劃，培養組織與溝通能力，建立完善的宿舍管理制度。',
    growthIndicators: ['組織管理', '溝通協調', '活動規劃', '預算管理'],
  },
]

// 新增社團或課外活動資料
const activities = [
  {
    type: 'activity',
    title: 'SAP Student Team - S/4HANA & Basis 成員',
    organization: '國立中央大學 ERP 中心',
    period: '2022年10月 - 2024年2月',
    description:
      '大一加入 SAP Hana & Basis 學生團隊，透過第一年學習、第二年教學傳承的模式，深入學習企業資源規劃系統。在學習期間專注於 SAP HANA 資料庫管理與系統維護，並於大一暑期擔任 ERP 中心特約講師，負責課程教材準備與授課，從學習者轉變為教學者的角色轉換提升了系統架構理解與教學能力。',
    growthIndicators: ['ERP系統架構', '資料庫管理', '系統維護', '教學技巧', '知識傳承'],
  },
]

// 根據過濾器顯示項目
const filteredItems = computed(() => {
  let items = []
  if (activeFilter.value === 'all') {
    items = [...awards, ...leadership, ...activities]
  } else {
    items = [...awards, ...leadership, ...activities].filter(
      (item) => item.type === activeFilter.value
    )
  }

  // 將日期字串轉換為時間戳記進行排序
  return items.sort((a, b) => {
    const getTimestamp = (item) => {
      // 處理 date 或 period 格式
      const dateStr = item.date || item.period.split(' - ')[0]
      // 將中文年月格式轉換為 YYYY-MM 格式
      const [year, month] = dateStr.match(/(\d{4})年(\d{1,2})月/).slice(1)
      return new Date(`${year}-${month.padStart(2, '0')}`).getTime()
    }

    return getTimestamp(b) - getTimestamp(a) // 降序排列（最新的在前）
  })
})

// 更新過濾器 - 優化版本，不需要重置可見性和觀察器
const updateFilter = (value) => {
  activeFilter.value = value
}

// 下載履歷函數
const downloadResume = () => {
  // 開啟存放在 public 資料夾的 PDF 檔案
  window.open('/content/Ju-Shen Huang CV.pdf', '_blank', 'noopener,noreferrer')
}

// 滾動函數 - 直接實現
const scrollToSection = (sectionId, event) => {
  // 防止默認行為
  if (event) event.preventDefault()

  //   console.log(`嘗試滾動到元素、: #${sectionId}`)

  // 強制更新URL哈希
  window.location.hash = sectionId

  // 延遲執行滾動，確保哈希已經更新
  setTimeout(() => {
    // 嘗試使用瀏覽器原生方法定位元素
    const element = document.getElementById(sectionId)
    if (element) {
      //   console.log(`找到元素 #${sectionId}，執行滾動`)

      try {
        // 計算元素位置
        const offset = 100
        const top = element.getBoundingClientRect().top + window.scrollY - offset

        // 嘗試多種滾動方法
        // 方法1: scrollIntoView
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })

        // 方法2: 延遲後使用window.scrollTo
        setTimeout(() => {
          window.scrollTo({
            top: top,
            behavior: 'smooth',
          })
        }, 100)

        // 方法3: 如果jQuery可用，也用它嘗試
        if (window.$ && window.jQuery) {
          //   console.log('使用jQuery滾動')
          window.$('html, body').animate({ scrollTop: top }, 800)
        }
      } catch (error) {
        console.error('滾動出現錯誤:', error)

        // 最終回退: 直接跳轉
        window.scrollTo(0, element.offsetTop - 100)
      }
    } else {
      console.error(`無法找到ID為 ${sectionId} 的元素`)
    }
  }, 100)
}

// 滾動到頂部 - 直接實現
const scrollToTop = (event) => {
  // 防止默認行為
  if (event) event.preventDefault()

  //   console.log('嘗試滾動到頂部')

  // 清除URL哈希
  if (window.location.hash) {
    history.pushState('', document.title, window.location.pathname)
  }

  // 嘗試多種方法滾動到頂部
  try {
    // 方法1: 使用window.scrollTo
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    // 方法2: 如果jQuery可用
    if (window.$ && window.jQuery) {
      //   console.log('使用jQuery滾動到頂部')
      window.$('html, body').animate({ scrollTop: 0 }, 800)
    }
  } catch (error) {
    console.error('滾動出現錯誤:', error)

    // 直接跳轉
    window.scrollTo(0, 0)
  }
}

// 檢查滾動位置，顯示/隱藏回到頂部按鈕
const checkScrollPosition = () => {
  showBackToTop.value = window.scrollY > 300
}

// 生命週期鉤子
onMounted(() => {
  window.addEventListener('scroll', checkScrollPosition)
  checkScrollPosition()

  //   console.log('頁面掛載完成，檢查初始哈希')

  // 檢查哈希並延遲滾動
  const checkAndScrollToHash = () => {
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1)
      //   console.log(`檢測到初始哈希: #${sectionId}，準備滾動`)

      // 確保使用延遲以等待DOM完全渲染
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          //   console.log(`找到元素 #${sectionId}，執行滾動`)

          // 直接使用元素的scrollIntoView方法
          try {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })

            // 再次嘗試確保滾動到正確位置
            setTimeout(() => {
              const top = element.getBoundingClientRect().top + window.scrollY - 100
              window.scrollTo({ top, behavior: 'smooth' })
            }, 100)
          } catch (error) {
            console.error('滾動失敗:', error)
            // 直接設置滾動位置
            window.scrollTo(0, element.offsetTop - 100)
          }
        } else {
          console.error(`無法找到ID為 ${sectionId} 的元素`)
        }
      }, 500) // 給予足夠的時間讓DOM渲染
    }
  }

  // 如果jQuery不存在，加載它
  if (typeof window !== 'undefined' && !window.jQuery && !window.$) {
    // console.log('加載jQuery')
    const script = document.createElement('script')
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js'
    script.integrity = 'sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4='
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      //   console.log('jQuery加載完成')
      checkAndScrollToHash()
    }
    document.head.appendChild(script)
  } else {
    // jQuery已存在，直接檢查哈希
    // console.log('jQuery已存在，直接檢查哈希')
    checkAndScrollToHash()
  }

  // 監聽哈希變化
  window.addEventListener('hashchange', handleHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', checkScrollPosition)
  // 移除哈希變化監聽器
  window.removeEventListener('hashchange', handleHashChange)
})

// 處理哈希變化事件 - 更新以匹配新的滾動函數邏輯
const handleHashChange = () => {
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1)
    // console.log(`哈希變化: #${sectionId}`)

    // 確保使用非event版本
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        // console.log(`找到元素 #${sectionId}，執行滾動`)

        try {
          // 嘗試多種滾動方法
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })

          setTimeout(() => {
            const top = element.getBoundingClientRect().top + window.scrollY - 100
            window.scrollTo({ top, behavior: 'smooth' })

            if (window.$ && window.jQuery) {
              window.$('html, body').animate({ scrollTop: top }, 800)
            }
          }, 100)
        } catch (error) {
          console.error('滾動失敗:', error)
          window.scrollTo(0, element.offsetTop - 100)
        }
      }
    }, 100)
  }
}
</script>

<style scoped>
/* 重設基本容器樣式 */
.resume-container {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem;
  margin: 0 auto;
  overflow: visible;
  position: relative;
  z-index: 1;
}

@media (min-width: 640px) {
  .resume-container {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .resume-container {
    padding: 2rem;
  }
}

.resume-content {
  width: 100%;
  max-width: 100%;
  overflow: visible;
  position: relative;
}

/* 滾動優化 */
html {
  scroll-behavior: smooth !important;
}

/* 清除所有可能影響滾動的限制 */
html,
body,
#__nuxt,
#__layout,
.resume-container,
.resume-content {
  overflow-x: hidden;
  overflow-y: visible !important;
}

/* 目標元素樣式優化 */
#experience,
#education,
#research,
#achievements {
  scroll-margin-top: 60px;
  position: relative;
  padding-top: 15px;
  margin-top: -5px;
  z-index: 10;
  display: block;
  width: 100%;
}

@media (min-width: 640px) {
  #experience,
  #education,
  #research,
  #achievements {
    scroll-margin-top: 100px;
    padding-top: 25px;
    margin-top: -8px;
  }
}

@media (min-width: 1024px) {
  #experience,
  #education,
  #research,
  #achievements {
    scroll-margin-top: 120px;
    padding-top: 30px;
    margin-top: -10px;
  }
}

/* 確保標題與圖標在同一行並修復排版 */
#experience,
#education,
#research,
#achievements {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 0.5rem !important;
  justify-content: flex-start !important;
  flex-wrap: nowrap !important;
}

@media (min-width: 640px) {
  #experience,
  #education,
  #research,
  #achievements {
    gap: 0.75rem !important;
  }
}

@media (min-width: 1024px) {
  #experience,
  #education,
  #research,
  #achievements {
    gap: 1rem !important;
  }
}

#experience span,
#education span,
#research span,
#achievements span {
  flex-shrink: 0 !important;
}

#experience h2,
#education h2,
#research h2,
#achievements h2 {
  margin: 0 !important;
  white-space: nowrap !important;
  font-size: 0.875rem !important;
}

@media (min-width: 640px) {
  #experience h2,
  #education h2,
  #research h2,
  #achievements h2 {
    font-size: 1.125rem !important;
  }
}

@media (min-width: 1024px) {
  #experience h2,
  #education h2,
  #research h2,
  #achievements h2 {
    font-size: 1.25rem !important;
  }
}

/* 滾動容器樣式重置 */
.achievements-container {
  overflow: visible;
}

/* 移動端適配 */
@media (max-width: 639px) {
  .timeline-item {
    margin-bottom: 1.5rem;
  }

  .timeline-item h4 {
    line-height: 1.4;
  }
}

/* 確保分頁符合理 */
#experience,
#education,
#research,
#achievements {
  page-break-before: always;
}

/* 確保列印樣式正確 */
@media print {
  .resume-container {
    padding: 0;
    overflow: visible;
  }

  body {
    background-color: white !important;
    color: black !important;
  }

  a {
    text-decoration: none !important;
    color: black !important;
  }

  .fixed,
  button {
    display: none !important;
  }

  .rounded-\[24px\] {
    border-radius: 0 !important;
    box-shadow: none !important;
    background-color: white !important;
  }

  .p-8 {
    padding: 0.5cm !important;
  }

  /* 確保在打印時保持適當的區塊分頁 */
  #experience,
  #education,
  #research,
  #achievements {
    page-break-before: always;
    margin-top: 1cm !important;
  }

  /* 調整在打印時的顏色，確保可讀性 */
  .text-yellow-400,
  .text-blue-400,
  .text-green-400 {
    color: #333 !important;
    font-weight: bold !important;
  }
}
</style>
