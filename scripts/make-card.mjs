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
 *
 * The card is public, so it carries only what the site already shows: no
 * phone number, no address. The photo is public/card/photo.jpg (320 px).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import YAML from 'yaml'
import QRCode from 'qrcode'

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

const [p0, p1] = about.posts
const [e0, e1] = en.posts
writeFileSync(
  'public/card/ju-shen-huang.vcf',
  vcard({
    n: [person.nameZh.slice(0, 1), person.nameZh.slice(1)],
    fn: person.nameZh,
    nick: [person.nameEn, person.handle],
    org: p0.org,
    title: p0.role,
    note: `${p0.org} ${p0.role}；${p1.org} ${p1.role}。${SITE}/`,
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
    note: `${e0.role}, ${e0.org}. ${e1.role}, ${e1.org}. ${SITE}/en/`,
    lang: 'en',
  })
)

// Dark modules on a transparent ground: the page puts the code on paper.
for (const [file, url] of [['qr.svg', `${SITE}/card/?src=qr`], ['qr-en.svg', `${SITE}/en/card/?src=qr`]]) {
  const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#14161dff', light: '#0000' } })
  writeFileSync(`public/card/${file}`, svg)
}
console.log('card: 2 vCards, 2 QR codes')
