/**
 * How a link behaves, decided in one place.
 *
 * Leaving the site and moving inside it are different actions and should not
 * look the same to the browser. Anything pointing at another origin opens in a
 * new tab, so the reader does not lose their place in a page they were part
 * way through; anything on this site navigates in place.
 *
 * The rules were spread across seven components before this, and they had
 * drifted - some links carried `rel="noopener"` with no `target`, which does
 * nothing at all.
 */

const SITE_HOST = 'ogmatcha.com'

/** True for an absolute URL pointing somewhere that is not this site. */
export function isExternal(href?: string | null): boolean {
  if (!href) return false
  if (!/^https?:\/\//i.test(href)) return false
  try {
    return !new URL(href).hostname.endsWith(SITE_HOST)
  } catch {
    return false
  }
}

/**
 * Attributes for an `<a>`, given where it points.
 *
 * `me` marks a link that asserts identity - a profile that is actually the
 * same person. It belongs on GitHub/LinkedIn/Instagram and nowhere else.
 *
 * `noreferrer` rides along with `noopener` because a target of `_blank`
 * otherwise hands the destination this page's URL, and there is no reason a
 * competition's announcement page needs to know where the reader came from.
 */
export function linkAttrs(href?: string | null, { me = false } = {}) {
  if (!isExternal(href)) return me ? { rel: 'me' } : {}
  return {
    target: '_blank',
    rel: me ? 'me noopener noreferrer' : 'noopener noreferrer',
  }
}
