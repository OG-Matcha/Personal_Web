// Builds the downloadable CV from content/cv.yml:
//   public/content/ju-shen-huang-cv-zh.pdf
//   public/content/ju-shen-huang-cv-en.pdf  (also copied to 'Ju-Shen Huang CV.pdf', the old address)
// Run: node scripts/build-cv.mjs   (needs a local Chrome; Playwright drives it)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import yaml from 'js-yaml'
import { chromium } from 'playwright'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const data = yaml.load(fs.readFileSync(path.join(root, 'content/cv.yml'), 'utf8'))
const outDir = path.join(root, 'public/content')
const fontUrl = pathToFileURL(path.join(root, 'public/fonts')).href

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function html(lang, d) {
  const L = d.labels
  const en = lang === 'en'
  const site = en ? 'ogmatcha.com/en' : 'ogmatcha.com'
  // A heading never ends a page alone: it is kept together with the first entry under it.
  const sec = (title, body) => {
    const [first, ...rest] = Array.isArray(body) ? body : [body]
    return `<section><div class="keep"><h2>${esc(title)}</h2>${first}</div>${rest.join('')}</section>`
  }
  const rows = (items, fn) => items.map(fn)

  const experience = rows(
    d.experience,
    (e) => `<article class="job">
      <header><h3>${esc(e.org)}<span class="role">${esc(e.role)}</span></h3><time>${esc(e.when)}</time></header>
      <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </article>`
  )
  const education = rows(
    d.education,
    (e) => `<article class="item"><header><h3>${esc(e.school)}</h3><time>${esc(e.when)}</time></header><p>${esc(e.note)}</p></article>`
  )
  const research = rows(
    d.research,
    (r) => `<article class="item"><header><h3>${esc(r.title)}</h3><time>${esc(r.when)}</time></header><p>${esc(r.note)}</p></article>`
  )
  const awards = `<ul class="list">${rows(d.awards, (a) => `<li><time>${esc(a.when)}</time><span>${esc(a.title)}</span></li>`).join('')}</ul><p class="more">${esc(d.awardsMore)}</p>`
  const leadership = `<ul class="list">${rows(d.leadership, (a) => `<li><time>${esc(a.when)}</time><span><b>${esc(a.title)}</b> · ${esc(a.note)}</span></li>`).join('')}</ul>`
  const skills = `<dl class="skills">${rows(d.skills, (s) => `<dt>${esc(s.label)}</dt><dd>${esc(s.items)}</dd>`).join('')}</dl><p class="certs"><b>${esc(L.certs)}</b> ${esc(d.certs)}</p>`

  return `<!doctype html><html lang="${en ? 'en' : 'zh-Hant-TW'}"><head><meta charset="utf-8"><title>${esc(d.name)} CV</title>
<style>
@font-face { font-family: 'Archivo'; src: url('${fontUrl}/archivo-var-000.woff2') format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@page { size: A4; margin: 14mm 15mm 14mm; }
:root { --ink: #16181d; --ink2: #464b55; --ink3: #7a808c; --rule: #dfe2e7; --pop: #c2410c; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: ${en ? "'Archivo', 'Noto Sans TC'" : "'Noto Sans TC', 'Archivo'"}, sans-serif; color: var(--ink); font-size: ${en ? '9.1pt' : '9.2pt'}; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.top { display: grid; grid-template-columns: 1fr auto; gap: 4mm 8mm; align-items: end; padding-bottom: 4mm; border-bottom: 1.4pt solid var(--ink); }
.name { font-family: 'Archivo', 'Noto Sans TC', sans-serif; font-size: 25pt; font-weight: 800; line-height: 1; letter-spacing: ${en ? '-0.01em' : '0.04em'}; }
.alt { margin-left: 3mm; font-size: 10pt; font-weight: 500; color: var(--ink3); letter-spacing: 0; }
.role { display: block; margin-top: 2mm; font-size: 9.6pt; color: var(--ink2); font-weight: 500; }
.contact { text-align: right; font-size: 8.4pt; line-height: 1.6; color: var(--ink2); }
.contact a { color: inherit; text-decoration: none; }
.summary { margin-top: 4mm; font-size: 9.6pt; color: var(--ink); max-width: 100%; }
section { margin-top: 5mm; }
h2 { font-family: 'Archivo', 'Noto Sans TC', sans-serif; font-size: 8.4pt; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--pop); padding-bottom: 1.2mm; border-bottom: 0.6pt solid var(--rule); margin-bottom: 2.4mm; }
h3 { font-size: 9.8pt; font-weight: 700; }
h3 .role { display: inline; margin: 0 0 0 2.4mm; font-size: 9pt; font-weight: 500; }
header { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; }
time { flex: none; font-size: 8.4pt; color: var(--ink3); font-variant-numeric: tabular-nums; white-space: nowrap; }
.job, .item, .keep { break-inside: avoid; }
.keep > h2 + .job, .keep > h2 + .item { margin-top: 0; }
.job + .job, .item + .item { margin-top: 2.8mm; }
.job ul { margin-top: 1mm; padding-left: 4mm; color: var(--ink2); }
.job li + li { margin-top: 0.6mm; }
.job li::marker { color: var(--ink3); }
.item p { margin-top: 0.6mm; color: var(--ink2); }
.list { list-style: none; }
.list li { display: grid; grid-template-columns: ${en ? '17mm' : '26mm'} 1fr; gap: 3mm; break-inside: avoid; }
.list li + li { margin-top: 0.9mm; }
.list li span { color: var(--ink2); }
.list b { color: var(--ink); font-weight: 600; }
.more { margin-top: 1.4mm; font-size: 8.4pt; color: var(--ink3); }
.skills { display: grid; grid-template-columns: ${en ? '30mm' : '22mm'} 1fr; gap: 0.9mm 3mm; }
.skills dt { font-weight: 600; }
.skills dd { color: var(--ink2); }
.certs { margin-top: 2mm; color: var(--ink2); }
.certs b { color: var(--ink); font-weight: 600; margin-right: 2mm; }
.foot { margin-top: 5mm; padding-top: 2mm; border-top: 0.6pt solid var(--rule); font-size: 7.8pt; color: var(--ink3); display: flex; justify-content: space-between; }
</style></head><body>
<div class="top">
  <div><h1 class="name">${esc(d.name)}<span class="alt">${esc(d.alt)}</span></h1><p class="role">${d.role.split(' · ').map(esc).join('<br>')}</p></div>
  <p class="contact"><a href="mailto:jushenhuang.jason@gmail.com">jushenhuang.jason@gmail.com</a><br><a href="https://www.${site}">${site}</a> · <a href="https://github.com/OG-Matcha">github.com/OG-Matcha</a><br><a href="https://www.linkedin.com/in/ogmatcha/">linkedin.com/in/ogmatcha</a> · ${esc(d.location)}</p>
</div>
<p class="summary">${esc(d.summary)}</p>
${sec(L.experience, experience)}
${sec(L.education, education)}
${sec(L.research, research)}
${sec(L.awards, awards)}
${sec(L.leadership, leadership)}
${sec(L.skills, skills)}
<p class="foot"><span>${esc(L.updated)} ${esc(String(data.updated).replace('-', '.'))}</span><span>${esc(L.site)}${en ? ': ' : '：'}<a href="https://www.${site}/resume/" style="color:inherit">${site}/resume</a></span></p>
</body></html>`
}

const browser = await chromium.launch({ channel: 'chrome' })
try {
  for (const lang of ['zh', 'en']) {
    const page = await browser.newPage()
    const tmp = path.join(outDir, `.cv-${lang}.html`)
    fs.writeFileSync(tmp, html(lang, data[lang]))
    await page.goto(pathToFileURL(tmp).href)
    await page.evaluate(() => document.fonts.ready)
    const out = path.join(outDir, `ju-shen-huang-cv-${lang}.pdf`)
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true })
    const pages = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / ((297 - 28) * 3.7795)))
    console.log(`${path.relative(root, out)}  ~${pages} page(s)`)
    // The old address (linked from outside before 2026-11) keeps working and serves the current English CV.
    if (lang === 'en') fs.copyFileSync(out, path.join(outDir, 'Ju-Shen Huang CV.pdf'))
    fs.rmSync(tmp)
    await page.close()
  }
} finally {
  await browser.close()
}
