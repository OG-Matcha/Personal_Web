<template>
  <div>
    <Station id="work" wide :title="t.title" :lede="t.lede" heading-tag="h1">
      <template #meta>
        <p class="figures">{{ t.count }}</p>
      </template>
      <CaseStudies />
    </Station>

    <Station id="also" wide :title="t.also">
      <AlsoBuilt />
    </Station>
  </div>
</template>

<script setup>
import Station from '~/components/studio/Station.vue'
import CaseStudies from '~/components/sections/CaseStudies.vue'
import AlsoBuilt from '~/components/sections/AlsoBuilt.vue'

const { works, alsoBuilt } = useContent()
const { locale } = useLocale()

const t = computed(() =>
  locale.value === 'en'
    ? {
        title: 'Work',
        lede: 'Four products first: what each one does, who uses it, and the part I built. Smaller projects follow.',
        count: `${works.length} products · ${alsoBuilt.length} more`,
        also: 'Also built',
      }
    : {
        title: '作品集',
        lede: '先放四個產品：各自做什麼、給誰用、哪一塊是我做的。其餘的列在後面。',
        count: `${works.length} 個產品 · 另外 ${alsoBuilt.length} 件`,
        also: '也做過',
      }
)
</script>
