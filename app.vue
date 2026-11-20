<template>
  <!-- Says the new page's title to screen readers after each page change. -->
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <!-- The home page stays built when the reader leaves it (one at a time), so
         coming back shows the 3D room at once instead of rebuilding it. -->
    <NuxtPage :keepalive="{ include: ['HomeRoute'], max: 1 }" />
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
