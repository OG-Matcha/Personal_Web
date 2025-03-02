<!-- HexagonSkillNetwork.vue -->
<template>
  <div class="hexagon-skill-network">
    <h3 class="mb-12 text-center text-2xl font-bold">六邊形技能網絡</h3>

    <!-- 網絡容器 -->
    <div class="network-container">
      <!-- 連接線 SVG -->
      <svg class="connections" width="100%" height="100%" viewBox="0 0 800 800">
        <!-- 從中心到每個主要技能的連接線 -->
        <g class="connection-lines">
          <path
            v-for="skill in skillsData.skills"
            :key="`line-${skill.id}`"
            :class="{
              'connection-line': true,
              highlight: activeSkill === skill.id || highlightedSkill === skill.id,
            }"
            :d="getConnectionPath(skill.position)"
          />
        </g>

        <!-- 子技能連接線 (當某個技能被激活時顯示) -->
        <g class="sub-connection-lines" v-if="activeSkill">
          <template v-for="skill in skillsData.skills" :key="`sublines-${skill.id}`">
            <path
              v-if="skill.id === activeSkill && skill.subSkills && skill.subSkills.length > 0"
              v-for="(_, index) in skill.subSkills"
              :key="`subline-${index}`"
              class="sub-connection-line"
              :d="getSubConnectionPath(skill.position, index, skill.subSkills.length)"
            />
          </template>
        </g>
      </svg>

      <!-- 中心核心六邊形 -->
      <div class="core-hexagon">
        <hexagon-item
          :skill="skillsData.core"
          :is-core="true"
          :is-active="!activeSkill"
          @activate="resetActive"
        />
      </div>

      <!-- 主要技能六邊形 -->
      <hexagon-item
        v-for="skill in skillsData.skills"
        :key="skill.id"
        :skill="skill"
        :is-active="activeSkill === skill.id"
        :is-highlight="highlightedSkill === skill.id"
        :style="getPositionStyle(skill.position)"
        @activate="setActiveSkill"
        @deactivate="resetActive"
        @hover="setHighlightedSkill"
        @leave="resetHighlight"
      />
    </div>

    <!-- 技能描述區域 -->
    <div
      class="skill-details mt-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-lg"
    >
      <template v-if="activeSkill">
        <h4
          class="mb-2 text-xl font-bold"
          v-for="skill in skillsData.skills"
          :key="`detail-${skill.id}`"
          v-show="skill.id === activeSkill"
        >
          {{ skill.title }}
          <span class="ml-2 text-3xl">{{ skill.icon }}</span>
        </h4>
        <p
          class="mb-4 text-gray-200"
          v-for="skill in skillsData.skills"
          :key="`desc-${skill.id}`"
          v-show="skill.id === activeSkill"
        >
          {{ skill.description }}
        </p>
        <div
          class="mt-4 flex flex-wrap gap-2"
          v-for="skill in skillsData.skills"
          :key="`skills-${skill.id}`"
          v-show="skill.id === activeSkill"
        >
          <span
            v-for="(subSkill, i) in skill.subSkills"
            :key="`tag-${i}`"
            class="rounded-full px-3 py-1 text-sm font-medium"
            :style="{
              background: getSubSkillBgColor(skill, 0.2),
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 3px rgba(0,0,0,0.1)',
            }"
          >
            {{ subSkill }}
          </span>
        </div>
      </template>
      <template v-else>
        <h4 class="mb-2 text-xl font-bold">
          {{ skillsData.core.title }}
          <span class="ml-2 text-3xl">{{ skillsData.core.icon }}</span>
        </h4>
        <p class="mb-2 italic text-gray-400">{{ skillsData.core.subtitle }}</p>
        <p class="text-gray-200">{{ skillsData.core.description }}</p>
        <p class="mt-4 text-gray-400">點擊任一技能六邊形查看詳細資訊</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import HexagonItem from './HexagonItem.vue'

// 活躍與高亮技能狀態
const activeSkill = ref(null)
const highlightedSkill = ref(null)

// 技能數據
const skillsData = reactive({
  // 中心核心技能
  core: {
    title: '六邊形戰士',
    subtitle: '全端開發者',
    description:
      '融會貫通多元技術，將創新思維落地為實際應用。競爭力源於技術廣度與整合深度的完美結合。',
    icon: '💪',
    color: 'linear-gradient(135deg, #7c3aed, #6366f1)',
  },

  // 主要技能類別
  skills: [
    {
      id: 'frontend',
      title: '前端開發',
      icon: '🌐',
      color: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      position: 'top',
      description: '創建互動性強、反應靈敏的用戶界面，專注於現代網頁與應用的視覺呈現與使用者體驗。',
      subSkills: ['Vue.js', 'Nuxt.js', 'Tailwind CSS'],
    },
    {
      id: 'backend',
      title: '後端開發',
      icon: '⚙️',
      color: 'linear-gradient(135deg, #10b981, #34d399)',
      position: 'top-right',
      description: '構建高效、安全的後端服務與API，確保系統穩定運行並支持前端功能。',
      subSkills: ['Node.js', 'Express', 'FastAPI', 'GraphQL', 'RESTful API'],
    },
    {
      id: 'devops',
      title: 'DevOps',
      icon: '🔄',
      color: 'linear-gradient(135deg, #ec4899, #f472b6)',
      position: 'bottom-right',
      description: '整合開發與運維，建立自動化流程，確保應用程式的開發、測試和部署高效進行。',
      subSkills: ['Docker', 'CI/CD', 'Heroku', 'GCP', 'Linux', 'Git'],
    },
    {
      id: 'database',
      title: '資料庫',
      icon: '💾',
      color: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      position: 'bottom',
      description: '設計與優化資料庫結構，確保數據安全性、一致性和高效的查詢效能。',
      subSkills: ['SQL', 'MongoDB', 'Redis', 'PostgreSQL', '數據建模'],
    },
    {
      id: 'ai',
      title: '人工智慧',
      icon: '🤖',
      color: 'linear-gradient(135deg, #ef4444, #f87171)',
      position: 'bottom-left',
      description: '應用機器學習與自然語言處理技術，為產品增添智能化功能，提升用戶體驗。',
      subSkills: ['LangChain', 'LangGraph', 'Pytorch', 'TensorFlow', 'Scikit-learn'],
    },
    {
      id: 'design',
      title: 'UI/UX 設計',
      icon: '🎨',
      color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      position: 'top-left',
      description: '創造直觀且美觀的使用者介面，以用戶為中心的設計思維，優化整體使用體驗。',
      subSkills: ['Figma', '使用者研究', '互動設計', '原型設計', '視覺設計'],
    },
  ],
})

// 設置活躍技能
function setActiveSkill(skillId) {
  activeSkill.value = skillId
  highlightedSkill.value = null
}

// 重置活躍技能
function resetActive() {
  activeSkill.value = null
}

// 設置高亮技能
function setHighlightedSkill(skillId) {
  if (!activeSkill.value) {
    highlightedSkill.value = skillId
  }
}

// 重置高亮
function resetHighlight() {
  highlightedSkill.value = null
}

// 獲取技能位置樣式
function getPositionStyle(position) {
  const positions = {
    top: { top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
    'top-right': { top: '25%', right: '0%', transform: 'translate(0, -50%)' },
    'bottom-right': { bottom: '25%', right: '0%', transform: 'translate(0, 50%)' },
    bottom: { bottom: '0%', left: '50%', transform: 'translate(-50%, 0)' },
    'bottom-left': { bottom: '25%', left: '0%', transform: 'translate(0, 50%)' },
    'top-left': { top: '25%', left: '0%', transform: 'translate(0, -50%)' },
  }

  return {
    position: 'absolute',
    ...positions[position],
  }
}

// 獲取連接線路徑
function getConnectionPath(position) {
  const center = { x: 400, y: 400 }
  let target = { x: 400, y: 400 }

  switch (position) {
    case 'top':
      target = { x: 400, y: 150 }
      break
    case 'top-right':
      target = { x: 600, y: 250 }
      break
    case 'bottom-right':
      target = { x: 600, y: 550 }
      break
    case 'bottom':
      target = { x: 400, y: 650 }
      break
    case 'bottom-left':
      target = { x: 200, y: 550 }
      break
    case 'top-left':
      target = { x: 200, y: 250 }
      break
  }

  return `M${center.x},${center.y} L${target.x},${target.y}`
}

// 獲取子技能連接線路徑
function getSubConnectionPath(position, index, total) {
  let origin = { x: 400, y: 400 }

  // 根據主技能位置確定起點
  switch (position) {
    case 'top':
      origin = { x: 400, y: 150 }
      break
    case 'top-right':
      origin = { x: 600, y: 250 }
      break
    case 'bottom-right':
      origin = { x: 600, y: 550 }
      break
    case 'bottom':
      origin = { x: 400, y: 650 }
      break
    case 'bottom-left':
      origin = { x: 200, y: 550 }
      break
    case 'top-left':
      origin = { x: 200, y: 250 }
      break
  }

  // 計算子技能的角度和位置
  const angle = index * (360 / total) * (Math.PI / 180)
  const distance = 70
  const target = {
    x: origin.x + Math.sin(angle) * distance,
    y: origin.y - Math.cos(angle) * distance,
  }

  return `M${origin.x},${origin.y} L${target.x},${target.y}`
}

// 獲取子技能背景顏色
function getSubSkillBgColor(skill, opacity = 1) {
  // 從漸變色中提取一個顏色，並增加透明度
  let color = skill.color.includes('gradient')
    ? skill.color.match(/#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)/gi)[0]
    : skill.color

  // 轉換為 rgba 格式以增加透明度
  if (color.startsWith('#')) {
    // 將 hex 轉換為 rgb 值
    let r, g, b
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16)
      g = parseInt(color[2] + color[2], 16)
      b = parseInt(color[3] + color[3], 16)
    } else {
      r = parseInt(color.substring(1, 3), 16)
      g = parseInt(color.substring(3, 5), 16)
      b = parseInt(color.substring(5, 7), 16)
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return color
}
</script>

<style scoped>
.hexagon-skill-network {
  margin: 2rem 0 4rem;
}

.network-container {
  position: relative;
  width: 100%;
  height: 500px;
  margin: 0 auto;
  max-width: 700px;
}

.core-hexagon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

/* 連接線樣式 */
.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.connection-line {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2;
  transition: all 0.3s ease;
}

.connection-line.highlight {
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.sub-connection-line {
  stroke: rgba(255, 255, 255, 0.4);
  stroke-width: 1.5;
  stroke-dasharray: 5;
  animation: dashOffset 30s linear infinite;
}

.skill-details {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.2),
    inset 0 0 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .network-container {
    height: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .network-container > div {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
  }

  .connections {
    display: none;
  }

  .core-hexagon {
    margin-bottom: 1rem;
  }
}

@keyframes dashOffset {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 500;
  }
}
</style>
