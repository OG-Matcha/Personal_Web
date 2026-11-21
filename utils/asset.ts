declare const __ASSET_V__: Record<string, string>

/**
 * A file under public/desk, fonts, images or media with its content hash in the URL
 * (`/desk/poster-day.webp?v=1a2b3c4d`, scripts/asset-v.mjs), so it can be
 * cached for a year and a changed file still shows at once. Other paths
 * come back as they are.
 */
export function asset(u: string) {
  const h = __ASSET_V__[u.split('?')[0]]
  return h ? `${u}?v=${h}` : u
}
