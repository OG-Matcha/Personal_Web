/**
 * Read-only Search Console report for www.ogmatcha.com.
 *
 *   node scripts/gsc.mjs sites                 which properties the key can see
 *   node scripts/gsc.mjs queries [days]        top queries: clicks, impressions, CTR, position
 *   node scripts/gsc.mjs pages [days]          the same, per page
 *   node scripts/gsc.mjs inspect [url ...]     index status of each URL (default: every page in the sitemap)
 *   node scripts/gsc.mjs sitemaps              sitemaps Google has, when it last read them, and errors
 *   node scripts/gsc.mjs submit                resubmit /sitemap.xml (writes need a full user)
 *   node scripts/gsc.mjs drop <sitemap url>    remove a stale sitemap from the property
 *
 * Auth is a service account added to the property as a restricted user. The
 * key never lives in this repo: point GSC_KEY at it (default
 * ~/.config/gsc/key.json). GSC_SITE picks the property, default the domain
 * property sc-domain:ogmatcha.com. No dependencies: the JWT is signed with
 * node:crypto. Scope is webmasters.readonly, so this can only read.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createSign } from 'node:crypto'

const KEY = process.env.GSC_KEY || join(homedir(), '.config', 'gsc', 'key.json')
const SITE = process.env.GSC_SITE || 'sc-domain:ogmatcha.com'
const ORIGIN = 'https://www.ogmatcha.com'

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url')

async function token(write = false) {
  const key = JSON.parse(readFileSync(KEY, 'utf8'))
  const now = Math.floor(Date.now() / 1000)
  const claims = { iss: key.client_email, scope: `https://www.googleapis.com/auth/webmasters${write ? '' : '.readonly'}`, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }
  const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url(claims)}`
  const sig = createSign('RSA-SHA256').update(unsigned).sign(key.private_key).toString('base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  })
  const j = await r.json()
  if (!j.access_token) throw new Error(`token: ${JSON.stringify(j)}`)
  return j.access_token
}

async function api(tok, url, body, method) {
  const r = await fetch(url, {
    method: method ?? (body ? 'POST' : 'GET'),
    headers: { authorization: `Bearer ${tok}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await r.text()
  const j = text ? JSON.parse(text) : {}
  if (!r.ok) throw new Error(`${r.status} ${url}: ${JSON.stringify(j.error ?? j)}`)
  return j
}

const day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10)

async function analytics(tok, dim, days) {
  // Search Console data lags about two days; end there so the last days are not falsely empty.
  const j = await api(tok, `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    startDate: day(days + 2),
    endDate: day(2),
    dimensions: [dim],
    rowLimit: 100,
  })
  const rows = j.rows ?? []
  console.log(`${dim} · ${day(days + 2)} → ${day(2)} · ${rows.length} rows`)
  console.log('clicks  impr    ctr     pos    ' + dim)
  for (const r of rows) {
    console.log(
      `${String(r.clicks).padEnd(8)}${String(r.impressions).padEnd(8)}${(r.ctr * 100).toFixed(1).padStart(5)}%  ${r.position.toFixed(1).padStart(5)}  ${r.keys[0]}`
    )
  }
}

async function sitemapUrls() {
  // Cloudflare turns away plain scripted requests, so fall back to the last local build.
  let xml = ''
  try {
    const r = await fetch(`${ORIGIN}/sitemap.xml`)
    if (r.ok) xml = await r.text()
  } catch {}
  if (!xml.includes('<loc>')) xml = readFileSync(new URL('../.output/public/sitemap.xml', import.meta.url), 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

async function inspect(tok, urls) {
  if (!urls.length) urls = await sitemapUrls()
  for (const u of urls) {
    const j = await api(tok, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: SITE })
    const s = j.inspectionResult?.indexStatusResult ?? {}
    console.log(`${(s.coverageState ?? s.verdict ?? '?').padEnd(42)} last crawl ${s.lastCrawlTime?.slice(0, 10) ?? '—'}  ${u}`)
  }
}

const [cmd = 'queries', ...rest] = process.argv.slice(2)
const tok = await token(cmd === 'submit' || cmd === 'drop')
const SM = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`
if (cmd === 'sites') console.log(JSON.stringify(await api(tok, 'https://www.googleapis.com/webmasters/v3/sites'), null, 2))
else if (cmd === 'queries') await analytics(tok, 'query', Number(rest[0]) || 90)
else if (cmd === 'pages') await analytics(tok, 'page', Number(rest[0]) || 90)
else if (cmd === 'inspect') await inspect(tok, rest)
else if (cmd === 'sitemaps') {
  for (const m of (await api(tok, SM)).sitemap ?? [])
    console.log(`${m.path}  submitted ${m.lastSubmitted?.slice(0, 10)}  read ${m.lastDownloaded?.slice(0, 10)}  errors ${m.errors} warnings ${m.warnings}  ${(m.contents ?? []).map((c) => `${c.type}:${c.submitted}`).join(' ')}`)
} else if (cmd === 'submit') {
  await api(tok, `${SM}/${encodeURIComponent(`${ORIGIN}/sitemap.xml`)}`, null, 'PUT')
  console.log('resubmitted', `${ORIGIN}/sitemap.xml`)
} else if (cmd === 'drop' && rest[0]) {
  await api(tok, `${SM}/${encodeURIComponent(rest[0])}`, null, 'DELETE')
  console.log('removed', rest[0])
} else console.log('usage: node scripts/gsc.mjs sites | queries [days] | pages [days] | inspect [url ...]')
