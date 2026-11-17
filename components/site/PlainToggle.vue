<template>
  <!-- 3D scenes or text only. Remembered, and applied before first paint. -->
  <button type="button" class="pt" :aria-pressed="plain" :aria-label="label" :title="label" @click="flip">
    <Box v-if="plain" :size="18" :stroke-width="2" aria-hidden="true" />
    <Type v-else :size="18" :stroke-width="2" aria-hidden="true" />
  </button>
</template>

<script setup>
import { Box, Type } from 'lucide-vue-next'

const { locale } = useLocale()
const plain = ref(false)

const label = computed(() =>
  locale.value === 'en'
    ? plain.value
      ? 'Show the 3D version'
      : 'Text-only version'
    : plain.value
      ? '回到 3D 版'
      : '純文字版'
)

onMounted(() => {
  plain.value = 'plain' in document.documentElement.dataset
})

function flip() {
  plain.value = !plain.value
  const d = document.documentElement.dataset
  if (plain.value) {
    d.plain = ''
    delete d.scene
  } else {
    delete d.plain
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) d.scene = ''
  }
  try {
    localStorage.setItem('plain', plain.value ? '1' : '0')
  } catch {}
}
</script>

<style scoped>
.pt {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--ink-2);
  background: transparent;
  border: 0;
  cursor: pointer;
  transition:
    background-color var(--dur-1),
    color var(--dur-1);
}

.pt:hover {
  background: var(--surface-2);
  color: var(--ink);
}
</style>
