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
  // Who it was for, in English; without one the Chinese name would show.
  org: e.org ?? null,
  links: (zh.links ?? []).map((l) => ({ ...l, label: l.labelEn ?? l.label })),
  outcomes: e.outcomes ?? [],
  // Only site paths move under /en; a link off the site stays as it is.
  highlights: byIndex(zh.highlights, e.highlights).map((h) => (h.href?.startsWith('/') ? { ...h, href: `/en${h.href}` } : h)),
  turn: zh.turn && e.turn ? { ...zh.turn, ...e.turn } : null,
  myPart: e.myPart ?? [],
}

const evidence = timeline
  .filter((t) => t.project === zh.slug && (t.kind === 'award' || t.kind === 'grant'))
  .map((t) => ({ ...t, ...(en.timeline?.[`${t.date} ${t.title}`] ?? {}) }))

const schema = workSchema(zh, { lang: 'en', name: work.title, description: e.summary ?? zh.summary })

usePageSeo({
  path: `/work/${zh.slug}/`,
  graph: [schema.node, schema.crumbs],
  mainEntity: schema.id,
  lang: 'en',
  type: 'WebPage',
  ogType: 'article',
  title: `${e.seoTitle ?? work.title} | Ju-Shen Huang`,
  description: e.seoDescription ?? e.summary ?? zh.summary,
  image: `https://www.ogmatcha.com/images/og/${zh.slug}-card-en.jpg`,
})
</script>

