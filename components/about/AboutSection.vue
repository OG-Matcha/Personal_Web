<!-- AboutSection.vue -->
<template>
  <section class="relative mb-12">
    <section-title>關於我</section-title>

    <!-- 六邊形背景裝飾 -->
    <div class="absolute inset-0 z-0 overflow-hidden opacity-5">
      <div
        v-for="(hexagon, i) in hexagons"
        :key="i"
        class="hexagon animate-float absolute"
        :style="hexagon"
      ></div>
    </div>

    <div
      class="relative z-10 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] sm:p-10"
    >
      <!-- 引言區塊 -->
      <div class="mb-8 border-l-4 border-yellow-400 py-2 pl-4">
        <p class="text-xl font-light italic text-gray-300 sm:text-2xl">
          " 程式碼是我的畫筆，技術是我的顏料，網路世界是我的畫布。 "
        </p>
      </div>

      <!-- 多重身份展示 -->
      <div class="mb-8 flex flex-wrap items-center">
        <span class="mr-2 text-lg font-medium text-white sm:text-xl">我是</span>
        <type-writer
          :texts="['Web 全端開發者', 'AI 應用專家', 'SaaS 創業家', '技術創新者', '六邊形戰士']"
          text-class="text-gradient bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 text-lg font-bold sm:text-xl"
          :speed="80"
          :delete-speed="40"
          :wait-time="1800"
        />
      </div>

      <!-- 自傳內容 -->
      <div class="space-y-5">
        <p class="leading-relaxed text-gray-300">
          <span class="text-lg font-bold text-white"
            >黃鉅燊，中央大學資管系 🎓 的全端開發者 💻，以「六邊形戰士」💪
            自詡，持續進化於資訊科技與人工智慧 🤖 的浪潮中。</span
          >
        </p>

        <p class="leading-relaxed text-gray-300">
          我的技術歷程橫跨<span class="font-medium text-yellow-400">前後端</span> 🌐、<span
            class="font-medium text-blue-400"
            >資料科學</span
          >
          📊 及<span class="font-medium text-green-400">系統整合</span>
          🔗，擅長融會貫通多元技術，將<span class="font-medium text-purple-400">創新思維</span> ✨
          落地為實際應用。我的競爭力，源於<span
            class="underline decoration-yellow-400 decoration-2 underline-offset-4"
            >技術廣度與整合深度的完美結合</span
          >。
        </p>

        <p class="leading-relaxed text-gray-300">
          展望未來，我將專注於 <span class="font-medium text-red-400">AI 驅動</span> 🚀 的互動式 Web
          應用開發 📱，致力於創造兼具<span class="font-medium text-yellow-400">科技前瞻性</span
          >與<span class="font-medium text-blue-400">人性化體驗</span> 😊
          的數位產品，讓技術真正成為<span
            class="underline decoration-green-400 decoration-2 underline-offset-4"
            >改善生活的驅動力</span
          >
          🌱。
        </p>
      </div>

      <!-- 技術關鍵詞標籤 -->
      <div class="mt-8 flex flex-wrap gap-2">
        <span
          v-for="(tag, index) in techTags"
          :key="index"
          class="inline-block transform rounded-full px-3 py-1 text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
          :class="tagColors[index % tagColors.length]"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SectionTitle from '../common/SectionTitle.vue'
import TypeWriter from '../common/TypeWriter.vue'

// 六邊形樣式數據
const hexagons = ref([])

// 在客戶端生成六邊形樣式
onMounted(() => {
  hexagons.value = Array.from({ length: 20 }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    transform: `scale(${0.5 + Math.random() * 1.5}) rotate(${Math.random() * 360}deg)`,
    opacity: 0.1 + Math.random() * 0.4,
    animationDelay: `${Math.random() * 2}s`,
  }))
})

// 技術關鍵詞標籤
const techTags = ['全端開發', '資料科學', '系統設計', 'UI/UX', '人工智慧', '生成式AI', '創新思維']

// 標籤顏色循環（加入 hover 效果）
const tagColors = [
  'bg-yellow-500/20 text-yellow-300',
  'bg-blue-500/20 text-blue-300',
  'bg-green-500/20 text-green-300',
  'bg-purple-500/20 text-purple-300',
  'bg-red-500/20 text-red-300',
  'bg-indigo-500/20 text-indigo-300',
  'bg-pink-500/20 text-pink-300',
  'bg-teal-500/20 text-teal-300',
]
</script>

<style scoped>
/* 六邊形背景元素 */
.hexagon {
  width: 100px;
  height: 60px;
  background-color: #ffffff;
  position: relative;
  transform-origin: center;
}

.hexagon:before,
.hexagon:after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
}

.hexagon:before {
  bottom: 100%;
  border-bottom: 30px solid #ffffff;
}

.hexagon:after {
  top: 100%;
  border-top: 30px solid #ffffff;
}

/* 漂浮動畫 */
@keyframes float {
  0% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* 漸層文字效果 */
.text-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 200% auto;
  animation: gradient 3s linear infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
