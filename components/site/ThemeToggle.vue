<template>
  <!-- Day or night in the studio. The stored choice is applied before first
       paint by the inline script in nuxt.config; this only flips and remembers. -->
  <button type="button" class="tg" :aria-pressed="night" :aria-label="label" :title="label" @click="flip($event)">
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

function apply() {
  night.value = !night.value
  const v = night.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = v
  try {
    localStorage.setItem('theme', v)
  } catch {}
}

/*
  Every colour on the page eases at its own pace, so a plain swap passes
  through moments where a pale header holds pale text. A view transition
  swaps the whole page at once instead, revealed as a circle growing out of
  this button: the lights going on (or off) from where you reached for them.
*/
function flip(e) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || still) return apply()
  const r = e.currentTarget.getBoundingClientRect()
  const x = r.left + r.width / 2
  const y = r.top + r.height / 2
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const root = document.documentElement
  root.classList.add('is-theming')
  const vt = document.startViewTransition(apply)
  vt.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
      )
    )
    .catch(() => {})
  vt.finished.finally(() => root.classList.remove('is-theming'))
}
</script>

<style>
/* The reveal replaces the default cross-fade; colour transitions are held off
   so the new snapshot is taken already settled. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
/* A cover moving between pages takes the site's entrance curve. */
::view-transition-group(*) {
  animation-duration: 520ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
/* A named picture with no partner on the other page (a portfolio cover when
   the résumé opens) goes or comes with the page, at once, instead of fading
   on its own over the new page for half a second. */
::view-transition-old(*):only-child {
  animation: none;
  opacity: 0;
}
::view-transition-new(*):only-child {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
html.is-theming,
html.is-theming *,
html.is-theming *::before,
html.is-theming *::after {
  transition: none !important;
}
</style>

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
