import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'
import { pendingLangScroll, takeLangScroll } from '~/utils/langScroll'

// Nuxt's own scroll behaviour, with one change: arriving from another page at
// a section (/#work from the résumé), it scrolled one frame after the page
// finished loading. With view transitions the home page is not in the
// document yet at that point, the section is not found, and the reader is left
// at the top. Here it waits for the section to exist and the fonts to be in
// (they change the height of everything above it), then goes there.
const marginTop = (sel: string) => {
  try {
    const el = document.querySelector(sel)
    if (el) return (Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
  } catch {}
  return 0
}
const frame = () => new Promise((r) => requestAnimationFrame(r))
async function whenThere(sel: string) {
  const until = performance.now() + 4000
  let el: Element | null = null
  while (performance.now() < until) {
    try { el = document.querySelector(sel) } catch { return }
    if (el) break
    await frame()
  }
  await document.fonts?.ready
  await frame()
  await frame()
}

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    if (to.path === from.path) {
      if (from.hash && !to.hash) return { left: 0, top: 0 }
      if (to.hash) return { el: to.hash, top: marginTop(to.hash) }
      return false
    }
    if (from === START_LOCATION) return savedPosition || (to.hash ? { el: to.hash, top: marginTop(to.hash) } : { left: 0, top: 0 })
    const hook = nuxtApp._runningTransition ? 'page:transition:finish' : 'page:loading:end'
    // A new page that opens at its top goes there the moment it is rendered
    // (page:finish), before the view transition takes its picture of it: a
    // frame later, the transition showed the new page at the old one's scroll
    // position, half way down, the cover flying to where it was off screen,
    // and then the jump to the top.
    if (!savedPosition && !to.hash && !pendingLangScroll(to.path)) {
      nuxtApp.hooks.hookOnce('page:finish', () => window.scrollTo({ left: 0, top: 0, behavior: 'instant' }))
    }
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hook, async () => {
        // Switched language: the same place on the other language's page.
        if (!savedPosition && !to.hash) {
          await document.fonts?.ready
          await frame()
          const top = takeLangScroll(to.path)
          if (top !== null) {
            resolve({ left: 0, top, behavior: 'instant' })
            return
          }
        }
        if (savedPosition) {
          requestAnimationFrame(() => resolve(savedPosition))
          return
        }
        if (!to.hash) {
          requestAnimationFrame(() => resolve({ left: 0, top: 0 }))
          return
        }
        await whenThere(to.hash)
        resolve({ el: to.hash, top: marginTop(to.hash), behavior: 'instant' })
      })
    })
  },
}
