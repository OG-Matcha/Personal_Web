<template>
  <!--
    The questions people type about a name, answered in whole sentences that
    each carry the name. Search engines and answer engines lift sentences, not
    layouts: a fact that only makes sense next to the card it sits in cannot be
    quoted. Every answer is built from the same data the rest of the site
    prints, so this block can never say something the record does not.
  -->
  <dl class="qf">
    <div v-for="q in faqs" :key="q.q" class="qf-item">
      <dt class="qf-q">{{ q.q }}</dt>
      <dd class="qf-a">{{ q.a }}</dd>
    </div>
  </dl>
</template>

<script setup>
const { site, about, en, works, timeline } = useContent()
const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

const SHORTLISTED = /入圍/
const TOP_PRIZE = /第一名|冠軍|金獎|最佳創新創業大獎/

/** A tagline as a phrase inside brackets: no closing full stop, lower-case start. */
const phrase = (t) => String(t).replace(/[.。]\s*$/, '').replace(/^([A-Z])(?=[a-z ])/, (m) => m.toLowerCase())

const faqs = computed(() => {
  const zhName = site.person.nameZh
  const enName = site.person.nameEn
  const posts = about.posts.map((p, i) => ({ ...p, ...(E.value ? en.posts?.[i] ?? {} : {}) }))
  const products = works.filter((w) => w.slug !== 'finctory')
  const top = timeline
    .filter((e) => e.kind === 'award' && !SHORTLISTED.test(e.title) && TOP_PRIZE.test(e.title))
    .map((e) => (E.value ? en.timeline?.[`${e.date} ${e.title}`]?.title ?? e.title : e.title))
  const { awards, topPrizes, researchGrants } = site.counts
  const c = site.contact

  if (E.value) {
    return [
      { q: `Who is ${enName}?`, a: en.intro },
      {
        q: `What does ${enName} do now?`,
        a: `${enName} is ${posts.map((p) => `${p.role} at ${p.orgEn ?? p.org}`).join('; ')}; and a master's student in Information Management at National Central University.`,
      },
      {
        q: `What has ${enName} built?`,
        a: `${enName} has built ${products.map((w) => `${en.works?.[w.slug]?.title ?? w.titleEn ?? w.title} (${phrase(en.works?.[w.slug]?.tagline ?? w.tagline)})`).join(', ')}.`,
      },
      {
        q: `What awards has ${enName} won?`,
        a: `${enName} has won ${awards} competition awards, ${topPrizes} of them national top prizes, and has taken part in ${researchGrants} NSTC-funded research projects. The top prizes: ${top.join('; ')}.`,
      },
      { q: `How do I contact ${enName}?`, a: `Email ${enName} at ${c.email}, or find ${enName} on LinkedIn (${c.linkedin}) and GitHub (${c.github}).` },
    ]
  }
  return [
    { q: `${zhName}是誰？`, a: about.intro },
    {
      q: `${zhName}現在在做什麼？`,
      a: `${zhName}現在是${posts.map((p) => `${p.org} ${p.role}`).join('、')}，同時在中央大學資訊管理學系碩士班就讀。`,
    },
    {
      q: `${zhName}做過哪些產品？`,
      a: `${zhName}做過的產品有：${products.map((w) => `${w.title}（${String(w.tagline).replace(/。$/, '')}）`).join('、')}。`,
    },
    {
      q: `${zhName}得過哪些獎？`,
      a: `${zhName}得過 ${awards} 項競賽獎項，其中 ${topPrizes} 座是全國首獎，另外參與 ${researchGrants} 個國科會研究計畫。首獎包括：${top.join('、')}。`,
    },
    { q: `怎麼聯絡${zhName}？`, a: `寫信給${zhName}：${c.email}；也可以在 LinkedIn（${c.linkedin}）和 GitHub（${c.github}）找到${zhName}。` },
  ]
})

// The same questions as FAQPage data, so the visible text and the markup are
// one source. Google shows FAQ rich results only for a few kinds of sites, but
// the questions still tell every reader what each answer is about.
useHead(() => ({
  script: [
    jsonLdScript({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: E.value ? 'en' : 'zh-Hant-TW',
      about: { '@id': ID.person },
      mainEntity: faqs.value.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    }),
  ],
}))
</script>

<style scoped>
.qf {
  display: grid;
  gap: var(--sp-6);
  max-width: 48rem;
}

.qf-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--sp-2);
  padding-bottom: var(--sp-6);
  border-bottom: 1px solid var(--rule);
}

.qf-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.qf-q {
  font-family: var(--font-display);
  font-size: var(--step-1);
  font-weight: 800;
}

.qf-a {
  overflow-wrap: anywhere;
  color: var(--ink-2);
  line-height: 1.75;
}
</style>
