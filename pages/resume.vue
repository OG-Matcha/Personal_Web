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

const TITLE = '履歷 | 黃鉅燊 Ju-Shen Huang'
// Counted from content/timeline.yml rather than remembered: `kind: award` is
// 16 rows, not the 15 this used to claim and not the 17 nuxt.config claims.
// See content/site.yml `counts`, which is where the number now lives.
const DESC = `黃鉅燊完整年表：${site.counts.awards} 項競賽獎項（含 ${site.counts.topPrizes} 座全國首獎）、${site.counts.researchGrants} 個國科會研究計畫、工研院產科國際所、斐闊 Finctory 共同創辦人暨技術長、醫數行銷 MedaLink 共同創辦人暨前線部署工程師、中央大學資訊管理學系。`

useSeoMeta({
  title: TITLE,
  description: DESC,
  ogTitle: TITLE,
  ogDescription: DESC,
  ogUrl: 'https://www.ogmatcha.com/resume/',
  // Globally 'profile', which is true of the homepage and of nothing else.
  ogType: 'website',
  twitterTitle: TITLE,
  twitterDescription: DESC,
})
useHead({
  link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com/resume/' }],
  script: [
    jsonLdScript(
      pageNode({
        type: 'WebPage',
        url: 'https://www.ogmatcha.com/resume/',
        name: TITLE,
        dateModified: site.asOf,
      })
    ),
  ],
})
</script>
