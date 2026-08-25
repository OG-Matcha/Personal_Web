<template>
  <div class="pt-8">
    <div class="shell pb-7">
      <h1 class="font-display text-3xl">完整年表</h1>
      <p class="measure mt-3 text-base text-ink-2">
        {{ timeline.length }} 筆紀錄，逆時序。資料截至 {{ formatDate(site.asOf) }}。
      </p>
      <p class="mt-5">
        <a :href="site.contact.cv.href" class="mono text-2xs">
          CV PDF · 更新於 {{ formatDate(site.contact.cv.updated) }}
        </a>
      </p>
    </div>

    <LedgerSection heading="全部紀錄" />
  </div>
</template>

<script setup>
import LedgerSection from '~/components/sections/LedgerSection.vue'

const { timeline, site } = useContent()

useSeoMeta({
  title: '履歷 | 黃鉅燊 Ju-Shen Huang',
  description:
    '黃鉅燊完整年表：15 項競賽獎項（含 4 次全國第一）、3 個研究計畫、工研院產科國際所、斐闊 Finctory 技術長、中央大學資訊管理學系。',
  ogTitle: '履歷 | 黃鉅燊 Ju-Shen Huang',
  ogUrl: 'https://www.ogmatcha.com/resume',
})
useHead({ link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com/resume' }] })
</script>
