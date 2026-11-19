<template>
  <!--
    The phone or the tablet, picked up: the camera turns to face its screen and
    the demo opens on it. DeskScene lays `.ds-device` exactly over the screen in
    the 3D picture every frame (a matrix3d from the screen's four corners).
    The device shows the very picture the 3D screen shows (the oSave home, the
    MedaLink calendar), so taking over from the 3D screen changes nothing you
    can see; the demo then opens inside that app, as a sheet on the phone and a
    panel on the tablet, and closes back into it when put down.
    A native modal <dialog> like the drawer: Esc closes it, focus stays inside
    and returns to what opened it, and the page holds still.
  -->
  <dialog
    ref="dlg"
    class="ds"
    :class="[shown && `ds--${shown.id}`, { 'is-leaving': leaving }]"
    aria-labelledby="ds-h"
    aria-describedby="ds-lede"
    tabindex="-1"
    @cancel.prevent="leave"
    @close="onClosed"
    @click="onBackdrop"
    @wheel="onWheel"
    @keydown="onKey"
  >
    <template v-if="shown">
      <div ref="device" class="ds-device" :class="`ds-device--${shown.id}`" :style="{ width: `${shown.w}px`, height: `${shown.h}px`, backgroundImage: `url(/desk/model/${shown.id}.webp)` }">
        <div class="ds-scrim" aria-hidden="true" />
        <div class="ds-sheet">
          <span v-if="shown.id === 'phone'" class="ds-grab" aria-hidden="true" />
          <!-- First in the dialog, so Tab goes through the demo before the way out
               (focus starts on the dialog itself, which reads its title and line).
               Focusable so the keyboard can scroll it. Zoomed on a big screen, so
               the app fills it at a reading size instead of sitting small. -->
          <div ref="scroller" class="ds-scroll" tabindex="0" role="region" :aria-label="t.region" :style="{ zoom }">
            <ProductOsaveDemo v-if="shown.id === 'phone'" />
            <ProductSlotDemo v-else />
          </div>
        </div>
      </div>

      <div class="ds-bar">
        <div class="ds-text">
          <p class="ds-eyebrow">{{ c.thing }}</p>
          <h2 id="ds-h" class="ds-h">{{ c.title }}</h2>
          <p id="ds-lede" class="ds-lede">{{ c.lede }}</p>
        </div>
        <NuxtLink :to="c.href" class="ds-more" @click="close">{{ c.cta }} →</NuxtLink>
        <button type="button" class="ds-x" :aria-label="t.down" @click="leave">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        </button>
      </div>
    </template>
  </dialog>
</template>

<script setup>
const props = defineProps({
  // { id: 'phone' | 'tablet', w, h }: the CSS size the screen lays out at,
  // which is its size on the page once the camera has arrived.
  screen: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const { locale } = useLocale()
const E = computed(() => locale.value === 'en')
const t = computed(() => (E.value ? { region: 'The demo', down: 'Put it down' } : { region: '試玩畫面', down: '放回桌上' }))

const dlg = ref(null)
const device = ref(null)
const scroller = ref(null)
const shown = ref(null)
const leaving = ref(false)
defineExpose({ device })
let openedAt = 0

// The sheet's share of the screen: the phone's sheet runs full width under
// the status bar, the tablet's panel sits in the middle of the calendar.
const SHEET_W = { phone: 1, tablet: 0.86 }
// Re-laid out bigger (CSS zoom keeps text sharp, unlike scaling) once the
// sheet is wider than the app was drawn for: 384 px on the phone, 880 on the tablet.
const zoom = computed(() => {
  const s = shown.value
  if (!s) return 1
  const w = s.w * SHEET_W[s.id]
  const z = s.id === 'phone' ? w / 384 : w / 880
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
      if (scroller.value) scroller.value.scrollTop = 0
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
// Putting it down: the sheet closes back into the app (which is what the 3D
// screen shows), the bar sinks away, then the dialog closes and the camera
// steps back. Esc, the close button, a click or a scroll off the device all go
// this way; the case-study link closes at once.
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches
function leave() {
  if (leaving.value || !dlg.value?.open) return
  leaving.value = true
  setTimeout(close, reduce() ? 0 : 300)
}
function onClosed() {
  leaving.value = false
  emit('close')
}
// Off the device means off it by a margin: a click on the phone's frame or a
// near miss of the screen's edge is holding it, not putting it down.
function offDevice(ev) {
  if (ev.target !== dlg.value) return false
  const r = device.value?.getBoundingClientRect()
  if (!r) return true
  const m = 48
  return ev.clientX < r.left - m || ev.clientX > r.right + m || ev.clientY < r.top - m || ev.clientY > r.bottom + m
}
// Not in the first moments, so the second click of a double click does not
// undo the first.
function onBackdrop(ev) {
  if (performance.now() - openedAt > 600 && offDevice(ev)) leave()
}
// Scrolling is how this page is walked: a scroll over the room puts the thing
// down, so the next one carries on walking.
function onWheel(ev) {
  if (performance.now() - openedAt > 600 && offDevice(ev) && Math.abs(ev.deltaY) > 4) leave()
}
// With focus on the dialog itself, the page keys scroll the app.
function onKey(ev) {
  const el = scroller.value
  if (!el || ev.target !== dlg.value) return
  const page = el.clientHeight * 0.85
  const by = { PageDown: page, PageUp: -page, ' ': ev.shiftKey ? -page : page, ArrowDown: 40, ArrowUp: -40, End: el.scrollHeight, Home: -el.scrollHeight }[ev.key]
  if (by === undefined) return
  ev.preventDefault()
  el.scrollBy({ top: by, behavior: reduce() ? 'auto' : 'smooth' })
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
   transform. It shows the same picture as the 3D screen, at the same
   brightness (--glow, set by DeskScene), so it can take over unseen. */
.ds-device {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  background: #fff center / 100% 100% no-repeat;
  filter: brightness(var(--glow, 1));
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms linear;
}

.ds-device.is-on {
  opacity: 1;
  pointer-events: auto;
}

.ds-device--phone {
  border-radius: 7% / 3.25%;
}

/* The app dims behind its sheet, as it does on a phone. */
.ds-scrim {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.32);
  opacity: 0;
  transition: opacity 360ms ease 120ms;
}

.ds-device.is-on .ds-scrim {
  opacity: 1;
}

.ds-sheet {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
  filter: brightness(calc(1 / var(--glow, 1)));
  transition: translate 460ms var(--ease-entrance) 160ms, opacity 300ms var(--ease-entrance) 160ms, scale 460ms var(--ease-entrance) 160ms;
}

/* Phone: a sheet up from the bottom, under the status bar. */
.ds-device--phone .ds-sheet {
  inset: 7.5% 0 0;
  border-radius: 1.4rem 1.4rem 0 0;
  translate: 0 100%;
}

/* Tablet: a panel in the middle of the calendar. */
.ds-device--tablet .ds-sheet {
  inset: 6% 7%;
  border-radius: 1rem;
  box-shadow: 0 24px 60px rgb(0 0 0 / 0.3);
  opacity: 0;
  scale: 0.94;
}

.ds-device.is-on .ds-sheet {
  translate: 0 0;
  opacity: 1;
  scale: 1;
}

.ds-grab {
  flex: none;
  align-self: center;
  width: 2.25rem;
  height: 5px;
  margin: 8px 0 2px;
  border-radius: 3px;
  background: var(--rule-strong);
}

.ds-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.ds-scroll:focus-visible {
  outline: 2px solid var(--pop);
  outline-offset: -4px;
}

/* Putting it down: the sheet goes back, then the device hands back to the 3D screen. */
.ds.is-leaving .ds-device--phone .ds-sheet {
  translate: 0 100%;
  transition: translate 260ms cubic-bezier(0.4, 0, 1, 1);
}

.ds.is-leaving .ds-device--tablet .ds-sheet {
  opacity: 0;
  scale: 0.96;
  transition: opacity 200ms ease-in, scale 240ms ease-in;
}

.ds.is-leaving .ds-scrim {
  opacity: 0;
  transition: opacity 240ms ease-in;
}

.ds.is-leaving .ds-device {
  opacity: 0;
  transition: opacity 80ms linear 220ms;
}

/* The demos are cards on the case pages; in the app they are the whole sheet. */
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
  padding: var(--sp-2) var(--sp-4) var(--sp-6);
}

/* On the phone the payoff stays in view: the score and the radar ride at the
   top of the sheet and the sliders scroll under them. */
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
  max-width: min(270px, 84%);
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

.ds.is-leaving .ds-bar {
  opacity: 0;
  translate: -50% 16px;
  transition: opacity 160ms ease-in, translate 200ms ease-in;
}

/* The phone is tall and narrow: it takes the full height, and the bar stands
   beside it, bottom left, instead of under it. */
.ds--phone .ds-bar {
  left: 24px;
  bottom: 24px;
  grid-template-columns: minmax(0, 1fr) auto;
  width: clamp(15rem, calc(50vw - 200px), 24rem);
  padding: var(--sp-5);
  translate: none;
}

@starting-style {
  .ds--phone[open] .ds-bar {
    opacity: 0;
    translate: 0 24px;
  }
}

.ds--phone.is-leaving .ds-bar {
  translate: 0 16px;
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
  .ds-scrim,
  .ds-sheet,
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
