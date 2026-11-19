/**
 * Stills of every stop on the desk, for phones and reduced motion.
 *
 *   npm run generate && node <static server> .output/public 3124
 *   node scripts/make-desk-stills.mjs [http://127.0.0.1:3124/]
 *
 * Those visitors get no 3D: they get the walk as a row of pictures with the
 * same captions. The pictures come from the real-time scene itself, frame
 * for frame what a wide screen shows at each stop (same baked light, same
 * screens), not from a separate render that would drift from it.
 *
 * Writes public/desk/stops/<stop>-<day|night>.webp, 1200x800 (3:2), and
 * public/desk/poster-<day|night>.webp, 1600x1000, the opening frame. Run it
 * after studio/desk/ship.py, which still writes Blender's own posters there.
 * Needs Python with Pillow for the WebP encode.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const url = process.argv[2] || 'http://127.0.0.1:3124/'
const out = path.join(root, 'public/desk/stops')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-stills-'))
fs.mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--enable-gpu'] })
for (const [theme, mood] of [['light', 'day'], ['dark', 'night']]) {
  // 3:2 stage, so the stills crop the same way the stage frames each stop.
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1, colorScheme: theme })
  await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme)
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForSelector('.dk.is-ready', { timeout: 60000 })
  // Only the room: no captions, dots, header or hover tag in the picture.
  await page.addStyleTag({ content: '.dk-caps,.dk-dots,.dk-tag,.dk-veil,.hd{visibility:hidden!important}' })
  const ids = await page.$$eval('.dk-cap', (els) => els.map((e) => [...e.classList].find((c) => c.startsWith('dk-cap--')).slice(8)))
  for (let i = 0; i < ids.length; i++) {
    await page.evaluate(([i, n]) => {
      const el = document.querySelector('.dk')
      const span = el.offsetHeight - innerHeight
      scrollTo({ top: el.getBoundingClientRect().top + scrollY + (span * (i + 0.5)) / n, behavior: 'instant' })
    }, [i, ids.length])
    await page.mouse.move(0, 0)
    await page.waitForTimeout(2500) // the camera eases in
    const png = path.join(tmp, `${ids[i]}-${mood}.png`)
    await page.locator('.dk-stage').screenshot({ path: png })
    console.log(`${ids[i]}-${mood}`)
  }
  // The still under the canvas while the 3D loads (and for good on phones):
  // the opening frame at 16:10. The camera keeps its width below 16:9 and
  // shows more height, so a centred crop of this matches 16:10 and 16:9 alike.
  // A fresh page at that size: resizing this one left the camera framed for 3:2.
  await ctx.close()
  const pctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, colorScheme: theme })
  await pctx.addInitScript((t) => localStorage.setItem('theme', t), theme)
  const pp = await pctx.newPage()
  await pp.goto(url, { waitUntil: 'load' })
  await pp.waitForSelector('.dk.is-ready', { timeout: 60000 })
  await pp.addStyleTag({ content: '.dk-caps,.dk-dots,.dk-tag,.dk-veil,.hd{visibility:hidden!important}' })
  await pp.mouse.move(0, 0)
  await pp.waitForTimeout(3000)
  await pp.locator('.dk-stage').screenshot({ path: path.join(tmp, `poster-${mood}.png`) })
  await pctx.close()
}
await browser.close()

const py = `
import sys, glob, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
for p in sorted(glob.glob(os.path.join(src, '*.png'))):
    name = os.path.basename(p)[:-4]
    # The posters live one level up, where the page has always loaded them.
    o = os.path.join(os.path.dirname(dst) if name.startswith('poster-') else dst, name + '.webp')
    Image.open(p).convert('RGB').save(o, 'WEBP', quality=78, method=6)
    print(os.path.basename(o), os.path.getsize(o) // 1024, 'KB')
`
const r = spawnSync('python', ['-c', py, tmp, out], { stdio: 'inherit' })
fs.rmSync(tmp, { recursive: true, force: true })
process.exit(r.status ?? 1)
