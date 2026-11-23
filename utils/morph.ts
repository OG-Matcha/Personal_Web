// The cover morph (view transitions) names one element: the picture of the thing
// just clicked. Named up front, every card on the page carried a name, and a
// cover that also appeared on the next page (its "next product" card) flew off
// to it too. Called from the click, before the router takes the snapshot.
export function morphFrom(ev: Event, pic: string, slug: string | undefined) {
  if (!slug || !(ev.target as Element | null)?.closest?.('a')) return
  const el = (ev.currentTarget as Element | null)?.querySelector?.(pic) as HTMLElement | null
  if (el) el.style.viewTransitionName = `cover-${slug}`
}
