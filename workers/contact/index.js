// The contact box for www.ogmatcha.com and oshi.ogmatcha.com: a form posts here and the
// message lands in the owner's private Discord channel. The webhook URL is a Worker
// secret (DISCORD_WEBHOOK), never in this repository.
//
// Guards, cheapest first: an origin allowlist, a hidden field bots fill in, a minimum
// time on the page, a per-IP rate limit, size limits, and mentions switched off so a
// message cannot ping anyone.
const ORIGINS = new Set([
  'https://www.ogmatcha.com', 'https://ogmatcha.com', 'https://oshi.ogmatcha.com',
  'http://localhost:3140', 'http://127.0.0.1:3140', 'http://127.0.0.1:3150', 'http://localhost:3150',
])
const SITES = { ogmatcha: { name: '個人網站', color: 0x2f6b4f }, oshi: { name: '推し看板', color: 0xd42c66 } }
const TOPICS = new Set(['work', 'hello', 'missing', 'wrong', 'idea', 'other'])
const TOPIC_ZH = { work: '合作／工作', hello: '打招呼', missing: '漏了活動', wrong: '資料有錯', idea: '建議', other: '其他' }

const cors = (origin) => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
  vary: 'origin',
})

const clip = (s, n) => (typeof s === 'string' ? s.trim().slice(0, n) : '')

export default {
  async fetch(req, env) {
    const origin = req.headers.get('origin') || ''
    if (!ORIGINS.has(origin)) return new Response('forbidden', { status: 403 })
    const reply = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', ...cors(origin) } })
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
    if (req.method !== 'POST') return reply({ error: 'method' }, 405)

    const ip = req.headers.get('cf-connecting-ip') || 'unknown'
    const { success } = await env.LIMIT.limit({ key: ip })
    if (!success) return reply({ error: 'slow_down' }, 429)

    const raw = await req.text()
    if (raw.length > 12000) return reply({ error: 'too_large' }, 413)
    let b
    try { b = JSON.parse(raw) } catch { return reply({ error: 'bad_request' }, 400) }

    // Bots: a filled hidden field, or a form sent within two seconds of loading. Answer as
    // if it worked so they learn nothing.
    if (b.website || !(Number(b.elapsed) >= 2000)) return reply({ ok: true })

    const site = SITES[b.site] ? b.site : 'ogmatcha'
    const topic = TOPICS.has(b.topic) ? b.topic : 'other'
    const message = clip(b.message, 3000)
    if (message.length < 2) return reply({ error: 'empty' }, 400)
    const name = clip(b.name, 80)
    const contact = clip(b.contact, 160)
    const about = clip(b.about, 200)
    const page = clip(b.page, 300)

    if (!env.DISCORD_WEBHOOK) return reply({ error: 'not_configured' }, 503)
    const fields = [
      { name: '名字', value: name || '（沒填）', inline: true },
      { name: '怎麼回覆', value: contact || '（沒留）', inline: true },
    ]
    if (about) fields.push({ name: '關於', value: about })
    if (page) fields.push({ name: '從哪頁送出', value: page })
    fields.push({ name: '來源', value: `${(req.cf?.country || '?')}・${(req.headers.get('user-agent') || '').slice(0, 90)}` })
    const res = await fetch(env.DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: `${SITES[site].name}・訊息`,
        allowed_mentions: { parse: [] },
        embeds: [{ title: TOPIC_ZH[topic], description: message, color: SITES[site].color, fields, timestamp: new Date().toISOString() }],
      }),
    })
    if (!res.ok) return reply({ error: 'deliver_failed' }, 502)
    return reply({ ok: true })
  },
}
