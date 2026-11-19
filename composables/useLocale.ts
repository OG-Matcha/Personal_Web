/**
 * Which language a route is in, and the same page in the other one.
 *
 * Chinese lives at the root, English under /en/. Every page exists in both,
 * so the alternate is the same path with the prefix added or removed.
 */
export function useLocale() {
  const route = useRoute()
  const locale = computed<'zh' | 'en'>(() => (route.path === '/en' || route.path.startsWith('/en/') ? 'en' : 'zh'))
  const altPath = computed(() => {
    // A path that is no page (the 404) has no twin either: go to the other home.
    if (!route.matched.length) return locale.value === 'en' ? '/' : '/en/'
    const p = route.path.endsWith('/') ? route.path : `${route.path}/`
    return locale.value === 'en' ? p.replace(/^\/en\//, '/') : `/en${p}`
  })
  return { locale, altPath }
}
