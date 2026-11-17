<template>
  <!-- Day or night in the studio. The stored choice is applied before first
       paint by the inline script in nuxt.config; this only flips and remembers. -->
  <button type="button" class="tg" :aria-pressed="night" :aria-label="label" :title="label" @click="flip">
    <Moon v-if="night" :size="18" :stroke-width="2" aria-hidden="true" />
    <Sun v-else :size="18" :stroke-width="2" aria-hidden="true" />
  </button>
</template>

<script setup>
import { Sun, Moon } from 'lucide-vue-next'

const { locale } = useLocale()
const night = ref(false)

const label = computed(() =>
  locale.value === 'en'
    ? night.value
      ? 'Switch to day (light)'
      : 'Switch to night (dark)'
    : night.value
      ? '切換成白天（亮色）'
      : '切換成夜晚（暗色）'
)

function current() {
  const t = document.documentElement.dataset.theme
  if (t) return t === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
  night.value = current()
})

function flip() {
  night.value = !night.value
  const v = night.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = v
  try {
    localStorage.setItem('theme', v)
  } catch {}
}
</script>

<style scoped>
.tg {
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
    color var(--dur-1),
    transform var(--dur-3) var(--ease-entrance);
}

.tg:hover {
  background: var(--surface-2);
  color: var(--ink);
  transform: rotate(-20deg);
}
</style>
