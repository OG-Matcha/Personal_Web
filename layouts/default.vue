<template>
  <!-- Document scroll, deliberately. The previous layout made #mainContent the
       real scroller on desktop, which broke every window.scrollY read on the
       site and would break ScrollTrigger pinning outright. -->
  <div class="min-h-screen bg-bg text-ink">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:px-4 focus:py-2 focus:shadow-raised"
    >
      {{ locale === 'en' ? 'Skip to content' : '跳到主要內容' }}
    </a>

    <SiteHeader />

    <!-- tabindex -1 so the skip link moves focus here, not just the view. -->
    <main id="main" tabindex="-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import SiteHeader from '~/components/site/SiteHeader.vue'
import SiteFooter from '~/components/site/SiteFooter.vue'

const { locale } = useLocale()
</script>

<style>
#main:focus {
  outline: none;
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
