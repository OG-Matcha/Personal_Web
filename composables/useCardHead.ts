/**
 * The card pages' extra head: out of search, and a home-screen icon of their
 * own that opens straight onto the QR code (public/card/card.webmanifest).
 * `key` replaces the site-wide manifest link rather than adding a second.
 */
export function useCardHead() {
  useSeoMeta({ robots: 'noindex, follow' })
  useHead({ link: [{ rel: 'manifest', href: '/card/card.webmanifest', key: 'manifest' }] })
}
