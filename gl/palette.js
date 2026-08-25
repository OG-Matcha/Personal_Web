import { Color } from 'three'

/**
 * The 3D world reads its colours from the same CSS custom properties the DOM
 * uses, so the type and the field can never drift apart.
 *
 * There is one theme. The light variant used to exist and was removed: on a
 * near-white ground the particle field read as faint grey dust, and the only
 * way to fix that would have been to design a second, different film. Keeping
 * a worse version behind a toggle is not a feature.
 */
export function readPalette(root = document.documentElement) {
  const css = getComputedStyle(root)
  const get = (name, fallback) => css.getPropertyValue(name).trim() || fallback

  return {
    // Deep blue-black, not the neutral near-black the DOM uses: a neutral
    // ground reads as outer space, and this film is inside a system.
    background: new Color('#060910'),
    cold: new Color(get('--ink', '#edeef0')),
    hot: new Color(get('--pop', '#c8f250')),
    bloom: 0.5,
    // Signal grade, per the brief: scanlines instead of film grain, edge
    // chromatic aberration instead of a vignette.
    scan: 0.05,
    // Small on purpose: the scene is point sprites, and a strong split turns
    // every single dot into a rainbow speck.
    aberration: 0.1,
    // Not texture - a near-black ground bands into visible steps without it.
    dither: 0.016,
    particleAlpha: 0.8,
  }
}
