/**
 * Case-study covers, authored in HTML and exported as images.
 *
 *   node scripts/make-covers.mjs [slug ...]
 *
 * They cannot simply be components: `w.cover` feeds three things that all need
 * a real file - the `<img>` on the card, the og:image, and the film, whose
 * sampler reads the picture's pixels to build a point cloud (gl/mosaic.js).
 * So they are designed in scripts/covers/*.html, against the same fonts and
 * tokens as the site, and rendered here.
 *
 * Editing one is editing its HTML and re-running this. The output is
 * committed, so a normal build never has to run a browser.
 */
import { chromium } from 'playwright'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, 'covers')
const OUT = resolve(HERE, '..', 'public', 'images')

/** 16:9. The cards crop to 16:9 and 21:9, both centred. */
const WIDTH = 1600
const HEIGHT = 900

const wanted = process.argv.slice(2)
const pages = readdirSync(SRC)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !wanted.length || wanted.includes(f.replace('.html', '')))

if (!pages.length) {
  console.error(`no cover templates matched${wanted.length ? `: ${wanted.join(', ')}` : ''}`)
  process.exit(1)
}

const browser = await chromium.launch()
// Rendered at 2x and written at 1600x900, so the type is resampled down rather
// than drawn at its final size - which is the difference between crisp and
// merely sharp on a display that is showing it at 1600 anyway.
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
})

for (const file of pages) {
  const slug = file.replace('.html', '')
  await page.goto(pathToFileURL(join(SRC, file)).href, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  // The web fonts land after `fonts.ready` resolves often enough to matter at
  // this size, and a cover exported in the fallback face is not obviously
  // wrong until it is next to one that is not.
  await page.waitForTimeout(600)

  const shot = await page.screenshot({ clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } })

  // WebP only, and through the same browser, so there is no image dependency
  // to install. The PNG is ten times the size for no visible difference on a
  // flat-coloured cover, and it would be the thing that ships.
  const webp = join(OUT, `${slug}-cover.webp`)
  const data = await page.evaluate(
    ([b64, w, h]) =>
      new Promise((res) => {
        const img = new Image()
        img.onload = () => {
          const c = document.createElement('canvas')
          c.width = w
          c.height = h
          c.getContext('2d').drawImage(img, 0, 0, w, h)
          res(c.toDataURL('image/webp', 0.92).split(',')[1])
        }
        img.src = 'data:image/png;base64,' + b64
      }),
    [shot.toString('base64'), WIDTH, HEIGHT]
  )
  writeFileSync(webp, Buffer.from(data, 'base64'))

  console.log(`${slug}  ${Math.round(statSync(webp).size / 1024)} kB webp`)
}

await browser.close()
