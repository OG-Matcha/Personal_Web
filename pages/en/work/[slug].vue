<template>
  <CasePage :work="work" :evidence="evidence" locale="en" />
</template>

<script setup>
import CasePage from '~/components/pages/CasePage.vue'

const route = useRoute()
const { timeline, en } = useContent()
const zh = useWork(route.params.slug)

if (!zh) {
  throw createError({ statusCode: 404, statusMessage: 'No such case study', fatal: true })
}

const e = en.works?.[zh.slug] ?? {}

/**
 * The English edition is the Chinese case with its words swapped. Lists are
 * merged item by item, so screenshots and links stay defined once, in the
 * Chinese file, and only the sentences are translated here.
 */
const byIndex = (base = [], tr = []) => base.map((b, i) => ({ ...b, ...(tr[i] ?? {}) }))
const work = {
  ...zh,
  ...e,
  title: e.title ?? zh.title,
  org: null,
  links: (zh.links ?? []).map((l) => ({ ...l, label: l.labelEn ?? l.label })),
  outcomes: e.outcomes ?? [],
  highlights: byIndex(zh.highlights, e.highlights).map((h) => (h.href ? { ...h, href: `/en${h.href}` } : h)),
  turn: zh.turn && e.turn ? { ...zh.turn, ...e.turn } : null,
  myPart: e.myPart ?? [],
}

const evidence = timeline
  .filter((t) => t.project === zh.slug && (t.kind === 'award' || t.kind === 'grant'))
  .map((t) => ({ ...t, ...(en.timeline?.[`${t.date} ${t.title}`] ?? {}) }))

usePageSeo({
  path: `/work/${zh.slug}/`,
  lang: 'en',
  type: 'WebPage',
  ogType: 'article',
  title: `${e.seoTitle ?? work.title} | Ju-Shen Huang`,
  description: e.seoDescription ?? e.summary ?? zh.summary,
})
</script>

