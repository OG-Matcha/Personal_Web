<template>
  <div>
    <Station id="record" wide :title="t.title" :lede="t.lede" heading-tag="h1">
      <template #meta>
        <dl class="counts figures">
          <div>
            <dt>{{ t.awards }}</dt>
            <dd>{{ site.counts.awards }}</dd>
          </div>
          <div>
            <dt>{{ t.top }}</dt>
            <dd>{{ site.counts.topPrizes }}</dd>
          </div>
          <div>
            <dt>{{ t.grants }}</dt>
            <dd>{{ site.counts.researchGrants }}</dd>
          </div>
        </dl>
        <div class="cv">
          <a :href="cv.mine" class="cv-btn" download>
            <FileDown :size="18" aria-hidden="true" />
            <span>
              <b>{{ t.cv }}</b>
              <small class="figures">{{ t.cvNote }}</small>
            </span>
          </a>
          <a :href="cv.other" class="cv-other" :hreflang="isEn ? 'zh-Hant' : 'en'" download>{{ t.cvOther }}</a>
        </div>
      </template>
      <LedgerSection />
    </Station>

    <Station id="skills" wide :title="t.skills" :lede="t.skillsLede">
      <SkillsSection />
    </Station>
  </div>
</template>

<script setup>
import { FileDown } from 'lucide-vue-next'
import Station from '~/components/studio/Station.vue'
import LedgerSection from '~/components/sections/LedgerSection.vue'
import SkillsSection from '~/components/sections/SkillsSection.vue'

const { timeline, site, en } = useContent()
const { locale } = useLocale()
const isEn = computed(() => locale.value === 'en')
// Each language links its own CV first and the other one beside it.
const cv = computed(() => {
  const { href, hrefEn } = site.contact.cv
  return isEn.value ? { mine: hrefEn, other: href } : { mine: href, other: hrefEn }
})

const t = computed(() =>
  locale.value === 'en'
    ? {
        title: 'The full record',
        lede: `${timeline.length} entries, newest first. Data as of ${formatDate(site.asOf)}. Every entry is dated; announcements are linked where they exist.`,
        awards: 'Awards',
        top: 'Top prizes',
        grants: 'NSTC grants',
        cv: 'Download CV',
        cvNote: `PDF · 2 pages · updated ${formatDate(site.contact.cv.updated)}`,
        cvOther: '中文版',
        skills: en.sheets.skills,
        skillsLede: en.sheets.skillsLede,
      }
    : {
        title: '完整年表',
        lede: `${timeline.length} 筆紀錄，逆時序。資料截至 ${formatDate(site.asOf)}。每一筆都有日期，有公告的附上連結。`,
        awards: '競賽獎項',
        top: '全國首獎',
        grants: '國科會計畫',
        cv: '下載履歷',
        cvNote: `PDF · 2 頁 · ${formatDate(site.contact.cv.updated)} 更新`,
        cvOther: 'English',
        skills: '能力斷面',
        skillsLede: '量尺不是熟練度，是證據層級。每一項都連得到一個可以點開的東西；連不到的，這一頁就不列。',
      }
)
</script>

<style scoped>
.counts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4) var(--sp-7);
}

.counts div {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}

.counts dt {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.counts dd {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-3);
  line-height: 1;
  color: var(--ink);
}

/* The CV: one real button, the other language as a quiet link beside it. */
.cv {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2) var(--sp-4);
  margin-left: auto;
}

.cv-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-full);
  background: var(--ink);
  color: var(--surface);
  text-decoration: none;
  transition: transform 0.2s var(--ease-entrance), box-shadow 0.2s ease;
}

.cv-btn span {
  display: grid;
  line-height: 1.25;
}

.cv-btn b {
  font-weight: 650;
}

.cv-btn small {
  font-size: 0.75rem;
  opacity: 0.72;
}

.cv-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}

.cv-btn:focus-visible,
.cv-other:focus-visible {
  outline: 2px solid var(--pop);
  outline-offset: 3px;
}

.cv-other {
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--ink-2);
  text-decoration-color: var(--pop-ink);
  text-underline-offset: 0.2em;
}

</style>
