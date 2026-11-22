<template>
  <!-- Document scroll, deliberately. The previous layout made #mainContent the
       real scroller on desktop, which broke every window.scrollY read on the
       site and would break ScrollTrigger pinning outright. -->
  <div class="flex min-h-screen flex-col bg-bg text-ink">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:px-4 focus:py-2 focus:shadow-raised"
    >
      {{ locale === 'en' ? 'Skip to content' : '跳到主要內容' }}
    </a>

    <SiteHeader />

    <!-- tabindex -1 so the skip link moves focus here, not just the view. -->
    <main id="main" class="flex-1" :class="{ 'on-desk': onDesk }" :style="onDesk ? grain : null" tabindex="-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import SiteHeader from '~/components/site/SiteHeader.vue'
import SiteFooter from '~/components/site/SiteFooter.vue'

const { locale } = useLocale()

// Headings carry invisible word joiners (utils/keepWords.ts) so they break
// between phrases. Copied text leaves without them: someone copying a contest
// name to search for it must get the plain words.
const WJ = new RegExp(String.fromCharCode(0x2060), 'g')
function onCopy(e) {
  const text = String(getSelection() ?? '')
  if (!WJ.test(text)) return
  WJ.lastIndex = 0
  e.clipboardData?.setData('text/plain', text.replace(WJ, ''))
  e.preventDefault()
}
onMounted(() => document.addEventListener('copy', onCopy))
onBeforeUnmount(() => document.removeEventListener('copy', onCopy))
// <html lang> follows the page on every route, including the client-side hop
// from /en/ back to Chinese, where pages that set no lang left none at all.
const cjkFont = useRuntimeConfig().public.cjkFont
useHead({
  htmlAttrs: { lang: computed(() => (locale.value === 'en' ? 'en' : 'zh-Hant-TW')) },
  // Chinese pages fetch the large Noto file with the HTML: its face is
  // font-display: optional (see nuxt.config), used only if in by first paint.
  link: computed(() =>
    locale.value === 'en' ? [] : [{ rel: 'preload', as: 'font', type: 'font/woff2', href: cjkFont, crossorigin: '', key: 'cjk-1' }]
  ),
})

// The work pages are laid on the same desk as the homepage's lower half:
// its wood grain behind them, so clicking a print does not change rooms.
// (The homepage draws its own, faded in under the 3D scene.)
const router = useRouter()
// Every page past the home desk lies on the same wood: the portfolio, each case and the
// resume and contact. The path may come with or without its trailing slash.
const onDesk = computed(() => /^(\/en)?\/(portfolio|work|resume|contact)(\/|$)/.test(router.currentRoute.value.path))
const grain = { '--grain-day': `url(${asset('/images/desk-grain-day.webp')})`, '--grain-night': `url(${asset('/images/desk-grain-night.webp')})` }
</script>

<style>
#main:focus {
  outline: none;
}

.on-desk {
  background: var(--grain-day) center top / max(100%, 1024px) auto repeat-y;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .on-desk {
    background-image: var(--grain-night);
  }
}

:root[data-theme='dark'] .on-desk {
  background-image: var(--grain-night);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>
