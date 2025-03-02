<!-- HexagonItem.vue -->
<template>
  <div
    ref="hexRef"
    class="hexagon-item"
    :class="{ 'is-active': isActive, 'is-highlight': isHighlight, 'is-core': isCore }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <!-- 六邊形外框 -->
    <div class="hexagon-border" :style="borderStyle"></div>

    <!-- 六邊形背景 -->
    <div class="hexagon-bg" :style="bgStyle">
      <!-- 內部紋理效果 -->
      <div class="hexagon-texture"></div>
    </div>

    <!-- 六邊形內容 -->
    <div class="hexagon-content">
      <div class="icon text-2xl sm:text-3xl" v-if="skill.icon">{{ skill.icon }}</div>
      <div class="title mt-1 font-bold">{{ skill.title }}</div>
      <div class="subtitle text-xs opacity-80" v-if="skill.subtitle && isCore">
        {{ skill.subtitle }}
      </div>
    </div>

    <!-- 技能描述 (懸停時顯示) -->
    <div class="skill-description tooltip" v-if="isHovering && skill.description">
      {{ skill.description }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue'

const props = defineProps({
  skill: {
    type: Object,
    required: true,
  },
  isCore: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isHighlight: {
    type: Boolean,
    default: false,
  },
})

const { skill } = toRefs(props)

const emit = defineEmits(['activate', 'deactivate', 'hover', 'leave'])

const hexRef = ref(null)
const isHovering = ref(false)

// 計算背景樣式
const bgStyle = computed(() => {
  return {
    background: skill.value.color || 'bg-gray-700',
  }
})

// 計算邊框樣式
const borderStyle = computed(() => {
  let borderColor = 'rgba(255, 255, 255, 0.1)'

  if (props.isActive) {
    borderColor = 'rgba(255, 255, 255, 0.8)'
  } else if (props.isHighlight) {
    borderColor = 'rgba(255, 255, 255, 0.4)'
  }

  return {
    borderColor,
  }
})

// 事件處理
function handleMouseEnter() {
  isHovering.value = true
  emit('hover', skill.value.id)
}

function handleMouseLeave() {
  isHovering.value = false
  emit('leave')
}

function handleClick() {
  if (props.isActive) {
    emit('deactivate')
  } else {
    emit('activate', skill.value.id)
  }
}
</script>

<style scoped>
.hexagon-item {
  position: relative;
  width: 120px;
  height: 138px;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

/* 讓核心六邊形更大 */
.hexagon-item.is-core {
  width: 140px;
  height: 161px;
  z-index: 2;
}

/* 懸停和活躍時的效果 */
.hexagon-item:hover,
.hexagon-item.is-active {
  transform: scale(1.05);
  z-index: 3;
}

/* 六邊形背景 */
.hexagon-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

/* 六邊形邊框 */
.hexagon-border {
  position: absolute;
  width: calc(100% + 6px);
  height: calc(100% + 6px);
  top: -3px;
  left: -3px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* 內部紋理 */
.hexagon-texture {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  background-image: radial-gradient(circle, white 1px, transparent 1px);
  background-size: 10px 10px;
}

/* 六邊形內容 */
.hexagon-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 10px;
  color: white;
  z-index: 2;
}

/* 技能描述 */
.skill-description {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(15, 15, 15, 0.95));
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  width: 180px;
  text-align: center;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.skill-description:after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(30, 30, 30, 0.9);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 活躍時增加陰影效果 */
.hexagon-item.is-active .hexagon-bg {
  box-shadow: 0 5px 30px rgba(255, 255, 255, 0.3);
}

/* 高亮時的效果 */
.hexagon-item.is-highlight .hexagon-bg {
  filter: brightness(1.2);
}
</style>
