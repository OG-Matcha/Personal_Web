/**
 * What each case study actually is, as JSON-LD: the product node and the
 * breadcrumb. Shared by the Chinese and English pages, which used to differ:
 * the English ones had neither, so an English search knew the page only as
 * "about a person".
 */
const SITE = 'https://www.ogmatcha.com'

const NODE_TYPE: Record<string, Record<string, unknown>> = {
  osave: { '@type': 'SoftwareApplication', applicationCategory: 'FinanceApplication', operatingSystem: 'iOS, Android' },
  medalink: { '@type': 'SoftwareApplication', applicationCategory: 'BusinessApplication' },
  phishforge: { '@type': 'CreativeWork', sourceOrganization: { '@id': ID.ncu } },
  // A four-person hackathon entry: he is one contributor, not its creator.
  catalyst: { '@type': 'CreativeWork', award: '6th TSMC IT CareerHack, AI Ops track, 1st place (2025)', team: true },
  finctory: { '@type': 'Organization', '@id': 'https://www.finctory.com/#org' },
  surprice: { '@type': 'WebApplication', applicationCategory: 'ShoppingApplication', operatingSystem: 'Web', browserRequirements: 'Requires a modern mobile or desktop browser' },
  taobao: { '@type': 'SoftwareApplication', applicationCategory: 'ShoppingApplication', operatingSystem: 'Chrome' },
}

const ok = (v: unknown) => Boolean(v) && !String(v).startsWith('TODO')

/**
 * `zh` is the Chinese work (links, cover, period live there); `name` and
 * `description` are in the page's own language.
 */
export function workSchema(zh: any, opts: { lang: 'zh' | 'en'; name: string; description: string }) {
  const url = `${SITE}${opts.lang === 'en' ? '/en' : ''}/work/${zh.slug}/`
  const { team, ...base } = NODE_TYPE[zh.slug] ?? { '@type': 'CreativeWork' }
  // Finctory reuses the Organization @id the Person's worksFor declares, so the
  // two are one entity across the site; everything else gets a page-local id.
  // The product is one thing in two languages: both pages point at the Chinese
  // page's id rather than minting a second entity.
  const id = (base['@id'] as string) ?? `${SITE}/work/${zh.slug}/#work`
  const links = (zh.links ?? []).map((l: any) => l.href).filter(ok)
  // Only store listings are install URLs; the official site goes in sameAs.
  const install = links.filter((h: string) => /apps\.apple\.com|play\.google\.com|chromewebstore\.google\.com/.test(h))
  const site = links.filter((h: string) => !install.includes(h))
  const node = {
    ...base,
    '@id': id,
    name: opts.name,
    ...(zh.titleEn ? { alternateName: opts.lang === 'en' ? zh.title : zh.titleEn } : {}),
    description: opts.description,
    url,
    // finctory.yml has `cover: null`; an unguarded spread would emit "image": null.
    ...(zh.cover ? { image: `${SITE}${zh.cover}` } : {}),
    ...(zh.period?.start ? { datePublished: String(zh.period.start) } : {}),
    ...(base['@type'] === 'Organization' ? { founder: { '@id': ID.person } } : team ? { contributor: { '@id': ID.person } } : { creator: { '@id': ID.person } }),
    ...(install.length && /Application$/.test(base['@type'] as string) ? { installUrl: install } : {}),
    ...(site.length && base['@type'] !== 'Organization' ? { sameAs: site } : {}),
  }
  const en = opts.lang === 'en'
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Home' : '首頁', item: `${SITE}${en ? '/en/' : '/'}` },
      { '@type': 'ListItem', position: 2, name: en ? 'Work' : '作品集', item: `${SITE}${en ? '/en' : ''}/portfolio/` },
      { '@type': 'ListItem', position: 3, name: opts.name },
    ],
  }
  return { id, url, node, crumbs }
}
