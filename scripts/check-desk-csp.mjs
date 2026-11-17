/**
 * Does the 3D desk actually load under the live site's Content-Security-Policy?
 *
 *   npm run generate && python -m http.server 3124 -d .output/public
 *   npm run check:desk            # or: node scripts/check-desk-csp.mjs <url>
 *
 * The CSP is not in this repo: Cloudflare adds it as a response header, and a
 * local server sends none. So a desk that needed blob: textures and a Draco
 * blob: worker loaded fine here and sat at 100% with no model in production.
 * This replays the production header onto local HTML and fails if the scene
 * never becomes ready or the console logs an error, in both themes. If the
 * Cloudflare policy changes, copy the new header into CSP below.
 */
import { chromium } from 'playwright'

const CSP =
  "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com https://code.jquery.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none';"

const url = process.argv[2] || 'http://127.0.0.1:3124/'
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu'] })
let failed = false

/** python's http.server drops connections under a burst of requests; retry a few times. */
async function fetchRetry(route) {
  for (let i = 0; ; i++) {
    try {
      return await route.fetch()
    } catch (e) {
      if (i >= 4) throw e
      await new Promise((r) => setTimeout(r, 200 * (i + 1)))
    }
  }
}

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme })
  await ctx.route('**/*', async (route) => {
    const r = await fetchRetry(route)
    const headers = { ...r.headers() }
    if ((headers['content-type'] || '').includes('text/html')) headers['content-security-policy'] = CSP
    await route.fulfill({ response: r, headers })
  })
  const page = await ctx.newPage()
  const log = []
  page.on('console', (m) => m.type() === 'error' && log.push('console.error: ' + m.text().slice(0, 200)))
  page.on('pageerror', (e) => log.push('pageerror: ' + String(e).slice(0, 200)))
  await page.goto(url, { waitUntil: 'load' })
  const ready = await page
    .waitForFunction(() => document.querySelector('.dk.is-ready'), null, { timeout: 30000 })
    .then(() => true, () => false)
  const pass = ready && !log.length
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${theme}: desk ${ready ? 'ready' : 'never ready'}`)
  for (const l of log) console.log('      ' + l)
  if (!pass) failed = true
  await ctx.close()
}

await browser.close()
process.exit(failed ? 1 : 0)
