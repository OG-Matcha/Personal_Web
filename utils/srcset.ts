import table from './responsive-images.json'
import { asset } from './asset'

const sizes = table as Record<string, [number, string][]>

/**
 * The srcset for a picture that has smaller copies (scripts/make-responsive.py),
 * or undefined so the attribute is simply left off.
 */
export function srcset(src?: string | null) {
  const set = src ? sizes[src] : undefined
  return set ? set.map(([w, url]) => `${asset(url)} ${w}w`).join(', ') : undefined
}
