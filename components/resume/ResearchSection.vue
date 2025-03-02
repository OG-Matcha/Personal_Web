<!-- ResearchSection.vue -->
<template>
  <div
    class="overflow-hidden rounded-[16px] bg-[#1A1A1A] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:shadow-[inset_0_0_25px_rgba(0,0,0,0.3)] sm:rounded-[20px] sm:p-6 lg:rounded-[24px] lg:p-8"
  >
    <div class="relative">
      <!-- 時間線 -->
      <div
        class="absolute left-0 ml-[7px] h-full border-l-2 border-[#333333] sm:ml-[8px] lg:ml-[9px]"
      ></div>

      <TransitionGroup name="items-fade" tag="div" class="research-container" mode="out-in">
        <!-- 研究項目 -->
        <div
          v-for="(item, index) in research"
          :key="item.title"
          class="timeline-item group relative mb-6 sm:mb-8 lg:mb-10"
        >
          <!-- 時間線指示器 -->
          <div
            class="border-3 absolute left-0 z-10 -ml-[1px] h-[14px] w-[14px] rounded-full border-[#1A1A1A] bg-purple-400 shadow-[0_0_10px_rgba(167,139,250,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(167,139,250,0.4)] sm:h-[16px] sm:w-[16px] sm:border-4 lg:h-[18px] lg:w-[18px]"
            :class="{ 'animate-pulse': activePulse === index }"
            @mouseenter="activePulse = index"
            @mouseleave="activePulse = null"
          ></div>

          <div
            class="ml-7 transform transition-all duration-500 group-hover:translate-x-1 sm:ml-9 lg:ml-12"
          >
            <div class="mb-1 flex flex-wrap items-start sm:mb-2">
              <!-- 研究標籤 -->
              <span
                class="mr-2 mt-1 rounded-full bg-purple-400/20 px-2 py-0.5 text-xs font-semibold text-purple-400 sm:mr-3 sm:px-3 sm:py-1"
              >
                研究
              </span>

              <div
                class="flex w-full flex-grow flex-col gap-1 sm:w-auto sm:flex-row sm:justify-between sm:gap-2"
              >
                <h4
                  class="text-base font-bold text-white transition-colors duration-300 group-hover:text-purple-400 sm:text-lg lg:text-xl"
                >
                  {{ item.title }}
                </h4>
                <div class="flex items-center text-xs text-gray-400 sm:text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
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
                  {{ item.period }}
                </div>
              </div>
            </div>

            <div class="mb-1 text-xs text-gray-400 sm:mb-2 sm:text-sm">
              <span class="font-semibold text-purple-400">{{ item.institution }}</span>
              <span v-if="item.supervisor" class="ml-2"> | 指導教授：{{ item.supervisor }} </span>
            </div>

            <p class="mb-2 text-xs text-gray-300 sm:mb-3 sm:text-sm lg:mb-4 lg:text-base">
              {{ item.description }}
            </p>

            <!-- 研究方法 -->
            <div class="mb-2 sm:mb-3">
              <h5 class="mb-1 text-xs font-semibold text-purple-400 sm:mb-2 sm:text-sm">
                研究方法：
              </h5>
              <p class="text-xs text-gray-300 sm:text-sm">{{ item.methodology }}</p>
            </div>

            <!-- 研究成果 -->
            <div class="mb-2 sm:mb-3">
              <h5 class="mb-1 text-xs font-semibold text-purple-400 sm:mb-2 sm:text-sm">
                研究成果：
              </h5>
              <p class="text-xs text-gray-300 sm:text-sm">{{ item.outcomes }}</p>
            </div>

            <!-- 發表論文 -->
            <div v-if="item.publications && item.publications.length > 0" class="mb-2 sm:mb-3">
              <h5 class="mb-1 text-xs font-semibold text-purple-400 sm:mb-2 sm:text-sm">
                相關發表：
              </h5>
              <ul class="list-inside list-disc text-xs text-gray-300 sm:text-sm">
                <li v-for="pub in item.publications" :key="pub">{{ pub }}</li>
              </ul>
            </div>

            <!-- 關鍵詞和研究領域 -->
            <div class="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              <span
                v-for="keyword in item.keywords"
                :key="keyword"
                class="rounded-full bg-purple-400/10 px-2 py-0.5 text-[10px] text-purple-400 transition-all duration-300 hover:bg-purple-400/20 sm:px-3 sm:py-1 sm:text-xs"
              >
                {{ keyword }}
              </span>
              <span
                v-for="area in item.researchAreas"
                :key="area"
                class="rounded-full bg-purple-400/10 px-2 py-0.5 text-[10px] text-purple-400 transition-all duration-300 hover:bg-purple-400/20 sm:px-3 sm:py-1 sm:text-xs"
              >
                {{ area }}
              </span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 範例研究數據
const research = [
  {
    type: 'research',
    title: '基於知識圖譜與大型語言模型的學習軌跡分析研究',
    institution: '國立中央大學通識教育中心',
    period: '2024年8月 - 2024年10月',
    supervisor: '張家凱 教授',
    description:
      '研究利用知識圖譜與大型語言模型（LLM）分析學生的學習軌跡，解決傳統評測工具在課程內容覆蓋不足的問題，提升學習評估的準確性。',
    methodology:
      '透過LLM將學習材料轉換為結構化數據，構建個人化的知識圖譜，並結合學生的測驗數據分析學習進度。此外，應用Chain-of-Thought (COT) 提示工程方法，確保學習軌跡的準確映射。',
    outcomes:
      '成功識別考試範圍中的知識覆蓋漏洞，提高學習評估的準確性，並幫助教師針對學生學習瓶頸提供即時指導。該系統已在台灣某國立大學的Python程式設計課程中進行測試。',
    publications: ['「運用知識圖譜與大型語言模型分析學習軌跡」，LAK 2025國際學習分析與知識會議'],
    keywords: ['學習軌跡', '知識圖譜', '大型語言模型'],
    researchAreas: ['教育科技', '人工智慧', '學習分析'],
  },
  {
    type: 'research',
    title: '探討生成式 AI 於社交工程之發展應用',
    institution: '國立中央大學資訊管理學系',
    period: '2024年7月 - 2025年2月',
    supervisor: '胡雅涵 教授',
    description:
      '探討生成式 AI 在社交工程攻擊中的應用，特別是如何利用大型語言模型（LLM）自動生成釣魚郵件、偽造網站及社交工程攻擊模擬系統，以提升企業內部資安防禦意識與演練機制。透過結合 AI 自動化技術，提供更具真實感的社交工程測試，讓企業能更有效應對詐騙與資安風險。',
    methodology:
      '研究採用 Vue.js 3 開發前端，FastAPI 為後端，資料庫使用 PostgreSQL 和 Redis。系統結合 Gemini 生成式 AI 與 LangChain 框架，用於自動生成釣魚郵件與網站，並透過 AWS ECS 及 CI/CD 技術部署雲端模擬測試環境。此外，系統整合 SendinBlue SMTP 伺服器發送釣魚郵件，並記錄受測者行為，以分析資安意識與應對能力。',
    outcomes:
      '成功開發企業級社交工程攻擊模擬平台，能生成個人化釣魚郵件與仿冒網站，提高資安訓練的真實性與有效性。透過自動化攻擊演練與行為分析，協助企業強化資安意識，減少社交工程攻擊風險。',
    publications: ['「探討生成式 AI 於社交工程之發展應用」，113 國科會大專學生研究計畫'],
    keywords: ['生成式 AI', 'LLM', '社交工程', '網路釣魚', '資安演練'],
    researchAreas: ['網路安全', '人工智慧'],
  },
  {
    type: 'research',
    title: '結合股市異常現象指標及生成式 AI 之股票追蹤系統',
    institution: '國立中央大學資訊管理學系',
    period: '2024年7月 - 2025年2月',
    supervisor: '邱信瑜 教授',
    description:
      '探討如何將股市異常現象指標與生成式 AI 結合，開發一款股票追蹤系統，以提高投資報告的準確性與效率。透過生成式 AI，投資人與經紀人能夠快速獲取深入的投資分析，並在股市中做出更精準的決策。',
    methodology:
      '透過異常現象指標分析股票市場趨勢，並運用生成式 AI 自動生成投資報告。前端以 Flutter 跨平台開發，後端採用 Firebase 雲端平台，並結合 LangChain 框架與 ChatGPT 進行自然語言處理。技術分析指標則透過 TwStock、Pandas-TA 等工具進行計算與視覺化分析。',
    outcomes:
      '成功開發出一款結合異常現象指標與生成式 AI 的股票追蹤系統，提升投資報告的自動化程度與準確性。透過周頻率投資策略評估系統的實用性，為投資人提供更即時的決策依據。',
    publications: [
      '「結合股市異常現象指標及生成式 AI 之股票追蹤系統」，113 國科會大專學生研究計畫',
    ],
    keywords: ['異常現象指標', '機器學習', '生成式 AI', '股票追蹤'],
    researchAreas: ['金融科技', '人工智慧', '投資分析'],
  },
]

// 用於控制時間線指示器的動畫
const activePulse = ref<number | null>(null)
</script>

<style scoped>
.items-fade-move,
.items-fade-enter-active,
.items-fade-leave-active {
  transition: all 0.5s ease;
}

.items-fade-enter-from,
.items-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.items-fade-leave-active {
  position: absolute;
}
</style>
