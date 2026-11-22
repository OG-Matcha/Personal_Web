// Live store figures for the case pages: GET /api/store/<slug> returns the Chrome Web Store's
// own user count and rating for that extension. The store has no API and no CORS, so this
// Worker reads the public listing page and keeps the answer for six hours; the page shows the
// number written at build time until this answers, so a failure here only means older numbers.
const EXTENSIONS = { taobao: 'neikbgpobachnkgcefcmedgojmedbfmk' }
const TTL = 6 * 3600

const json = (o, status = 200, maxAge = TTL) => new Response(JSON.stringify(o), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': `public, max-age=${maxAge}`,
    // Public figures, read-only: any page may show them (the local dev server included).
    'access-control-allow-origin': '*',
  },
})

// 「4.8 ( 5 個評分 ) … 278 使用者」 once tags are gone.
export function parse(html) {
  const text = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
  const users = text.match(/([\d,]+)\s*(?:位)?使用者/)
  const rating = text.match(/(\d(?:\.\d)?)\s*\(\s*([\d,]+)\s*個評分\s*\)/)
  if (!users) return null
  return {
    users: +users[1].replace(/,/g, ''),
    rating: rating ? +rating[1] : null,
    ratings: rating ? +rating[2].replace(/,/g, '') : null,
  }
}

export default {
  async fetch(req, env, ctx) {
    if (req.method !== 'GET') return new Response('method not allowed', { status: 405 })
    const slug = new URL(req.url).pathname.split('/').pop()
    const id = EXTENSIONS[slug]
    if (!id) return json({ error: 'unknown' }, 404, 3600)
    const key = new Request(`https://store-cache/${slug}`)
    const hit = await caches.default.match(key)
    if (hit) return hit
    let res
    try {
      const page = await fetch(`https://chromewebstore.google.com/detail/${id}?hl=zh-TW`, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; ogmatcha-store-stats)', 'accept-language': 'zh-TW' },
      })
      const got = page.ok ? parse(await page.text()) : null
      res = got ? json({ ...got, at: new Date().toISOString(), source: `https://chromewebstore.google.com/detail/${id}` }) : json({ error: 'unreadable' }, 502, 600)
    } catch {
      res = json({ error: 'unreachable' }, 502, 600)
    }
    if (res.ok) ctx.waitUntil(caches.default.put(key, res.clone()))
    return res
  },
}
