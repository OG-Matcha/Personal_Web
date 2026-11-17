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
        lede: 'Case studies first: what was decided, what was not, and what it cost. Smaller projects follow.',
        count: `${works.length} case studies · ${alsoBuilt.length} more`,
        also: 'Also built',
      }
    : {
        title: '作品集',
        lede: '先放寫成案例研究的四件：當時的決策、沒選的選項，以及那個選擇的代價。其餘的列在後面。',
        count: `${works.length} 件案例研究 · 另外 ${alsoBuilt.length} 件`,
        also: '也做過',
      }
)
</script>
