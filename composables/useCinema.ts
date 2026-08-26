/**
 * Shared scroll state for the homepage. One scalar drives the 3D camera and
 * every DOM overlay, so the film and the text can never disagree about where
 * in the story the reader is.
 *
 * The geometry - which beat covers which stretch of scroll - lives in
 * `useFilm`, derived from the timeline. This file only holds the live values.
 */

import { beatWindows } from '~/composables/useFilm'

/** Progress at which each beat's copy takes the frame. */
export function beatBounds() {
  const w = beatWindows()
  return w.map((b, i) => ({
    id: b.id,
    side: b.side,
    start: b.spanStart,
    end: w[i + 1]?.spanStart ?? 1,
    dwellStart: b.start,
    dwellEnd: b.end,
    from: b.from,
    to: b.to,
  }))
}

export function beatAt(progress: number): number {
  const b = beatBounds()
  let i = 0
  while (i < b.length - 1 && progress >= b[i + 1].start) i++
  return i
}

/** The knot under the cursor, or null. Screen position is in CSS pixels. */
export interface FilmHover {
  id: string
  title: string
  org: string | null
  date: string
  tier: string
  x: number
  y: number
  world: { x: number; y: number; z: number }
}

export function useCinema() {
  return {
    /** 0..1 through the film - not through the document. */
    progress: useState('cinema:progress', () => 0),
    /** Index into the beats. */
    beat: useState('cinema:beat', () => 0),
    /** True only when the WebGL layer actually rendered - never assumed. */
    live: useState('cinema:live', () => false),
    /** False once the reader has scrolled past the film into the record. */
    onscreen: useState('cinema:onscreen', () => true),
    /** The knot the cursor is over. Nothing is captioned until there is one. */
    hover: useState<FilmHover | null>('cinema:hover', () => null),
    /**
     * True once the first film frame is on screen - or once we know there is
     * never going to be one, because this reader gets the plain document.
     * The gate over the page waits on this and on nothing else.
     */
    ready: useState('cinema:ready', () => false),
    /**
     * How far along that is, 0..1, stepped by real milestones rather than by a
     * timer. A bar that moves on a clock while the page is stuck is a lie the
     * reader can feel.
     */
    readyStep: useState('cinema:readyStep', () => 0),
  }
}
