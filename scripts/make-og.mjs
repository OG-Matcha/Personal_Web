/**
 * Share cards (og:image), 1200x630, the size Facebook, LINE and X crop to.
 *
 *   node scripts/make-og.mjs
 *
 * - scripts/og/site.html -> public/images/og/site.jpg: the pages without a
 *   picture of their own (home, resume, portfolio, contact).
 * - scripts/og/work.html, once per product and language ->
 *   public/images/og/<slug>-card.jpg and <slug>-card-en.jpg: the product's
 *   name, tagline and the owner's role beside its screen
 *   (scripts/og/shots/<slug>.jpg). A bare screenshot said neither what the
 *   product was nor whose it was.
 */
import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { parse } from 'yaml'
import { loadDefaultTraditionalChineseParser } from 'budoux'

// Chinese lines break only between phrases (BudouX, as on the site): a zero
// width space after each phrase, and word-break: keep-all in the card.
const budoux = loadDefaultTraditionalChineseParser()
const phrases = (t) => budoux.parse(t).join(String.fromCharCode(0x200b))

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT = join(ROOT, 'public', 'images', 'og')
const en = parse(readFileSync(join(ROOT, 'content', 'en.yml'), 'utf8')).works ?? {}

const jobs = [{ file: 'site.html', query: '', out: 'site.jpg' }]
for (const slug of readdirSync(join(HERE, 'og', 'shots')).map((f) => f.replace(/\.jpg$/, ''))) {
  const w = parse(readFileSync(join(ROOT, 'content', 'work', `${slug}.yml`), 'utf8'))
  const e = en[slug] ?? {}
  const zh = { title: w.title, tagline: phrases(w.tagline), who: '黃鉅燊', role: w.role, shot: slug }
  const enq = { title: e.title ?? w.title, tagline: e.tagline ?? w.tagline, who: 'Ju-Shen Huang', role: e.role ?? w.role, shot: slug, lang: 'en' }
  jobs.push({ file: 'work.html', query: `?${new URLSearchParams(zh)}`, out: `${slug}-card.jpg` })
  jobs.push({ file: 'work.html', query: `?${new URLSearchParams(enq)}`, out: `${slug}-card-en.jpg` })
}

const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
for (const j of jobs) {
  await p.goto(pathToFileURL(join(HERE, 'og', j.file)).href + j.query, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(400)
  const bad = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'error').map((f) => f.family))
  if (bad.length) { console.error(j.out, 'fonts failed:', bad); process.exit(1) }
  // Every line must stay on the card: a long English tagline must not run off it.
  const over = await p.evaluate(() => [...document.querySelectorAll('.txt > *')].some((e) => { const r = e.getBoundingClientRect(); return r.bottom > 610 || r.top < 20 }))
  if (over) { console.error(j.out, 'text runs off the card'); process.exit(1) }
  const out = join(OUT, j.out)
  await p.screenshot({ path: out, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } })
  console.log(`${j.out} ${Math.round(statSync(out).size / 1024)} KB`)
}
await b.close()
