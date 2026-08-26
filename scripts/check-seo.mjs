/**
 * SEO / structured-data regression check. Run after `npm run generate`:
 *
 *   node scripts/check-seo.mjs
 *
 * Reads `.output/public` as files - no browser, no server. Everything here
 * broke silently at least once: a page with no h1, a canonical pointing at a
 * URL that redirects back to it, a description that lost to the site-wide
 * fallback, an anonymous JSON-LD node nothing could reference, and two
 * prerendered pages that nothing on the site linked to.
 */
import { readFileSync, existsSync } from 'node:fs'

const OUT = '.output/public'
const SITE = 'https://www.ogmatcha.com'

const fails = []
const ok = (cond, msg) => {
  if (!cond) fails.push(msg)
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`)
}

if (!existsSync(`${OUT}/index.html`)) {
  console.error('no build found - run `npm run generate` first')
  process.exit(1)
}

/** route -> built file. Trailing slashes because that is what the host serves. */
const ROUTES = {
  '/': 'index.html',
  '/portfolio/': 'portfolio/index.html',
  '/resume/': 'resume/index.html',
  '/work/osave/': 'work/osave/index.html',
  '/work/medalink/': 'work/medalink/index.html',
  '/work/phishforge/': 'work/phishforge/index.html',
  '/work/finctory/': 'work/finctory/index.html',
}

const html = Object.fromEntries(
  Object.entries(ROUTES).map(([route, file]) => [route, readFileSync(`${OUT}/${file}`, 'utf8')])
)

const attr = (h, re) => (h.match(re) ?? [])[1] ?? null
const meta = (h, name) => attr(h, new RegExp(`name="${name}" content="([^"]*)"`))
const og = (h, prop) => attr(h, new RegExp(`property="${prop}" content="([^"]*)"`))

// ---------- per page ----------
const titles = new Set()
const descriptions = new Set()

for (const [route, h] of Object.entries(html)) {
  ok((h.match(/<h1[\s>]/g) ?? []).length === 1, `${route} has exactly one h1`)

  const canonical = attr(h, /rel="canonical" href="([^"]*)"/)
  ok(canonical === SITE + route, `${route} canonical is ${canonical}`)

  // A canonical without the slash points at a URL GitHub Pages 301s straight
  // back to this page, which costs a crawl hop on every route.
  ok(og(h, 'og:url') === SITE + route, `${route} og:url matches the canonical`)

  const d = meta(h, 'description')
  ok(Boolean(d) && d.length > 40, `${route} has a description (${d?.length ?? 0} chars)`)
  ok(og(h, 'og:description') === d, `${route} og:description matches the description`)
  ok(meta(h, 'twitter:description') === d, `${route} twitter:description matches`)

  const t = attr(h, /<title>([^<]*)<\/title>/)
  titles.add(t)
  descriptions.add(d)

  // A space at a fold in a folded YAML scalar lands mid-sentence in Chinese
  // and ships into the search snippet.
  ok(!/[　-〿！-｠] /.test(d ?? ''), `${route} description has no stray CJK spaces`)
}

ok(titles.size === Object.keys(ROUTES).length, `every route has a distinct title (${titles.size})`)
ok(
  descriptions.size === Object.keys(ROUTES).length,
  `every route has a distinct description (${descriptions.size})`
)

// ---------- structured data ----------
function graphOf(h) {
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
  return blocks.flatMap((m) => {
    const parsed = JSON.parse(m[1])
    return parsed['@graph'] ?? [parsed]
  })
}

for (const [route, h] of Object.entries(html)) {
  let nodes
  try {
    nodes = graphOf(h)
  } catch (e) {
    ok(false, `${route} JSON-LD parses: ${String(e).slice(0, 60)}`)
    continue
  }
  const types = nodes.map((n) => n['@type'])
  ok(types.includes('Person'), `${route} carries the Person node`)
  ok(types.includes('WebSite'), `${route} carries the WebSite node`)

  const person = nodes.find((n) => n['@type'] === 'Person')
  ok(person['@id'] === `${SITE}/#person`, `${route} Person has the shared @id`)

  const page = nodes.find((n) => String(n['@type']).endsWith('Page'))
  ok(Boolean(page), `${route} has a page-type node`)
  ok(
    Boolean(page?.mainEntity ?? page?.about),
    `${route} page node names its subject`
  )
}

const home = graphOf(html['/'])
const person = home.find((n) => n['@type'] === 'Person')
ok(!String(person.email).startsWith('mailto:'), 'Person.email is an address, not a URI')
ok(person.sameAs?.length >= 3, `Person.sameAs lists every profile (${person.sameAs?.length})`)
ok(
  typeof person.alumniOf?.department === 'object',
  'alumniOf.department is an Organization, not a bare string'
)
ok(person.worksFor?.length === 3, `every current role is in worksFor (${person.worksFor?.length})`)
ok(
  person.worksFor?.every((r) => r['@type'] === 'OrganizationRole' && r.roleName),
  'each role binds its title to its own employer'
)
ok(person.award?.length > 0, `Person.award carries the record (${person.award?.length})`)
ok(
  person.award?.every((a) => typeof a === 'string'),
  'Person.award is Text, which is its declared range'
)
ok(Boolean(person.description), 'Person has a description')

for (const slug of ['osave', 'medalink', 'phishforge', 'finctory']) {
  const nodes = graphOf(html[`/work/${slug}/`])
  ok(
    nodes.some((n) => n['@type'] === 'BreadcrumbList'),
    `/work/${slug}/ has a breadcrumb`
  )
  // finctory reuses the company's own Organization @id rather than a
  // page-local one, so match on what the page node points at.
  const page = nodes.find((n) => String(n['@type']).endsWith('Page'))
  const work = nodes.find((n) => n['@id'] && n['@id'] === page?.mainEntity?.['@id'])
  ok(Boolean(work), `/work/${slug}/ says what the page is about`)
  ok(!('image' in (work ?? {})) || Boolean(work.image), `/work/${slug}/ has no null image`)
  ok(og(html[`/work/${slug}/`], 'og:type') === 'article', `/work/${slug}/ og:type is article`)
}

// ---------- sitemap and robots ----------
const sitemap = readFileSync(`${OUT}/sitemap.xml`, 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])
ok(locs.length === Object.keys(ROUTES).length, `sitemap lists every route (${locs.length})`)
for (const route of Object.keys(ROUTES)) {
  ok(locs.includes(SITE + route), `sitemap has ${route}`)
}

const robots = readFileSync(`${OUT}/robots.txt`, 'utf8')
ok(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt points at the sitemap')
ok(!/^Disallow: \/$/m.test(robots), 'robots.txt does not block the site')

// ---------- internal linking ----------
// Both were prerendered, in the sitemap, and reachable from nowhere.
for (const [route, h] of Object.entries(html)) {
  ok(h.includes('href="/portfolio/"'), `${route} links to /portfolio/`)
  ok(h.includes('href="/resume/"'), `${route} links to /resume/`)
}

// Leaving the site and moving inside it are different actions.
for (const [route, h] of Object.entries(html)) {
  const anchors = h.match(/<a [^>]*>/g) ?? []
  const wrong = anchors.filter((a) => a.includes('target="_blank"') && /href="\/(?!\/)/.test(a))
  ok(wrong.length === 0, `${route} opens no internal link in a new tab`)
}

console.log()
if (fails.length) {
  console.log(`${fails.length} FAILURES:`)
  fails.forEach((f) => console.log(` - ${f}`))
  process.exit(1)
}
console.log('ALL SEO CHECKS PASSED')
