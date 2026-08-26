<template>
  <Transition name="gate">
    <div v-if="shown" class="film-gate" role="status" aria-live="polite">
      <div class="gate-inner">
        <p class="gate-name font-display">{{ site.person.nameZh }}</p>
        <p class="gate-latin mono">{{ site.person.nameEn }}</p>

        <div class="gate-rule" aria-hidden="true">
          <span class="gate-fill" :style="{ transform: `scaleX(${fill})` }" />
        </div>

        <p class="gate-note mono">{{ note }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/**
 * The cover held over the page until the film can actually run.
 *
 * The homepage's first seconds used to show a black canvas while three.js
 * compiled its shaders and four screenshots were sampled into point clouds.
 * Scrolling during that window moved the copy while the camera stood still,
 * which read as a broken page rather than a loading one.
 *
 * Three rules this thing lives by:
 *
 *  - The bar tracks real milestones from `useCinema`, never a timer. It stops
 *    where the work stopped.
 *  - It can never trap anybody: a hard cap lifts it whether or not the film
 *    ever reported in, and it is `display: none` until an inline head script
 *    proves there is JavaScript here to lift it at all.
 *  - It only ever covers a cold first paint. Coming back to the homepage from
 *    a case study restores a scroll position, and a splash over content the
 *    reader has already seen is worse than no splash at all.
 */

const { ready, readyStep } = useCinema()
const { site } = useContent()

/** Never flash: below this the gate is more startling than the wait it hides. */
const MIN_MS = 420
/** Never trap: lift regardless once this is up. */
const MAX_MS = 5000

/**
 * Module scope on purpose. Only the very first mount in this page's lifetime
 * is a cold start; every later one is a client-side route back.
 */
let coldStart = true

const shown = ref(true)
const fill = ref(0.06)
const note = ref('載入中')

let raf = 0
let minTimer = 0
let maxTimer = 0
let released = false

function release() {
  if (released) return
  released = true
  // Snap the bar shut before fading. Releasing on a bar stopped at 17% looks
  // like the load was abandoned, even though it finished.
  fill.value = 1
  cancelAnimationFrame(raf)
  shown.value = false
  document.documentElement.classList.remove('gate-locked')
}

/**
 * The bar only ever moves forward, and it eases toward the reported milestone
 * rather than snapping to it - a bar that jumps 0.45 -> 0.8 in one frame reads
 * as broken even when it is telling the truth.
 */
function drive() {
  const target = readyStep.value
  fill.value += (Math.max(fill.value, target) - fill.value) * 0.16
  raf = requestAnimationFrame(drive)
}

onMounted(() => {
  const cold = coldStart
  coldStart = false

  if (!cold || window.scrollY > 4) {
    shown.value = false
    released = true
    return
  }

  document.documentElement.classList.add('gate-locked')
  raf = requestAnimationFrame(drive)

  let minPassed = false
  let workDone = false

  const maybe = () => {
    if (minPassed && workDone) release()
  }

  minTimer = window.setTimeout(() => {
    minPassed = true
    maybe()
  }, MIN_MS)

  maxTimer = window.setTimeout(() => {
    note.value = '直接進入'
    release()
  }, MAX_MS)

  // Fonts land after the film does often enough to matter: releasing first
  // hands the reader a page that reflows under them a beat later.
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const film = new Promise((resolve) => {
    if (ready.value) return resolve()
    const stop = watch(ready, (v) => {
      if (v) {
        stop()
        resolve()
      }
    })
  })

  Promise.all([fonts, film]).then(() => {
    workDone = true
    readyStep.value = 1
    maybe()
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(minTimer)
  clearTimeout(maxTimer)
  document.documentElement.classList.remove('gate-locked')
})
</script>

<style scoped>
/* Whether this is displayed at all is decided in assets/css/tokens.css, next
   to the other document-level rules this thing needs. It ships in the SSR
   markup and only JavaScript can ever lift it, so "shown" cannot be the
   default. */
.film-gate {
  position: fixed;
  inset: 0;
  z-index: 200;
  place-items: center;
  /* The film's own ground, not the DOM's, so the hand-off is not a colour
     change on top of everything else that happens at that moment. */
  background: #060910;
}

.gate-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
  padding-inline: var(--sp-5);
}

.gate-name {
  font-size: clamp(2rem, 5vw, 3.25rem);
  letter-spacing: 0.06em;
  color: var(--ink);
}

.gate-latin {
  font-size: var(--step--2);
  letter-spacing: 0.28em;
  color: var(--ink-2);
}

.gate-rule {
  margin-top: var(--sp-5);
  width: min(15rem, 52vw);
  height: 1px;
  background: var(--rule);
  overflow: hidden;
}

.gate-fill {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: left center;
  background: var(--pop);
}

.gate-note {
  font-size: var(--step--2);
  letter-spacing: 0.2em;
  color: var(--ink-3, var(--ink-2));
}

/* The film is underneath and already running by the time this lifts, so the
   cover gets out of the way rather than announcing itself on the way out. */
.gate-leave-active {
  transition: opacity 620ms var(--ease-entrance);
}

.gate-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gate-leave-active {
    transition-duration: 120ms;
  }
}
</style>
