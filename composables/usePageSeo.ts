const SITE = 'https://www.ogmatcha.com'

/**
 * Meta, canonical, hreflang pair and page JSON-LD for one route.
 *
 * `path` is the Chinese path ("/resume/"); the English twin is the same path
 * under /en/. Both editions of every page exist, so the alternates are always
 * the pair, plus x-default on the Chinese one.
 */
export function usePageSeo(opts: {
  path: string
  lang: 'zh' | 'en'
  title: string
  description: string
  type: 'ProfilePage' | 'WebPage' | 'CollectionPage' | 'ContactPage'
  dateModified?: string
  ogType?: string
  /** More nodes for the page's graph (a product, a breadcrumb), and the one the page is about. */
  graph?: Record<string, unknown>[]
  mainEntity?: string
}) {
  const zh = `${SITE}${opts.path}`
  const en = `${SITE}/en${opts.path}`
  const url = opts.lang === 'en' ? en : zh

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogUrl: url,
    ogType: (opts.ogType ?? 'website') as 'website',
    ogLocale: opts.lang === 'en' ? 'en_US' : 'zh_TW',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
  })
  useHead({
    ...(opts.lang === 'en' ? { htmlAttrs: { lang: 'en' } } : {}),
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: 'zh-Hant-TW', href: zh },
      { rel: 'alternate', hreflang: 'en', href: en },
      { rel: 'alternate', hreflang: 'x-default', href: zh },
    ],
    script: [
      jsonLdScript({
        '@context': 'https://schema.org',
        '@graph': [
          {
            ...pageNode({
              type: opts.type as 'WebPage',
              url,
              name: opts.title,
              dateModified: opts.dateModified,
              lang: opts.lang === 'en' ? 'en' : 'zh-Hant-TW',
            }),
            ...(opts.mainEntity ? { mainEntity: { '@id': opts.mainEntity } } : {}),
          },
          ...(opts.graph ?? []),
        ],
      }),
    ],
  })
}
