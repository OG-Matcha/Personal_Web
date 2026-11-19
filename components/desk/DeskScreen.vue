<template>
  <!--
    The phone or the tablet, picked up: the camera turns to face its screen and
    the demo comes alive on it. DeskScene lays `.ds-device` exactly over the
    screen in the 3D picture every frame (a matrix3d from the screen's four
    corners), so the page is the screen; it fades in once the camera has
    arrived. A native modal <dialog> like the drawer: Esc closes it, focus
    stays inside and returns to what opened it, and the page holds still.
  -->
  <dialog ref="dlg" class="ds" :class="[shown && `ds--${shown.id}`, { 'is-leaving': leaving }]" aria-labelledby="ds-h" aria-describedby="ds-lede" tabindex="-1" @cancel.prevent="leave" @close="onClosed" @click="onBackdrop">
    <template v-if="shown">
      <div ref="device" class="ds-device" :class="`ds-device--${shown.id}`" :style="{ width: `${shown.w}px`, height: `${shown.h}px` }">
        <div v-if="shown.id === 'phone'" class="ds-status" aria-hidden="true">
          <span class="figures">9:41</span>
          <span class="ds-batt" />
        </div>
        <!-- First in the dialog, so Tab goes through the demo before the way out
             (focus starts on the dialog itself, which reads its title and line).
             Focusable so the keyboard can scroll it. Zoomed on a big screen, so
             the app fills it at a reading size instead of sitting small in a corner. -->
        <div class="ds-scroll" tabindex="0" role="region" :aria-label="c.title" :style="{ zoom: zoom }">
          <ProductOsaveDemo v-if="shown.id === 'phone'" />
          <ProductSlotDemo v-else />
        </div>
      </div>

      <div class="ds-bar">
        <div class="ds-text">
          <p class="ds-eyebrow">{{ c.thing }}</p>
          <h2 id="ds-h" class="ds-h">{{ c.title }}</h2>
          <p id="ds-lede" class="ds-lede">{{ c.lede }}</p>
        </div>
        <NuxtLink :to="c.href" class="ds-more" @click="close">{{ c.cta }} →</NuxtLink>
        <button type="button" class="ds-x" :aria-label="E ? 'Put it down' : '放回桌上'" @click="leave">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </div>
    </template>
  </dialog>
</template>

<script setup>
const props = defineProps({
  // { id: 'phone' | 'tablet', w, h }: the CSS size the demo lays out at, which
  // is the screen's size on the page once the camera has arrived.
  screen: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const { locale } = useLocale()
const E = computed(() => locale.value === 'en')

const dlg = ref(null)
const device = ref(null)
const shown = ref(null)
const leaving = ref(false)
defineExpose({ device })
let openedAt = 0

// Re-laid out bigger (CSS zoom keeps text sharp, unlike scaling) once the
// screen is wider than the app was drawn for: 384 px for the phone, 880 for the tablet.
const zoom = computed(() => {
  const s = shown.value
  if (!s) return 1
  const z = s.id === 'phone' ? s.w / 384 : s.w / 880
  return +Math.min(s.id === 'phone' ? 1.25 : 1.4, Math.max(1, z)).toFixed(3)
})

const c = computed(() => {
  const x = DESK_DEMOS[E.value ? 'en' : 'zh'][shown.value?.id ?? 'phone']
  return { ...x, href: `${E.value ? '/en' : ''}${x.href}` }
})

watch(
  () => props.screen,
  async (s) => {
    if (s) shown.value = s
    await nextTick()
    const d = dlg.value
    if (!d) return
    if (s && !d.open) {
      leaving.value = false
      openedAt = performance.now()
      d.showModal()
      // Focus the dialog itself (Chrome ignores autofocus on a <dialog>): it
      // reads out its title and line, shows no ring, and Tab goes into the demo.
      d.focus({ preventScroll: true })
    } else if (!s && d.open) d.close()
  },
  { flush: 'post' }
)

function close() {
  dlg.value?.close()
}
// Putting it down: the app closes on the screen (the demo shrinks and fades
// back to the picture on the 3D screen, the bar sinks away), then the dialog
// closes and the camera steps back. Esc, the close button and a click outside
// all go this way; the case-study link closes at once.
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
function leave() {
  if (leaving.value || !dlg.value?.open) return
  leaving.value = true
  setTimeout(close, reduce() ? 0 : 240)
}
function onClosed() {
  leaving.value = false
  emit('close')
}
// A click anywhere off the screen and the bar puts it back down; not in the
// first moments, so the second click of a double click does not undo the first.
function onBackdrop(ev) {
  if (ev.target === dlg.value && performance.now() - openedAt > 600) leave()
}
</script>

<style scoped>
.ds {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  overflow: hidden;
}

.ds:focus {
  outline: none;
}

.ds::backdrop {
  background: transparent;
}

/* Laid over the 3D screen by DeskScene: position and shape come from its
   transform; this only fades it in once the camera has arrived. */
.ds-device {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  transform-origin: 0 0;
  background: var(--bg);
  /* One pixel past the screen's edge, so no sliver of the 3D picture shows. */
  box-shadow: 0 0 0 1px var(--bg);
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 280ms var(--ease-entrance);
}

.ds-device.is-on {
  opacity: 1;
  pointer-events: auto;
}

/* Opening the app: the screen goes to the app's background first, then the
   app grows into it, the way a phone opens one from its home screen. */
.ds-status,
.ds-scroll {
  opacity: 0;
  scale: 0.94;
  transition: opacity 260ms var(--ease-entrance) 140ms, scale 420ms var(--ease-entrance) 140ms;
}

.ds-device.is-on .ds-status,
.ds-device.is-on .ds-scroll {
  opacity: 1;
  scale: 1;
}

.ds.is-leaving .ds-device {
  opacity: 0;
  transition: opacity 160ms ease-in 80ms;
}

.ds.is-leaving .ds-status,
.ds.is-leaving .ds-scroll {
  opacity: 0;
  scale: 0.96;
  transition: opacity 120ms ease-in, scale 200ms ease-in;
}

.ds.is-leaving .ds-bar {
  opacity: 0;
  translate: -50% 16px;
  transition: opacity 160ms ease-in, translate 200ms ease-in;
}

.ds--phone.is-leaving .ds-bar {
  translate: 0 16px;
}

.ds-scroll:focus-visible {
  outline: 2px solid var(--pop);
  outline-offset: -4px;
}

.ds-device--phone {
  border-radius: 7% / 3.25%;
  /* The demo's sticky score sits under the status bar, not under the site header. */
  --os-peek-top: 0px;
}

/* The tablet's screen in the model has square corners. */
.ds-device--tablet {
  border-radius: 0;
}

.ds-status {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 6px 26px 0 30px;
  font-size: 0.875rem;
  font-weight: 700;
}

.ds-batt {
  position: relative;
  width: 24px;
  height: 11px;
  border: 1.5px solid currentColor;
  border-radius: 3px;
  opacity: 0.8;
}

.ds-batt::after {
  content: '';
  position: absolute;
  inset: 1.5px;
  right: 6px;
  border-radius: 1px;
  background: currentColor;
}

.ds-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

/* The demos are cards on the case pages; on a screen they are the whole app. */
.ds-scroll :deep(.os-card),
.ds-scroll :deep(.sd-card) {
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  min-height: 100%;
  align-content: start;
}

.ds-device--phone :deep(.os-card) {
  padding: var(--sp-3) var(--sp-4) var(--sp-6);
}

/* On the phone the payoff stays in view: the score and the radar ride at the
   top of the screen and the sliders scroll under them. */
.ds-device--phone :deep(.os-body) {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.ds-device--phone :deep(.os-peek),
.ds-device--phone :deep(.os-tip) {
  display: none;
}

.ds-device--phone :deep(.os-result) {
  order: -1;
  position: sticky;
  top: 0;
  z-index: 1;
  gap: var(--sp-1);
  margin-inline: calc(-1 * var(--sp-4));
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
}

.ds-device--phone :deep(.os-radar) {
  max-width: min(230px, 72%);
}

.ds-device--tablet :deep(.sd-card) {
  padding: var(--sp-6) var(--sp-7);
}

/* What it is and the ways out, under the screen. */
.ds-bar {
  position: absolute;
  left: 50%;
  bottom: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--sp-5);
  width: min(52rem, calc(100vw - 2rem));
  padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-5);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: 0 0 0 1px var(--rule), 0 18px 50px rgb(0 0 0 / 0.22);
  translate: -50% 0;
  /* After the caption card has faded, so the two never show at once. */
  transition: opacity 320ms var(--ease-entrance) 220ms, translate 420ms var(--ease-entrance) 220ms;
}

@starting-style {
  .ds[open] .ds-bar {
    opacity: 0;
    translate: -50% 24px;
  }
}

/* The phone is tall and narrow: it takes the full height, and the bar stands
   beside it, bottom left, instead of under it. */
.ds--phone .ds-bar {
  left: 24px;
  bottom: 24px;
  grid-template-columns: minmax(0, 1fr) auto;
  width: min(24rem, calc(50vw - 240px));
  padding: var(--sp-5);
  translate: none;
}

.ds--phone .ds-text {
  grid-column: 1 / -1;
}

.ds--phone .ds-lede {
  -webkit-line-clamp: 4;
}

.ds--phone .ds-more {
  white-space: normal;
}

@starting-style {
  .ds--phone[open] .ds-bar {
    opacity: 0;
    translate: 0 24px;
  }
}

.ds-text {
  min-width: 0;
}

.ds-eyebrow {
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink-3);
}

.ds-h {
  font-family: var(--font-display);
  font-size: var(--step-1);
  font-weight: 900;
  line-height: 1.25;
}

.ds-h:focus {
  outline: none;
}

.ds-lede {
  margin-top: 2px;
  font-size: var(--step--1);
  line-height: 1.5;
  color: var(--ink-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ds-more {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 700;
  color: var(--pop-ink);
  white-space: nowrap;
  text-decoration: none;
}

.ds-more:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.ds-x {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--ink);
  cursor: pointer;
}

.ds-x:hover {
  box-shadow: inset 0 0 0 1px var(--rule-strong);
}

@media (prefers-reduced-motion: reduce) {
  .ds-device,
  .ds-bar {
    transition: none;
  }
}
</style>

<style>
/* While a screen is up, the page (and the desk walk) behind it holds still,
   and nothing of the page floats over the room: the header, the caption and
   the stop dots step aside so the screen is all there is. */
html:has(dialog.ds[open]) {
  overflow: hidden;
}

html:has(dialog.ds[open]) .hd,
html:has(dialog.ds[open]) .dk-caps,
html:has(dialog.ds[open]) .dk-dots {
  opacity: 0;
  visibility: hidden;
  transition: opacity 200ms ease, visibility 0s 200ms;
}

/* ...and come back once the camera has mostly stepped back (DeskScene sets
   the class for a moment after a screen is put down). */
html.ds-back .hd,
html.ds-back .dk-caps,
html.ds-back .dk-dots {
  animation: ds-back 520ms var(--ease-entrance) 380ms both;
}

@keyframes ds-back {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  html.ds-back .hd,
  html.ds-back .dk-caps,
  html.ds-back .dk-dots {
    animation: none;
  }
}
</style>
