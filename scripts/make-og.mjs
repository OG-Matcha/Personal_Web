/**
 * The site's share card: scripts/og/site.html -> public/images/og/site.jpg
 * (1200x630, the size Facebook, LINE and X crop to). Rendered at 2x and
 * scaled down by the browser's JPEG encoder at 1x clip.
 *
 *   node scripts/make-og.mjs
 */
import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { statSync } from 'node:fs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '..', 'public', 'images', 'og', 'site.jpg')
const b = await chromium.launch({ channel: 'chrome' })
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await p.goto(pathToFileURL(join(HERE, 'og', 'site.html')).href, { waitUntil: 'networkidle' })
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(600)
const missing = await p.evaluate(() => [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => f.family))
if (missing.length) { console.error('fonts not loaded:', missing); process.exit(1) }
await p.screenshot({ path: OUT, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } })
await b.close()
console.log(`${OUT} ${Math.round(statSync(OUT).size / 1024)} KB`)
