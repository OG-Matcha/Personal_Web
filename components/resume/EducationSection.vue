<!-- EducationSection.vue -->
<template>
  <section class="mb-6 sm:mb-8 lg:mb-12">
    <div
      class="overflow-hidden rounded-[16px] bg-[#1A1A1A] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300 hover:shadow-[inset_0_0_25px_rgba(0,0,0,0.3)] sm:rounded-[20px] sm:p-6 lg:rounded-[24px] lg:p-8"
    >
      <div class="relative">
        <!-- 時間線 -->
        <div
          class="absolute left-0 ml-[7px] h-full border-l-2 border-[#333333] sm:ml-[8px] lg:ml-[9px]"
        ></div>

        <!-- 教育經歷項目 -->
        <div
          v-for="(edu, index) in education"
          :key="index"
          class="group relative mb-6 sm:mb-8 lg:mb-10"
        >
          <!-- 時間線指示器 -->
          <div
            class="border-3 absolute left-0 z-10 -ml-[1px] h-[14px] w-[14px] rounded-full border-[#1A1A1A] bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] sm:h-[16px] sm:w-[16px] sm:border-4 lg:h-[18px] lg:w-[18px]"
          ></div>

          <div
            class="ml-7 transition-transform duration-300 group-hover:translate-x-1 sm:ml-9 lg:ml-12"
          >
            <!-- 學校與地點 -->
            <div
              class="mb-1 flex flex-col gap-1 sm:mb-2 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2"
            >
              <h4
                class="text-base font-bold text-white transition-colors duration-300 group-hover:text-yellow-400 sm:text-lg lg:text-xl"
              >
                {{ edu.school }}
              </h4>
              <div class="flex items-center text-xs text-gray-400 sm:text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-1 h-3.5 w-3.5 text-yellow-400/70 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {{ edu.location }}
              </div>
            </div>

            <!-- 學位與時間 -->
            <div
              class="mb-2 flex flex-col gap-1 sm:mb-3 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2 lg:mb-4"
            >
              <p class="text-sm font-medium text-yellow-400 sm:text-base">{{ edu.degree }}</p>
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
                {{ edu.period }}
              </div>
            </div>

            <!-- 學歷描述 -->
            <ul class="space-y-1 sm:space-y-1.5 lg:space-y-2">
              <li
                v-for="(item, i) in edu.description"
                :key="i"
                class="text-xs text-gray-300 transition-all duration-300 group-hover:text-gray-200 sm:text-sm lg:text-base"
              >
                <span class="mr-2 text-yellow-400/80">•</span>{{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const education = [
  {
    school: '國立中央大學',
    degree: '資訊管理學系 學士',
    location: '桃園, 台灣',
    period: '2022年9月 - 2026年6月（預計）',
    description: [
      'GPA: 4.19 / 4.3',
      '113 學年度第 2 學期學業成績優良書卷獎（學期班級前 5 % 【2/47】）',
      '112 學年度管理學院院長獎（學年班級前 5 名）',
      '112 學年度第 2 學期優秀學生（每學期系推派 2 名）',
      '相關課程：系統分析與設計、網頁程式設計、資料庫管理、資料檔案與結構、演算法',
    ],
  },
]
</script>

<style scoped>
/* 自定義樣式 */
</style>
