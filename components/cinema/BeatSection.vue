<template>
  <section :id="id" class="beat" :data-beat="id" :style="{ '--beat-span': `${span}vh` }">
    <div
      class="beat-inner"
      :data-live="live ? 'on' : 'off'"
      :data-side="bounds.side"
      :data-shown="shown ? 'yes' : 'no'"
      :aria-hidden="live && !shown ? 'true' : undefined"
      :style="live ? { opacity } : undefined"
    >
      <div class="beat-content">
        <slot :local="local" :dwell="dwell" :bounds="bounds" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { beatBounds, useCinema } from '~/composables/useCinema'

const props = defineProps({
  id: { type: String, required: true },
  index: { type: Number, required: true },
  /** Scroll distance this beat owns, in vh. Comes from beatSpans(). */
  span: { type: Number, default: 180 },
})

const { progress, live, onscreen } = useCinema()

const bounds = computed(() => beatBounds()[props.index])

/** 0..1 across everything this beat owns, travel included. */
const local = computed(() => {
  const { start, end } = bounds.value
  return Math.min(1, Math.max(0, (progress.value - start) / Math.max(1e-6, end - start)))
})

/**
 * 0..1 across the dwell only - the stretch where the camera has actually
 * stopped. Slot content that sequences (the work beat crossfading between
 * cases) should key off this, not off `local`, or it starts moving while the
 * camera is still flying in.
 */
const dwell = computed(() => {
  const { dwellStart, dwellEnd } = bounds.value
  return Math.min(1, Math.max(0, (progress.value - dwellStart) / Math.max(1e-6, dwellEnd - dwellStart)))
})

/**
 * Copy fades with the camera rather than snapping at the boundary. The edges
 * are deliberately soft so two beats briefly share the frame, the way a cut on
 * a dissolve does. The first beat must be legible at the very top of the page,
 * so its entry does not fade.
 */
const opacity = computed(() => {
  if (!onscreen.value) return 0
  const t = local.value
  const fade = 0.16
  const inn = props.index === 0 ? 1 : Math.min(1, t / fade)
  const out = Math.min(1, (1 - t) / fade)
  return Math.min(inn, out)
})

const shown = computed(() => opacity.value > 0.02)
</script>

<style scoped>
.beat {
  position: relative;
  z-index: 1;
  min-height: var(--beat-span);
}

/*
 * Live, the copy is pinned to the viewport for exactly the scroll range its
 * beat owns. `position: sticky` cannot do this: a sticky child releases one
 * viewport before its section ends, which left a screen of empty world between
 * every pair of beats.
 */
.beat-inner[data-live='on'] {
  position: fixed;
  /* Starts below the HUD, not at the top of the window. Centring inside the
     full viewport pushes tall copy up under the status bar - and a fixed
     overlay cannot be scrolled to recover it. */
  inset: var(--header-h) 0 0 0;
  display: flex;
  align-items: center;
  /* Tighter than the static version on purpose: a fixed overlay cannot
     scroll, so anything past the viewport is unreachable rather than just
     below the fold. `_check.mjs` asserts the copy clears the header and
     fits the frame - if new copy ever breaks that, the check fails. */
  padding-block: var(--sp-6);
}

.beat-inner[data-live='on'][data-shown='no'] {
  pointer-events: none;
}

/* The film runs behind live type, so the copy half of the frame gets a scrim.
   Without it the moving field wins every contrast fight. The gradient has to
   flip with the beat - a scrim on the wrong side darkens the picture and
   leaves the words bare. */
.beat-inner[data-live='on']::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.beat-inner[data-live='on'][data-side='left']::before {
  background: linear-gradient(
    to right,
    var(--bg) 0%,
    color-mix(in srgb, var(--bg) 80%, transparent) 26%,
    transparent 48%
  );
}

.beat-inner[data-live='on'][data-side='right']::before {
  background: linear-gradient(
    to left,
    var(--bg) 0%,
    color-mix(in srgb, var(--bg) 80%, transparent) 26%,
    transparent 48%
  );
}

/* The closing beat is framed head-on, so the scrim closes in from both edges
   instead of taking one half. */
.beat-inner[data-live='on'][data-side='centre']::before {
  /* Lighter than the side scrims. The closing shot is the reveal - the whole
     timeline in one frame - and a heavy centre wash would cover the thing the
     camera turned around to show. */
  background: radial-gradient(
    115% 80% at 50% 46%,
    color-mix(in srgb, var(--bg) 72%, transparent) 0%,
    color-mix(in srgb, var(--bg) 38%, transparent) 42%,
    transparent 72%
  );
}

.beat-content {
  position: relative;
  z-index: 1;
  width: 100%;
}

/* Live headings are capped tighter than the static page allows: the overlay
   has one screen and no second chance. */
.beat-inner[data-live='on'] .beat-content :deep(h2) {
  font-size: clamp(2rem, 3.2vw, 2.75rem);
}

/* The side swap, in one place. The slot always writes a 12-column grid; which
   half it lands in is this component's business, not the copy's. */
.beat-inner[data-live='on'][data-side='right'] .beat-content :deep(.beat-copy) {
  grid-column: 7 / -1;
}

.beat-inner[data-live='on'][data-side='centre'] .beat-content :deep(.beat-copy) {
  grid-column: 3 / -3;
  text-align: center;
}

/* Centring the column must not centre the rows inside it: a dated list with
   centred titles and left-aligned dates reads as a layout bug. The blocks get
   centred; their contents stay left. */
.beat-inner[data-live='on'][data-side='centre'] .beat-content :deep(.lanes),
.beat-inner[data-live='on'][data-side='centre'] .beat-content :deep(.events) {
  margin-inline: auto;
  text-align: left;
}

.beat-inner[data-live='on'][data-side='centre'] .beat-content :deep(.events) {
  width: fit-content;
}

/* No WebGL (phone, reduced motion, no context) - this is then an ordinary
   stacked page, and the extra scroll distance would just be empty space. */
.beat-inner[data-live='off'] {
  position: relative;
  display: flex;
  align-items: center;
  padding-block: var(--sp-7);
}

.beat:has(.beat-inner[data-live='off']) {
  min-height: 0;
}
</style>
