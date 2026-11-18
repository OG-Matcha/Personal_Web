<template>
  <CasePage v-if="work" :work="work" :evidence="evidence" />
</template>

<script setup>
import CasePage from '~/components/pages/CasePage.vue'

const route = useRoute()
const { timeline } = useContent()

const work = useWork(route.params.slug)

if (!work) {
  throw createError({ statusCode: 404, statusMessage: '找不到這個案例', fatal: true })
}

/** Anything still marked TODO is not published (same rule as CasePage). */
function ok(v) {
  return Boolean(v) && !String(v).startsWith('TODO')
}

const links = computed(() => (work.links ?? []).filter((l) => ok(l.href)))

const evidence = computed(() =>
  timeline.filter((e) => e.project === work.slug && (e.kind === 'award' || e.kind === 'grant'))
)

// A case may name itself the way people search for it (seoTitle) and lead its
// snippet with who and what (seoDescription); otherwise its title and summary.
const seoTitle = `${work.seoTitle ?? work.title} | 黃鉅燊 Ju-Shen Huang`
const seoDescription = work.seoDescription ?? work.summary

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogUrl: `https://www.ogmatcha.com/work/${work.slug}/`,
  // Globally 'profile', which told every scraper that a product page was a
  // personal profile.
  ogType: 'article',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
})

/**
 * What each case study actually is. Four pages that were structurally
 * indistinguishable from the homepage: one ld+json apiece and it was the
 * site-wide Person block, so nothing said the page was about oSave, that oSave
 * is an app, or that this person made it - while the real store URLs were
 * sitting in the YAML and rendering as buttons two elements away.
 */
const NODE_TYPE = {
  osave: { '@type': 'SoftwareApplication', applicationCategory: 'FinanceApplication', operatingSystem: 'iOS, Android' },
  medalink: { '@type': 'SoftwareApplication', applicationCategory: 'BusinessApplication' },
  phishforge: { '@type': 'CreativeWork', sourceOrganization: { '@id': ID.ncu } },
  finctory: { '@type': 'Organization', '@id': 'https://www.finctory.com/#org' },
  surprice: { '@type': 'WebApplication', applicationCategory: 'ShoppingApplication', operatingSystem: 'Web', browserRequirements: 'Requires a modern mobile or desktop browser' },
  taobao: { '@type': 'SoftwareApplication', applicationCategory: 'ShoppingApplication', operatingSystem: 'Chrome' },
}

const url = `https://www.ogmatcha.com/work/${work.slug}/`

// Finctory's node reuses the Organization `@id` the Person's worksFor already
// declares, so the two are one entity across the site rather than two records
// of the same company. Everything else gets a page-local id.
const workId = (NODE_TYPE[work.slug] ?? {})['@id'] ?? `${url}#work`

const workNode = computed(() => {
  const base = NODE_TYPE[work.slug] ?? { '@type': 'CreativeWork' }
  // Only store listings are install URLs; the official site goes in sameAs.
  const install = links.value.map((l) => l.href).filter((h) => /apps\.apple\.com|play\.google\.com|chromewebstore\.google\.com/.test(h))
  const site = links.value.map((l) => l.href).filter((h) => !install.includes(h))
  return {
    ...base,
    name: work.title,
    ...(work.titleEn ? { alternateName: work.titleEn } : {}),
    description: work.summary,
    url,
    // finctory.yml has `cover: null`; an unguarded spread would emit
    // "image": null, which is worse than omitting it.
    ...(work.cover ? { image: `https://www.ogmatcha.com${work.cover}` } : {}),
    ...(work.period?.start ? { datePublished: String(work.period.start) } : {}),
    ...(base['@type'] === 'Organization'
      ? { founder: { '@id': ID.person } }
      : { creator: { '@id': ID.person } }),
    ...(install.length && /Application$/.test(base['@type'])
      ? { installUrl: install }
      : {}),
    ...(site.length && base['@type'] !== 'Organization' ? { sameAs: site } : {}),
  }
})

useHead({
  link: [
    { rel: 'canonical', href: url },
    { rel: 'alternate', hreflang: 'zh-Hant-TW', href: url },
    { rel: 'alternate', hreflang: 'en', href: `https://www.ogmatcha.com/en/work/${work.slug}/` },
    { rel: 'alternate', hreflang: 'x-default', href: url },
  ],
  script: [
    jsonLdScript({
      '@context': 'https://schema.org',
      '@graph': [
        {
          ...pageNode({ type: 'WebPage', url, name: work.title }),
          mainEntity: { '@id': workId },
        },
        { '@id': workId, ...workNode.value },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.ogmatcha.com/' },
            { '@type': 'ListItem', position: 2, name: '作品集', item: 'https://www.ogmatcha.com/portfolio/' },
            { '@type': 'ListItem', position: 3, name: work.title },
          ],
        },
      ],
    }),
  ],
})
</script>
