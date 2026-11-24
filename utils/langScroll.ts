/**
 * Switching language keeps the reader where they were. Both languages lay out
 * the same blocks in the same order, so the place is remembered as "the Nth
 * block, this far into it" rather than a pixel offset: the Chinese and English
 * pages are different heights.
 */
const BLOCKS = 'main :is(section, article, h1, h2, h3, li, figure)'

type Spot = { path: string; index: number; into: number; ratio: number }
let spot: Spot | null = null
const norm = (p: string) => p.replace(/\/+$/, '')

const blocks = () => [...document.querySelectorAll<HTMLElement>(BLOCKS)].filter((e) => e.offsetParent || e.getClientRects().length)

/** Called when the language link is clicked, before the page changes. */
export function rememberLangScroll(toPath: string) {
  const max = document.documentElement.scrollHeight - innerHeight
  const list = blocks()
  // The last block whose top has gone past the top of the screen.
  let index = -1
  for (let i = 0; i < list.length; i++) if (list[i].getBoundingClientRect().top <= 1) index = i
  spot = {
    path: norm(toPath),
    index,
    into: index >= 0 ? -list[index].getBoundingClientRect().top : 0,
    ratio: max > 0 ? scrollY / max : 0,
  }
}

/** Whether a language switch to this path is waiting for takeLangScroll. */
export function pendingLangScroll(toPath: string) {
  return !!spot && spot.path === norm(toPath)
}

/** Where to scroll on the new page, once it is in the document; null if this navigation is not a language switch. */
export function takeLangScroll(toPath: string): number | null {
  const s = spot
  spot = null
  if (!s || s.path !== norm(toPath) || (s.index < 0 && s.ratio === 0)) return null
  const list = blocks()
  const el = s.index >= 0 ? list[s.index] : undefined
  if (el) return Math.max(0, el.getBoundingClientRect().top + scrollY + s.into)
  return s.ratio * (document.documentElement.scrollHeight - innerHeight)
}
