<template>
  <!-- Says the new page's title to screen readers after each page change. -->
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
/**
 * The Person and WebSite nodes, on every page, with stable `@id`s the pages
 * hang their own nodes off. Generated from content/*.yml - see
 * composables/useJsonLd.ts for why this cannot live in nuxt.config.
 */
useHead({ script: [jsonLdScript(useSiteGraph())] })
</script>
