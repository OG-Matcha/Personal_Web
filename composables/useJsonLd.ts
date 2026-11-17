/**
 * The site's structured data, generated from the same YAML the pages render.
 *
 * This used to be a hand-written literal inside `nuxt.config.ts`'s
 * `app.head.script`, which had two problems that no amount of editing that
 * literal could fix:
 *
 *  1. It had no `@id`, so nothing could ever point at it. A page cannot say
 *     "this page is about that person" without a node to name, and the
 *     identical anonymous Person block was stamped byte-for-byte on all seven
 *     routes, each URL re-asserting an unrelated duplicate.
 *  2. `nuxt.config.ts` is loaded by jiti, outside Vite, so `@rollup/plugin-yaml`
 *     is not applied there and no `content/*.yml` can be imported. Every fact
 *     in it was a copy, and the copies had already drifted - Instagram was in
 *     `site.yml` and not in `sameAs`, and a third current employer was missing
 *     entirely.
 *
 * Living in a composable it is still prerendered by `nuxt generate` into static
 * HTML; nothing here runs in a browser.
 */

const SITE = 'https://www.ogmatcha.com'

export const ID = {
  person: `${SITE}/#person`,
  website: `${SITE}/#website`,
  ncu: `${SITE}/#ncu`,
} as const

/** Companies he co-founded, keyed by the English name in `about.posts`. */
const FOUNDED: Record<string, { foundingDate?: string }> = {
  Finctory: { foundingDate: '2025-06-05' },
  MedaLink: {},
}

/** `2024-04` reads as a date; schema.org accepts a partial ISO-8601 date. */
function orgId(url?: string | null) {
  return url ? `${url}#org` : undefined
}

/**
 * The whole site's shared graph: who he is, and what the site is.
 *
 * Page-specific nodes (ProfilePage, the case studies) are added by the pages
 * themselves and reference these by `@id`.
 */
export function useSiteGraph() {
  const { site, about, timeline } = useContent()

  const sameAs = [site.contact.github, site.contact.linkedin, site.contact.instagram].filter(
    Boolean
  )

  // Every award and honour the timeline carries, phrased the same way the page
  // phrases it, so the two can never disagree. `schema:award` has range Text -
  // an object here would be a range violation and strict consumers drop it.
  const award = timeline
    .filter((e) => e.kind === 'award' || e.kind === 'honor')
    .map((e) => `${e.title}${e.org ? `（${e.org} · ${e.date}）` : `（${e.date}）`}`)

  // One Role per post, so each title stays attached to its own company. A
  // multi-valued `jobTitle` beside a multi-valued `worksFor` is two unordered
  // sets: nothing says which title belongs to which employer.
  const worksFor = about.posts.map((p) => {
    const founded = p.orgEn ? FOUNDED[p.orgEn] : undefined
    return {
      '@type': 'OrganizationRole',
      roleName: p.role,
      startDate: p.since,
      worksFor: {
        '@type': 'Organization',
        ...(orgId(p.url) ? { '@id': orgId(p.url), url: p.url } : {}),
        name: p.org,
        ...(p.orgEn ? { alternateName: p.orgEn } : {}),
        ...(founded?.foundingDate ? { foundingDate: founded.foundingDate } : {}),
        ...(founded ? { founder: { '@id': ID.person } } : {}),
      },
    }
  })

  const [locality] = String(site.person.location ?? '').split(/[,，]/)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': ID.person,
        name: site.person.nameZh,
        alternateName: [site.person.nameEn, site.person.handle].filter(Boolean),
        description: about.intro,
        url: SITE,
        image: `${SITE}/images/portrait.jpg`,
        // Range is Text, not a URI: a `mailto:` prefix leaks into anything
        // that renders the value.
        email: site.contact.email,
        sameAs,
        address: {
          '@type': 'PostalAddress',
          addressLocality: locality?.trim(),
          addressCountry: 'TW',
        },
        // One primary title for consumers that ignore Role, plus the Roles.
        jobTitle: about.posts[0]?.role,
        worksFor,
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          '@id': ID.ncu,
          name: '國立中央大學',
          alternateName: 'National Central University',
          url: 'https://www.ncu.edu.tw/',
          // `schema:department` expects an Organization. A bare string is a
          // range violation, and the department is the most specific fact here.
          department: { '@type': 'CollegeOrUniversity', name: '資訊管理學系' },
        },
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          educationalLevel: 'bachelor',
          name: '資訊管理學系 學士',
          recognizedBy: { '@id': ID.ncu },
        },
        award,
        knowsAbout: ['生成式 AI 應用', 'LLM Agent 系統', '系統分析與設計', '全端開發', 'DevOps'],
        seeks: site.open,
      },
      {
        '@type': 'WebSite',
        '@id': ID.website,
        url: SITE,
        name: `${site.person.nameZh} ${site.person.nameEn}`,
        alternateName: site.person.handle,
        inLanguage: 'zh-Hant-TW',
        publisher: { '@id': ID.person },
        // No `potentialAction`/SearchAction: the site has no search endpoint
        // and declaring one would be a claim that is simply false.
      },
    ],
  }
}

/** A page node that reference the shared graph rather than repeating it. */
export function pageNode(opts: {
  type: 'ProfilePage' | 'WebPage' | 'CollectionPage'
  url: string
  name: string
  dateModified?: string
  /** ProfilePage names its subject; the others are merely about it. */
  primary?: boolean
  lang?: string
}) {
  return {
    '@type': opts.type,
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    isPartOf: { '@id': ID.website },
    inLanguage: opts.lang ?? (opts.url.includes('/en/') ? 'en' : 'zh-Hant-TW'),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.primary
      ? { mainEntity: { '@id': ID.person } }
      : { about: { '@id': ID.person } }),
  }
}

/** `useHead` takes a string; keeping the serialisation in one place. */
export function jsonLdScript(graph: unknown) {
  return { type: 'application/ld+json', innerHTML: JSON.stringify(graph) }
}
