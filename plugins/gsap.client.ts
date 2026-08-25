// Lazily loaded on purpose: a static `import { gsap }` here pulls the whole
// animation stack into the entry chunk, which is the one chunk that blocks
// hydration. Components import gsap dynamically too, so they share this chunk.
export default defineNuxtPlugin(async (nuxtApp) => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  gsap.registerPlugin(ScrollTrigger)
  gsap.defaults({ duration: 0.6, ease: 'power3.out' })
  gsap.ticker.lagSmoothing(0)

  // CJK slices land after first paint, so every measured trigger position is
  // stale until the fonts are in. Without this the pinned scene starts early.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())

  nuxtApp.hook('page:finish', async () => {
    ScrollTrigger.clearScrollMemory()
    await nextTick()
    ScrollTrigger.refresh()
  })
})
