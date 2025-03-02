<!-- TypeWriter.vue -->
<template>
  <span ref="typeTarget" class="type-writer" :class="textClass"></span>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TypeIt from 'typeit'

const props = defineProps({
  // 要循環顯示的文字數組
  texts: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 打字速度 (毫秒)
  speed: {
    type: Number,
    default: 100,
  },
  // 刪除速度 (毫秒)
  deleteSpeed: {
    type: Number,
    default: 50,
  },
  // 每次完成後的等待時間 (毫秒)
  waitTime: {
    type: Number,
    default: 2000,
  },
  // 字體顏色樣式類
  textClass: {
    type: String,
    default: 'text-yellow-400',
  },
})

const typeTarget = ref(null)
let typeInstance = null

onMounted(() => {
  if (props.texts.length === 0) return

  // 創建打字實例
  typeInstance = new TypeIt(typeTarget.value, {
    speed: props.speed,
    waitUntilVisible: true,
    cursor: true,
    cursorSpeed: 1000,
    lifeLike: true,
  }).go()

  // 添加打字序列
  function setupTypeSequence() {
    if (!typeInstance) return

    // 重置實例
    typeInstance.reset()

    // 為每個文本添加打字/刪除序列
    props.texts.forEach((text, index) => {
      // 添加文本
      typeInstance.type(text)

      // 等待指定時間
      typeInstance.pause(props.waitTime)

      // 刪除文本 (最後一項除外)
      if (index < props.texts.length - 1) {
        typeInstance.delete(null, { speed: props.deleteSpeed })
      }
    })

    // 完成後重新開始
    typeInstance.go().flush(setupTypeSequence)
  }

  // 初始化序列
  setupTypeSequence()
})

onBeforeUnmount(() => {
  // 組件卸載時，清理實例
  if (typeInstance) {
    typeInstance.destroy()
    typeInstance = null
  }
})
</script>

<style scoped>
.type-writer {
  display: inline-block;
  font-weight: 600;
  min-width: 10px;
  position: relative;
}

/* 自定義光標樣式 */
.ti-cursor {
  display: inline-block;
  position: relative;
  color: currentColor;
  font-style: normal;
  margin-left: 1px;
  opacity: 1;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
