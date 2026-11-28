/**
 * The contact card behind /card/: a vCard per language and the QR codes that
 * open the page. Run after changing a name, title, email or link in
 * content/site.yml or content/about.yml, and commit what it writes:
 *
 *   node scripts/make-card.mjs
 *
 *   public/card/ju-shen-huang.vcf      Chinese contact (黃鉅燊, 斐闊 Finctory)
 *   public/card/ju-shen-huang-en.vcf   English contact (Ju-Shen Huang, Finctory)
 *   public/card/qr.svg, qr-en.svg      QR codes for /card/ and /en/card/
 *   public/card/card.jpg, card-en.jpg  the card as a picture (scripts/og/card.html)
 *
 * The card is public, so it carries only what the site already shows: no
 * phone number, no address. The photo is public/card/photo.jpg (320 px).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import YAML from 'yaml'
import QRCode from 'qrcode'
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'

const read = (f) => YAML.parse(readFileSync(f, 'utf8'))
const site = read('content/site.yml')
const about = read('content/about.yml')
const en = read('content/en.yml')

const SITE = 'https://www.ogmatcha.com'
const { contact, person } = site
const photo = readFileSync('public/card/photo.jpg').toString('base64')

// vCard text: escape , ; \ and newlines; lines end in CRLF; the photo is
// folded at 75 characters with a leading space (RFC 2426 / 6350).
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n')
const fold = (line) => line.match(/.{1,74}/g).join('\r\n ')

function vcard({ n, fn, nick, org, title, note, lang }) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${n.map(esc).join(';')};;;`,
    `FN:${esc(fn)}`,
    `NICKNAME:${nick.map(esc).join(',')}`,
    `ORG:${esc(org)}`,
    `TITLE:${esc(title)}`,
    `EMAIL;TYPE=INTERNET,PREF:${contact.email}`,
    `URL:${SITE}${lang === 'en' ? '/en/' : '/'}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${contact.linkedin}`,
    `X-SOCIALPROFILE;TYPE=github:${contact.github}`,
    `X-SOCIALPROFILE;TYPE=instagram:${contact.instagram}`,
    `NOTE:${esc(note)}`,
    fold(`PHOTO;ENCODING=b;TYPE=JPEG:${photo}`),
    'END:VCARD',
  ]
  return lines.join('\r\n') + '\r\n'
}

const [p0] = about.posts
const [e0] = en.posts
// The note carries the rest of the card page: every current post, the
// degree, what to talk about and the city. The GPA as site.yml states it.
const gpa = site.now.find((n) => /GPA/.test(n.detail ?? ''))?.detail.match(/GPA [\d.]+ \/ [\d.]+/)?.[0] ?? ''
const noteZh = [
  ...about.posts.map((p) => `${p.org} ${p.role}`),
  `中央大學資訊管理學系碩士班（2026.09 起；學士 ${gpa}）`,
  `業務範圍：${site.open.join('、')}`,
  `${person.location}`,
  `${SITE}/`,
].join('\n')
const noteEn = [
  ...en.posts.map((p, i) => `${p.role}, ${about.posts[i].orgEn}`),
  `Master’s student, Information Management, National Central University (from Sept 2026; BS ${gpa})`,
  `What I take on: ${en.open.join('; ')}`,
  'Taoyuan, Taiwan',
  `${SITE}/en/`,
].join('\n')
writeFileSync(
  'public/card/ju-shen-huang.vcf',
  vcard({
    n: [person.nameZh.slice(0, 1), person.nameZh.slice(1)],
    fn: person.nameZh,
    nick: [person.nameEn, person.handle],
    org: p0.org,
    title: p0.role,
    note: noteZh,
    lang: 'zh',
  })
)
writeFileSync(
  'public/card/ju-shen-huang-en.vcf',
  vcard({
    n: ['Huang', 'Ju-Shen'],
    fn: person.nameEn,
    nick: [person.nameZh, person.handle],
    org: e0.org,
    title: e0.role,
    note: noteEn,
    lang: 'en',
  })
)

// Dark modules on a transparent ground: the page puts the code on paper.
for (const [file, url] of [['qr.svg', `${SITE}/card/?src=qr`], ['qr-en.svg', `${SITE}/en/card/?src=qr`]]) {
  const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#14161dff', light: '#0000' } })
  writeFileSync(`public/card/${file}`, svg)
}
// The card as a picture, to keep in a phone's photos or send in a chat. Its
// code carries ?src=img, so a swap that came from a forwarded picture says so.
const b = await chromium.launch({ channel: 'chrome' })
for (const lang of ['zh', 'en']) {
  const E = lang === 'en'
  const qr = await QRCode.toString(`${SITE}${E ? '/en' : ''}/card/?src=img`, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#14161dff', light: '#0000' } })
  const CARD = {
    lang,
    handle: person.handle,
    name: E ? person.nameEn : person.nameZh,
    alt: E ? person.nameZh : person.nameEn,
    roles: E
      ? [...en.posts.map((p, i) => ({ org: about.posts[i].orgEn, role: p.role })), { org: 'National Central University', role: 'MS student' }]
      : [...about.posts.map((p) => ({ org: p.org, role: p.role.replace(/（.*?）/, '') })), { org: '中央大學 資訊管理學系', role: '碩士班' }],
    servicesLabel: E ? 'What I take on' : '業務範圍',
    services: E ? en.open : site.open,
    email: contact.email,
    site: `ogmatcha.com${E ? '/en/card/' : '/card/'}`,
    scan: E ? 'Scan to keep this card' : '掃描存下這張名片',
    scanNote: E ? 'Email' : 'Email',
    photo: `data:image/jpeg;base64,${photo}`,
    qr: `data:image/svg+xml;base64,${Buffer.from(qr).toString('base64')}`,
  }
  const page = await b.newPage({ viewport: { width: 1080, height: 1350 } })
  await page.addInitScript((c) => (window.CARD = c), CARD)
  await page.goto(pathToFileURL('scripts/og/card.html').href)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `public/card/card${E ? '-en' : ''}.jpg`, type: 'jpeg', quality: 88 })
  await page.close()
}
await b.close()
console.log('card: 2 vCards, 2 QR codes, 2 pictures')
