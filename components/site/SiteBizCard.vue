<template>
  <!--
    The Finctory business card, as an easter egg. Drag it to spin it (it keeps
    a little momentum and settles on a face), tap or press Enter to flip it.
    The phone number on the paper card is left off on purpose.
  -->
  <div class="bc-stage" :class="{ 'is-grab': dragging }">
    <div
      ref="card"
      class="bc"
      role="button"
      tabindex="0"
      :aria-describedby="hintId"
      :aria-pressed="back ? 'true' : 'false'"
      :style="{ '--rx': `${rx}deg`, '--ry': `${ry}deg`, '--mx': `${mx}%`, '--my': `${my}%` }"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @pointerleave="leave"
      @keydown.enter.prevent="flip"
      @keydown.space.prevent="flip"
    >
      <div class="bc-face bc-front" :aria-hidden="back ? 'true' : 'false'">
        <p class="bc-brand"><span class="bc-word">finctory</span><span class="bc-caps">FINCTORY</span></p>
        <p class="bc-motto" lang="zh-Hant">財務韌性<br />科技共行</p>
        <div class="bc-who">
          <p class="bc-role" lang="zh-Hant">技術長</p>
          <p class="bc-role-en">CHIEF TECHNOLOGY OFFICER</p>
          <p class="bc-name" lang="zh-Hant">黃鉅燊</p>
          <p class="bc-name-en">Huang, Ju-Shen</p>
        </div>
        <p class="bc-foot"><span>jushenhuang.jason@gmail.com</span><span>finctory.com</span></p>
      </div>

      <div class="bc-face bc-back" :aria-hidden="back ? 'false' : 'true'">
        <p class="bc-brand bc-brand--big"><span class="bc-word">finctory</span><span class="bc-caps">FINCTORY</span></p>
        <p class="bc-secret">{{ t.secret }}</p>
      </div>
    </div>
    <!-- The name comes from the face showing, so it matches what is seen (WCAG 2.5.3); how to flip is a description. -->
    <p :id="hintId" class="bc-hint">{{ t.flip }}</p>
  </div>
</template>

<script setup>
const { locale } = useLocale()
const t = computed(() =>
  locale.value === 'en'
    ? { flip: 'Press to flip the card.', secret: 'You found the back. Say hi.' }
    : { flip: '按一下翻面', secret: '你翻到背面了，來打聲招呼吧。' }
)

const hintId = useId()
const card = ref(null)
const rx = ref(-6)
const ry = ref(-14)
const mx = ref(30)
const my = ref(20)
const dragging = ref(false)

// Which face is towards the viewer, from the current spin.
const back = computed(() => {
  const a = ((ry.value % 360) + 360) % 360
  return a > 90 && a < 270
})

let raf = 0
let vx = 0
let vy = 0
let target = null // { rx, ry } to settle on once the spin dies down
let start = null
let last = null
let moved = 0
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function loop() {
  raf = 0
  if (dragging.value) return
  if (Math.abs(vy) > 0.05 || Math.abs(vx) > 0.05) {
    // Coasting: friction until slow, then pick the nearer face.
    ry.value += vy
    rx.value = Math.max(-35, Math.min(35, rx.value + vx))
    vy *= 0.94
    vx *= 0.9
    if (Math.abs(vy) < 0.6 && Math.abs(vx) < 0.6) {
      vy = vx = 0
      target = { rx: -6, ry: Math.round(ry.value / 180) * 180 + (back.value ? 14 : -14) }
    }
  } else if (target) {
    // Settle with a spring towards the resting tilt of that face.
    const dy = target.ry - ry.value
    const dx = target.rx - rx.value
    ry.value += dy * 0.12
    rx.value += dx * 0.12
    if (Math.abs(dy) < 0.05 && Math.abs(dx) < 0.05) {
      ry.value = target.ry
      rx.value = target.rx
      target = null
    }
  }
  if (target || Math.abs(vy) > 0.05) raf = requestAnimationFrame(loop)
}

function kick() {
  if (!raf) raf = requestAnimationFrame(loop)
}

function flip() {
  vx = vy = 0
  const face = Math.round(ry.value / 180) * 180 + 180
  const to = { rx: -6, ry: face + (back.value ? -14 : 14) }
  if (reduce()) {
    rx.value = to.rx
    ry.value = to.ry
    return
  }
  target = to
  kick()
}

function point(e) {
  const r = card.value.getBoundingClientRect()
  mx.value = ((e.clientX - r.left) / r.width) * 100
  my.value = ((e.clientY - r.top) / r.height) * 100
}

function down(e) {
  if (e.button !== 0) return
  start = last = { x: e.clientX, y: e.clientY, t: performance.now() }
  moved = 0
  vx = vy = 0
  target = null
}

function move(e) {
  point(e)
  if (!start) return
  const dx = e.clientX - last.x
  const dy = e.clientY - last.y
  moved += Math.abs(dx) + Math.abs(dy)
  if (!dragging.value && moved > 6) {
    dragging.value = true
    card.value.setPointerCapture?.(e.pointerId)
  }
  if (!dragging.value) return
  ry.value += dx * 0.5
  rx.value = Math.max(-35, Math.min(35, rx.value - dy * 0.35))
  const dt = Math.max(8, performance.now() - last.t)
  vy = ((dx * 0.5) / dt) * 16
  vx = ((-dy * 0.35) / dt) * 16
  last = { x: e.clientX, y: e.clientY, t: performance.now() }
}

function up(e) {
  if (!start) return
  const wasDrag = dragging.value
  start = null
  dragging.value = false
  card.value.releasePointerCapture?.(e.pointerId)
  if (!wasDrag) return flip()
  if (reduce()) vx = vy = 0
  if (!vx && !vy) target = { rx: -6, ry: Math.round(ry.value / 180) * 180 + (back.value ? 14 : -14) }
  kick()
}

function leave() {
  if (!dragging.value) {
    mx.value = 30
    my.value = 20
  }
}

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.bc-hint {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.bc-stage {
  position: relative;
  display: grid;
  place-items: center;
  height: 100%;
  padding: var(--sp-5);
  perspective: 1100px;
}

.bc {
  --navy: #0d1730;
  --edge: rgb(140 170 255 / 0.35);
  position: relative;
  width: min(100%, 26rem);
  aspect-ratio: 91 / 55;
  transform-style: preserve-3d;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
  outline: none;
}

.is-grab .bc {
  cursor: grabbing;
}

.bc:focus-visible .bc-face {
  box-shadow:
    0 0 0 3px var(--bg),
    0 0 0 5px var(--accent, #2b4fd8),
    0 30px 60px -20px rgb(0 0 0 / 0.55);
}

.bc-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 14px;
  color: #e9eeff;
  background:
    radial-gradient(120% 140% at 0% 0%, #22346a 0%, transparent 55%),
    radial-gradient(90% 120% at 100% 100%, #2b2350 0%, transparent 60%),
    var(--navy);
  box-shadow:
    inset 0 0 0 1px var(--edge),
    0 2px 4px rgb(0 0 0 / 0.25),
    0 30px 60px -20px rgb(0 0 0 / 0.55);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* A strip of light that slides across the card as it turns and follows the pointer. */
.bc-face::after {
  content: '';
  position: absolute;
  inset: -40%;
  background:
    linear-gradient(
      105deg,
      transparent 40%,
      rgb(255 255 255 / 0.16) 47%,
      rgb(180 200 255 / 0.28) 50%,
      rgb(255 255 255 / 0.12) 53%,
      transparent 60%
    );
  transform: translateX(calc((var(--mx) - 50) * 0.6%)) translateY(calc((var(--my) - 50) * 0.3%));
  mix-blend-mode: screen;
  pointer-events: none;
}

.bc-back {
  transform: rotateY(180deg);
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.6em;
}

.bc-brand {
  position: absolute;
  top: 7%;
  left: 5.5%;
  display: flex;
  align-items: baseline;
  gap: 0.5em;
  font-size: clamp(0.9rem, 0.6rem + 1vw, 1.15rem);
}

.bc-brand--big {
  position: static;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
  font-size: clamp(1.6rem, 1rem + 2.4vw, 2.4rem);
}

.bc-word {
  font-weight: 600;
  font-style: italic;
  letter-spacing: -0.02em;
}

.bc-caps {
  font-size: 0.5em;
  letter-spacing: 0.32em;
  opacity: 0.7;
}

.bc-secret {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: rgb(200 212 255 / 0.7);
}

.bc-motto {
  position: absolute;
  bottom: 22%;
  right: 6%;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.5;
  text-align: right;
  color: rgb(200 212 255 / 0.6);
}

.bc-who {
  position: absolute;
  left: 5.5%;
  bottom: 20%;
}

.bc-role {
  font-size: 0.72rem;
  font-weight: 700;
  color: #8fb0ff;
}

.bc-role-en {
  font-size: 0.5rem;
  letter-spacing: 0.18em;
  color: #6f8fe0;
}

.bc-name {
  margin-top: 0.3em;
  font-size: clamp(1.4rem, 1rem + 1.4vw, 1.9rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.04em;
}

.bc-name-en {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: rgb(200 212 255 / 0.65);
}

.bc-foot {
  position: absolute;
  left: 5.5%;
  right: 6%;
  bottom: 7%;
  display: flex;
  justify-content: space-between;
  padding-top: 0.55em;
  border-top: 1px solid rgb(120 150 255 / 0.35);
  font-size: 0.6rem;
  letter-spacing: 0.04em;
  color: rgb(200 212 255 / 0.75);
}

</style>
