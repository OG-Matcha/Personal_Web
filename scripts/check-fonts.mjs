/**
 * Every Chinese character on the site should be in the subset webfont.
 *
 *   npm run check:fonts
 *
 * public/fonts/notosanstc-{0,1}.woff2 hold only the characters that were in
 * the sources when scripts/subset-cjk.py last ran (listed in cjk-chars.txt).
 * A character added since then still shows, in the visitor's system font,
 * which looks like a typo in the middle of a heading. This lists them;
 * rerun `python scripts/subset-cjk.py` to fold them in.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const have = new Set(fs.readFileSync(path.join(root, 'public/fonts/cjk-chars.txt'), 'utf8'))
const dirs = ['content', 'components', 'pages', 'layouts', 'composables', 'utils']
const files = ['app.vue', 'error.vue', 'nuxt.config.ts']
const walk = (d) =>
  fs.existsSync(d)
    ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
    : []
const all = [...dirs.flatMap((d) => walk(path.join(root, d))), ...files.map((f) => path.join(root, f)).filter(fs.existsSync)]

// CJK ideographs, kana, full-width forms: what the subset is meant to cover.
const cjk = /[　-〿㐀-鿿豈-﫿＀-￯]/u
const missing = new Map()
for (const f of all) {
  for (const c of fs.readFileSync(f, 'utf8')) {
    if (cjk.test(c) && !have.has(c)) missing.set(c, path.relative(root, f))
  }
}
if (!missing.size) {
  console.log(`PASS  all Chinese characters are in the webfont (${have.size} in subset)`)
} else {
  console.log(`FAIL  ${missing.size} characters are not in the webfont; run: python scripts/subset-cjk.py`)
  for (const [c, f] of missing) console.log(`      ${c}  ${f}`)
  process.exit(1)
}
