/**
 * Film regression check. Run against `npx nuxt dev` on port 3000:
 *
 *   node scripts/check-film.mjs
 *
 * It walks the whole scroll range and asserts the things that broke silently
 * while this was being built: a beat rendering with no copy on screen, the
 * copy overflowing under the fixed header, a mosaic assembling on top of the
 * type, the film measuring itself before the layout settled, and WebGL
 * starting on a phone or under reduced motion.
 *
 * Screenshots land in the scratchpad so the frames can be looked at, not just
 * asserted about - most of the real problems here were visual.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = 'http://[::1]:3000/'
const OUT = '.shots'
mkdirSync(OUT, { recursive: true })

const fails = []
const ok = (cond, msg) => { if (!cond) fails.push(msg); console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`) }

const browser = await chromium.launch()

// ---------- desktop, film live ----------
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'no-preference',
  deviceScaleFactor: 1,
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(URL, { waitUntil: 'domcontentloaded' })

// The gate holds the page - and blocks scrolling - until the film can run.
// Every assertion below is about a page that has been entered, so this has to
// come first, and it doubles as the check that the gate lets go at all.
const gate = page.locator('.film-gate')
ok(await gate.isVisible().catch(() => false), 'the gate covers the page on a cold load')
// The lock goes on at mount, not at first paint - there is a short window
// while the app hydrates where the gate is up and the page is still
// scrollable. It is covered, so nothing shows; this waits it out.
const locked = await page
  .waitForFunction(() => document.documentElement.classList.contains('gate-locked'), null, {
    timeout: 8000,
  })
  .then(() => true)
  .catch(() => false)
ok(locked, 'scrolling is locked behind the gate')
await gate.waitFor({ state: 'detached', timeout: 12000 }).catch(() => {})
ok((await gate.count()) === 0, 'the gate lifts once the film is ready')
ok(
  !(await page.evaluate(() => document.documentElement.classList.contains('gate-locked'))),
  'the scroll lock is released with it'
)

await page.waitForTimeout(2000)

ok(errors.length === 0, `no JS errors (${errors.length})${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`)

const live = await page.getAttribute('canvas', 'data-live')
ok(live === 'on', `canvas live: ${live}`)

// The mosaics are sampled off the main thread's critical path, so poll for
// them rather than assuming one fixed delay is long enough on every machine.
await page
  .waitForFunction(() => (window.__film?.().loaded ?? 0) >= 4, null, { timeout: 20000 })
  .catch(() => {})
const dbg = await page.evaluate(() => window.__film?.() ?? null)
ok(dbg !== null, 'debug hook present')
if (dbg) {
  ok(dbg.loaded === 4, `all four pictures sampled: ${dbg.loaded}/4`)
  ok(dbg.pool >= 12000, `mosaic pool: ${dbg.pool} particles for one picture`)
}

const ids = ['ignite', 'build', 'peak', 'proof', 'now']
for (const id of ids) {
  const n = await page.locator(`#${id}`).count()
  ok(n === 1, `beat #${id} exists`)
}

const docH = await page.evaluate(() => document.documentElement.scrollHeight)
const vh = 900
ok(docH > vh * 9, `document tall enough for the film: ${Math.round(docH / vh)} screens`)

// walk the film and record what is on screen
const samples = [0, 0.08, 0.2, 0.33, 0.46, 0.6, 0.72, 0.8, 0.88, 0.96]
const filmEnd = await page.evaluate(() => {
  const el = document.getElementById('now')
  return el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight
})

for (const s of samples) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(filmEnd * s))
  await page.waitForTimeout(900)

  const state = await page.evaluate(() => {
    const shown = [...document.querySelectorAll('.beat-inner[data-shown="yes"]')]
    return {
      shown: shown.map((el) => el.closest('section').id),
      sides: shown.map((el) => el.dataset.side),
      text: shown.map((el) => (el.innerText || '').replace(/\s+/g, ' ').slice(0, 70)),
      hud: document.querySelector('.hud')?.innerText.replace(/\s+/g, ' ') ?? null,
      live: (() => {
        const f = window.__film?.()
        if (!f || !f.armed || f.morph < 0.3 || !f.rect) return []
        return [
          {
            slug: f.armed,
            w: f.morph,
            rect: f.rect,
            side: document.querySelector('.beat-inner[data-shown="yes"]')?.dataset.side,
            text: `${f.armed} w=${f.morph} pts=${f.points} rect=${f.rect.join(',')}`,
          },
        ]
      })(),
      camz: Math.round(window.__film?.().camera[2] ?? 0),
      copyTop: document.querySelector('.beat-inner[data-shown="yes"] .beat-copy')?.getBoundingClientRect().top ?? 0,
      copyBottom: document.querySelector('.beat-inner[data-shown="yes"] .beat-copy')?.getBoundingClientRect().bottom ?? 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })

  ok(state.shown.length >= 1 && state.shown.length <= 2, `p=${s} beats on screen: ${state.shown.join(',') || 'NONE'}`)
  ok(state.overflow <= 0, `p=${s} no horizontal overflow (${state.overflow}px)`)
  ok(state.copyTop >= 60, `p=${s} copy clears the header (top ${Math.round(state.copyTop)}px)`)
  ok(state.copyBottom <= 900, `p=${s} copy fits the viewport (bottom ${Math.round(state.copyBottom)}px)`)
  console.log(`      side=${state.sides.join(',')} camz=${state.camz}`)
  for (const l of state.live) console.log(`      MOSAIC ${l.text}`)
  for (const l of state.live) {
    if (l.w < 0.6 || l.side === 'centre') continue
    const clear = l.side === 'right' ? l.rect[2] <= 56 : l.rect[0] >= 44
    ok(clear, `p=${s} mosaic ${l.slug} stays off the copy column (rect ${l.rect[0]}-${l.rect[2]}, copy ${l.side})`)
  }

  await page.screenshot({ path: `${OUT}/p${String(Math.round(s * 100)).padStart(3, '0')}.png` })
}

// ---------- hover: the knots are the only captions now ----------
// Sweep the world half of a dense beat until a knot is found. There is no DOM
// element to target - the knots are point clouds - so the check has to hunt
// the same way a cursor does.
await page.evaluate((y) => window.scrollTo(0, y), Math.round(filmEnd * 0.46))
await page.waitForTimeout(900)

let tip = null
outer: for (let gy = 200; gy <= 780 && !tip; gy += 45) {
  for (let gx = 640; gx <= 1400; gx += 45) {
    await page.mouse.move(gx, gy)
    await page.waitForTimeout(45)
    tip = await page.evaluate(() => {
      const el = document.querySelector('.tip')
      if (!el) return null
      const cs = getComputedStyle(el)
      return {
        text: el.innerText.replace(/\s+/g, ' ').slice(0, 60),
        opaque: !/rgba\([^)]*,\s*0(\.\d+)?\)/.test(cs.backgroundColor),
        px: parseFloat(getComputedStyle(el.querySelector('.tip-title')).fontSize),
      }
    })
    if (tip) break outer
  }
}
ok(Boolean(tip), `hovering a knot captions it: ${tip ? tip.text : 'nothing found in the sweep'}`)
if (tip) {
  ok(tip.opaque, 'the caption plate is solid, not translucent')
  ok(tip.px >= 13, `caption type is readable: ${tip.px}px`)
  await page.screenshot({ path: `${OUT}/hover.png` })
}
await page.mouse.move(10, 10)

// ---------- the ledger: everything after the film ----------
await page.evaluate(() => document.getElementById('now-section')?.scrollIntoView())
await page.waitForTimeout(700)
const ledger = await page.evaluate(() => ({
  posts: document.querySelectorAll('#now-section .post').length,
  layers: document.querySelectorAll('#skills .layer').length,
  nodes: document.querySelectorAll('#skills .node').length,
  overlay: document.querySelectorAll('.beat-inner[data-shown="yes"]').length,
  hud: document.querySelectorAll('.hud').length,
  nav: document.querySelectorAll('nav .nav-link').length,
}))
ok(ledger.posts === 3, `three posts in the now section: ${ledger.posts}`)
ok(ledger.layers === 5, `five stack layers rendered: ${ledger.layers}`)
ok(ledger.nodes >= 35, `skill nodes with evidence: ${ledger.nodes}`)
ok(ledger.overlay === 0, `film overlay released over the ledger: ${ledger.overlay} still shown`)
ok(ledger.hud === 0 && ledger.nav > 0, `status line hands back to the nav past the film (hud ${ledger.hud}, nav ${ledger.nav})`)
await page.screenshot({ path: `${OUT}/ledger.png` })

await ctx.close()

// ---------- phone: no WebGL at all ----------
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
const p2 = await phone.newPage()
await p2.goto(URL, { waitUntil: 'domcontentloaded' })
await p2.waitForTimeout(1800)
ok((await p2.getAttribute('canvas', 'data-live')) === 'off', 'phone skips WebGL')
const ov = await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
ok(ov <= 0, `phone no horizontal overflow (${ov}px)`)
const phoneText = await p2.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').length)
ok(phoneText > 1500, `phone still renders the content (${phoneText} chars)`)
await p2.screenshot({ path: `${OUT}/phone.png`, fullPage: false })
await phone.close()

// ---------- reduced motion: no WebGL ----------
const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const p3 = await rm.newPage()
await p3.goto(URL, { waitUntil: 'domcontentloaded' })
await p3.waitForTimeout(1500)
ok((await p3.getAttribute('canvas', 'data-live')) === 'off', 'reduced motion skips WebGL')
await rm.close()

await browser.close()

console.log('\n' + (fails.length ? `${fails.length} FAILURES:\n - ` + fails.join('\n - ') : 'ALL CHECKS PASSED'))
process.exit(fails.length ? 1 : 0)
