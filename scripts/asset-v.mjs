/**
 * Content versions for the files under public/desk, fonts, images and media.
 *
 * GitHub Pages stamps every file with the deploy time, so after each deploy a
 * returning visitor re-downloaded all 3.8 MB even when nothing in them had
 * changed. With a hash of its content in every URL (`?v=1a2b3c4d`) these files
 * can be cached for a year (a Cloudflare cache rule matches the `v=`): a new
 * file gets a new URL, an unchanged one keeps its old one.
 *
 * nuxt.config.ts hands the table to the app (utils/asset.ts) and rewrites the
 * font stylesheets' url()s in the build output, where they are plain files.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const hash = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
}

/** url(/fonts/x.woff2) -> url(/fonts/x.woff2?v=...) */
export function versionCss(css, table) {
  return css.replace(/url\((\/fonts\/[^)?]+)\)/g, (m, u) => (table[u] ? `url(${u}?v=${table[u]})` : m))
}

/** { '/desk/poster-day.webp': '1a2b3c4d', '/fonts/latin.css': ..., ... } */
export function assetVersions(root) {
  const pub = path.join(root, 'public')
  const table = {}
  for (const dir of ['desk', 'fonts', 'images', 'media']) {
    for (const f of walk(path.join(pub, dir))) {
      if (f.endsWith('.css')) continue
      table['/' + path.relative(pub, f).split(path.sep).join('/')] = hash(fs.readFileSync(f))
    }
  }
  // A stylesheet's version covers the fonts it names, as it will be shipped.
  for (const f of fs.readdirSync(path.join(pub, 'fonts')).filter((n) => n.endsWith('.css'))) {
    table[`/fonts/${f}`] = hash(versionCss(fs.readFileSync(path.join(pub, 'fonts', f), 'utf8'), table))
  }
  return table
}
