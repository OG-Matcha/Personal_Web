<template>
  <div>
    <canvas ref="canvas" class="cinema-canvas" aria-hidden="true" :data-live="live ? 'on' : 'off'" />

    <!-- Nothing is captioned until the cursor lands on a knot. The always-on
         version docked four captions in a column with leader lines back into
         the field, which read as clutter over a picture that was already
         moving. On hover the knot lights up and gets one solid plate of type -
         readable because it is the only thing being said. -->
    <Transition name="tip">
      <div
        v-if="hover"
        class="tip"
        :style="{ left: `${tipX}px`, top: `${tipY}px` }"
        :data-flip="tipFlip ? 'yes' : 'no'"
        aria-hidden="true"
      >
        <p class="tip-date mono">{{ hover.date.replace('-', '.') }}</p>
        <p class="tip-title">{{ hover.title }}</p>
        <p v-if="hover.org" class="tip-org">{{ hover.org }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { beatAt, useCinema } from '~/composables/useCinema'
import { LANES, Z_SPAN, useFilm } from '~/composables/useFilm'

const film = useFilm()
const { progress, beat, live, onscreen, hover, ready, readyStep } = useCinema()

const canvas = ref(null)

let world = null
let lenis = null
let rafId = 0
let resizeTimer = 0
let heightObserver = null
let pointer = null
let pointerDirty = false

/** How far from the cursor the plate sits, in pixels. */
const TIP_OFFSET = 18
/** Flip the plate to the cursor's left inside this margin of the right edge. */
const TIP_FLIP_AT = 320

const tipFlip = computed(() => (hover.value?.x ?? 0) > (viewportW.value - TIP_FLIP_AT))
const tipX = computed(() =>
  tipFlip.value ? (hover.value?.x ?? 0) - TIP_OFFSET : (hover.value?.x ?? 0) + TIP_OFFSET
)
const viewportW = ref(1440)
const tipY = computed(() => hover.value?.y ?? 0)

function supported() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // Phones get the plain document. A 96k-particle flythrough is not worth the
  // battery, and the DOM beats already read as a finished page without it.
  if (window.innerWidth < 1024) return false
  try {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'))
  } catch {
    return false
  }
}

onMounted(async () => {
  // Readers who get the plain document must never be held behind a gate that
  // is waiting for a film they are not going to be shown.
  if (!supported()) {
    readyStep.value = 1
    ready.value = true
    return
  }

  readyStep.value = 0.12

  const [{ default: Lenis }, { createWorld }] = await Promise.all([
    import('lenis'),
    import('~/gl/world.js'),
  ])
  readyStep.value = 0.45

  world = await createWorld(canvas.value, { film, lanes: LANES, zSpan: Z_SPAN })
  readyStep.value = 0.8

  // Dev-only inspection hook. The film is a single scalar in, one frame out -
  // the only way to check that a mosaic actually assembled is to ask it.
  if (import.meta.dev) window.__film = () => world.debug()

  // 0.09 is the weighted feel the reference sites use; lower reads as lag.
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true })

  // Lenis owns the smoothing and reports velocity; the scroll *position* is
  // read straight from the window every frame. Its own virtual position can
  // drift from the document (anchor jumps, programmatic scrolls), and a film
  // that disagrees with the scrollbar is worse than one that is not smoothed.
  let velocity = 0
  lenis.on('scroll', (e) => {
    velocity = e.velocity
  })

  // The gate lifts on the first frame that has actually been drawn, not on the
  // first frame that has been scheduled. Shader compilation happens inside
  // that first render, and it is the single longest block on this path.
  let firstFrame = true
  const loop = (time) => {
    lenis.raf(time)
    tick(velocity)
    if (firstFrame) {
      firstFrame = false
      readyStep.value = 1
      ready.value = true
    }
    rafId = requestAnimationFrame(loop)
  }
  // Going live turns the beats into fixed overlays and gives their sections
  // their real scroll height, so the film can only be measured after Vue has
  // applied that - measuring first yields a page that is still collapsed.
  live.value = true
  await nextTick()
  measureFilm()

  rafId = requestAnimationFrame(loop)

  // Late-loading images and font swaps change the document height under us.
  heightObserver = new ResizeObserver(measureFilm)
  heightObserver.observe(document.documentElement)

  viewportW.value = window.innerWidth
  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
})

/**
 * The cursor is sampled, not handled. `pointermove` fires far more often than
 * the film draws, and the pick has to happen after the camera has moved for
 * this frame anyway - so the handler only records the position and the loop
 * does the work.
 */
function onPointerMove(e) {
  pointer = { x: e.clientX, y: e.clientY }
  pointerDirty = true
}

function onPointerLeave() {
  pointer = null
  pointerDirty = true
}

/** Scroll distance the five beats occupy, in px. */
let filmEnd = 1

function tick(velocity) {
  const y = window.scrollY
  const p = Math.min(1, Math.max(0, y / filmEnd))
  progress.value = p
  beat.value = beatAt(p)

  // Below the film sits the written record. Once the reader is there the
  // overlay must let go, and there is nothing left worth rendering.
  const visible = y < filmEnd + window.innerHeight * 0.5
  onscreen.value = visible
  if (!visible) {
    if (hover.value) {
      hover.value = null
      world.pickNode(-1e4, -1e4)
    }
    return
  }

  world.frame(p, velocity)

  // Re-pick whenever the cursor moved or the camera did: a knot can slide
  // under a stationary cursor just because the film is scrolling.
  if (pointerDirty || velocity !== 0) {
    pointerDirty = false
    const hit = pointer ? world.pickNode(pointer.x, pointer.y) : (world.pickNode(-1e4, -1e4), null)
    // Compare by id: replacing the object every frame would re-render the
    // plate 60 times a second for no visible change.
    if (hit?.id !== hover.value?.id) hover.value = hit
    else if (hit && hover.value) Object.assign(hover.value, { x: hit.x, y: hit.y })
  }
}

function measureFilm() {
  const last = document.getElementById('now')
  if (!last) return
  const bottom = last.getBoundingClientRect().bottom + window.scrollY
  filmEnd = Math.max(1, bottom - window.innerHeight)
}

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    viewportW.value = window.innerWidth
    measureFilm()
    world?.resize()
  }, 150)
}

function onVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(rafId)
    rafId = 0
  } else if (!rafId && world && lenis) {
    const loop = (time) => {
      lenis.raf(time)
      tick(0)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  }
}

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  document.removeEventListener('visibilitychange', onVisibility)
  heightObserver?.disconnect()
  lenis?.destroy()
  world?.dispose()
  live.value = false
  progress.value = 0
  beat.value = 0
  hover.value = null
})
</script>

<style scoped>
.cinema-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 900ms ease;
}

.cinema-canvas[data-live='on'] {
  opacity: 1;
}

.tip {
  position: fixed;
  z-index: 2;
  max-width: 22rem;
  padding: var(--sp-3) var(--sp-4);
  transform: translateY(-50%);
  /* Solid, not translucent. The whole point is that it stops competing with
     the field behind it. */
  background: var(--surface);
  border: 1px solid var(--rule-strong);
  border-left: 2px solid var(--pop);
  box-shadow: var(--elev-1);
  pointer-events: none;
}

.tip[data-flip='yes'] {
  transform: translate(-100%, -50%);
  border-left: 1px solid var(--rule-strong);
  border-right: 2px solid var(--pop);
}

.tip-date {
  font-size: var(--step--2);
  letter-spacing: 0.12em;
  color: var(--pop-ink);
}

.tip-title {
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  line-height: 1.5;
  color: var(--ink);
}

.tip-org {
  margin-top: var(--sp-1);
  font-size: var(--step--2);
  color: var(--ink-2);
}

.tip-enter-active,
.tip-leave-active {
  transition: opacity var(--dur-1) var(--ease-inout);
}

.tip-enter-from,
.tip-leave-to {
  opacity: 0;
}
</style>
