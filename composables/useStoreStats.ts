/**
 * Live store figures (users, rating) for products on a store, read through
 * workers/store once the page is up. The figure written in content/ is shown
 * until then and stays if the Worker can't answer, so it is never blank.
 */
type Stats = { users: number; rating: number | null; ratings: number | null }

const asked = new Map<string, Promise<Stats | null>>()
const stats = reactive<Record<string, Stats>>({})

function ask(id: string) {
  if (!asked.has(id)) {
    const base = location.hostname.endsWith('ogmatcha.com') ? '' : 'https://www.ogmatcha.com'
    asked.set(
      id,
      fetch(`${base}/api/store/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (j?.users ? j : null))
        .catch(() => null)
    )
  }
  asked.get(id)!.then((j) => {
    if (j) stats[id] = j
  })
}

/** Start reading the stores these works are on (call from setup). */
export function useStoreStats(ids: () => (string | null | undefined)[]) {
  onMounted(() => ids().forEach((id) => id && ask(id)))
  return stats
}

/** An outcome with `live: users | rating`, its value swapped for the store's own. */
export function liveOutcome<T extends { live?: string; value: string; label: string }>(o: T, s: Stats | undefined, en: boolean): T {
  if (!s || !o.live) return o
  if (o.live === 'users' && s.users) return { ...o, value: en ? s.users.toLocaleString('en') : `${s.users.toLocaleString('zh-TW')} 位` }
  if (o.live === 'rating' && s.rating)
    return { ...o, value: en ? `${s.rating} stars` : `${s.rating} 星`, label: en ? `From ${s.ratings} ratings` : `${s.ratings} 則評分` }
  return o
}
