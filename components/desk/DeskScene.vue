<template>
  <!--
    The opening: my desk. A real-time 3D room (modelled and lit in Blender,
    lighting baked into two pictures, one for day and one for night). Scrolling
    walks the camera from one thing on the desk to the next, and each one
    opens a part of my story. Day/night follows the site theme: the sun
    through the window, or only the lamp and the screens.

    The layout is decided by CSS, not by script, so the server HTML already
    has it: at 900px and up without reduced motion the section is tall, the
    stage sticks and the captions change as you scroll - over the still render
    until the 3D has loaded (or for good, on save-data or if WebGL fails).
    On phones and under reduced motion the still shows with the name and
    thesis over it, followed by the walk as a row of picture cards.
  -->
  <section ref="root" class="dk" :class="{ 'is-ready': ready }" :style="{ '--stops': stops.length }" :aria-label="t.label">
    <div class="dk-stage">
      <!--
        One still downloads, not two: <picture> picks day or night from the
        system scheme before any CSS runs, so a phone spends its first
        bandwidth on the picture it will show (both used to load at high
        priority, one of them hidden). Only when the toggle overrides the
        system does the other still appear - lazy, so it loads only then.
      -->
      <div class="dk-poster" aria-hidden="true">
        <picture class="dk-poster-auto">
          <source media="(prefers-color-scheme: dark)" :srcset="srcset('/desk/poster-night.webp')" sizes="100vw" />
          <img src="/desk/poster-day.webp" :srcset="srcset('/desk/poster-day.webp')" sizes="100vw" alt="" width="1600" height="1000" fetchpriority="high" />
        </picture>
        <img class="dk-forced dk-forced-day" src="/desk/poster-day.webp" :srcset="srcset('/desk/poster-day.webp')" sizes="100vw" alt="" width="1600" height="1000" loading="lazy" />
        <img class="dk-forced dk-forced-night" src="/desk/poster-night.webp" :srcset="srcset('/desk/poster-night.webp')" sizes="100vw" alt="" width="1600" height="1000" loading="lazy" />
      </div>
      <!--
        Until the 3D is ready (several seconds on a cold load), scrolling
        still walks the desk: each stop shows its own still, the same frame
        the camera will land on, and the canvas fades in over it when ready.
      -->
      <div v-if="stillsOn" class="dk-stills" aria-hidden="true">
        <template v-for="(s, i) in stops" :key="s.id">
          <div v-if="i > 0 && on === i" class="dk-still">
            <img class="dk-poster-day" :src="`/desk/stops/${s.id}-day.webp`" alt="" width="1200" height="800" decoding="async" />
            <img class="dk-poster-night" :src="`/desk/stops/${s.id}-night.webp`" alt="" width="1200" height="800" decoding="async" />
          </div>
        </template>
      </div>
      <canvas ref="canvas" class="dk-canvas" aria-hidden="true" />
      <div class="dk-veil" :class="{ 'is-on': on === 0 }" aria-hidden="true" />

      <p v-if="hover" class="dk-tag" :style="{ left: `${hover.x}px`, top: `${hover.y}px` }" aria-hidden="true">
        {{ hover.label }}
      </p>

      <!--
        One caption per stop. In 3D only the current one shows, and none while
        the camera is between stops, so a card never names the wrong thing.
        All stay in the tab order: tabbing into one walks the camera there.
      -->
      <ol class="dk-caps">
        <li
          v-for="(s, i) in stops"
          :key="s.id"
          class="dk-cap"
          :data-stop="s.id"
          :class="[`dk-cap--${s.id}`, s.side && `dk-cap--${s.side}`, { 'is-on': on === i && !moving && !leaving }]"
          @focusin="walkToFocus(i)"
        >
          <template v-if="s.id === 'hero'">
            <h1 class="dk-title">
              <span class="dk-name">{{ t.name }}</span>{{ ' ' }}<span class="dk-thesis">{{ t.thesis }}</span>
            </h1>
            <p class="dk-hint">{{ t.hint }}</p>
            <a href="#about" class="dk-skip">{{ t.skip }}</a>
          </template>
          <template v-else>
            <p class="dk-eyebrow figures">{{ String(i).padStart(2, '0') }} · {{ s.thing }}</p>
            <h2 class="dk-h">{{ s.title }}</h2>
            <p class="dk-text">{{ s.text }}</p>
            <p class="dk-acts">
              <button v-if="s.open" type="button" class="dk-open" :data-stop="s.id" @click="drawer = s.id">{{ s.open }}</button>
              <NuxtLink v-if="s.href" :to="s.href" class="dk-link" :aria-current="s.href.includes('#') ? false : undefined">{{ s.cta }} →</NuxtLink>
            </p>
          </template>
        </li>
      </ol>

      <!-- The stops as buttons: jump straight to one, by mouse or keyboard. -->
      <nav class="dk-dots" :class="{ 'is-gone': leaving }" :aria-label="t.stopsLabel">
        <button
          v-for="(s, i) in stops"
          :key="s.id"
          type="button"
          :class="{ 'is-on': on === i }"
          :aria-label="s.thing ?? t.name"
          :aria-current="on === i ? 'step' : undefined"
          @click="scrollToStop(i)"
        >
          <span class="dk-dot" />
          <span class="dk-dot-label" aria-hidden="true">{{ s.thing ?? t.name }}</span>
        </button>
      </nav>
    </div>

    <!--
      Phones and reduced motion: the same walk as a row of pictures, one per
      stop, each with its caption. The pictures are frames of the 3D scene
      (scripts/make-desk-stills.mjs); CSS shows the day or night set.
    -->
    <ol class="dk-tour" :aria-label="t.tour">
      <li v-for="(s, i) in stops.slice(1)" :key="s.id" class="dk-stop" :data-stop="s.id">
        <div class="dk-stop-pic">
          <img class="dk-poster-day" :src="`/desk/stops/${s.id}-day.webp`" :srcset="srcset(`/desk/stops/${s.id}-day.webp`)" sizes="(min-width: 900px) 25vw, 82vw" alt="" width="1200" height="800" loading="lazy" decoding="async" />
          <img class="dk-poster-night" :src="`/desk/stops/${s.id}-night.webp`" :srcset="srcset(`/desk/stops/${s.id}-night.webp`)" sizes="(min-width: 900px) 25vw, 82vw" alt="" width="1200" height="800" loading="lazy" decoding="async" />
          <span class="dk-stop-n figures" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}<span class="dk-stop-of"> / {{ String(stops.length - 1).padStart(2, '0') }}</span> · {{ s.thing }}</span>
        </div>
        <h2 class="dk-h">{{ s.title }}</h2>
        <p class="dk-text">{{ s.text }}</p>
        <p class="dk-acts">
          <button v-if="s.open" type="button" class="dk-open" :data-stop="s.id" @click="drawer = s.id">{{ s.open }}</button>
          <NuxtLink v-if="s.href" :to="s.href" class="dk-link" :aria-current="s.href.includes('#') ? false : undefined">{{ s.cta }} →</NuxtLink>
        </p>
      </li>
    </ol>
    <DeskDrawer :id="screen ? null : drawer" :origin="origin" :delay="origin ? 380 : 0" @close="closeDrawer" />
    <DeskScreen ref="scr" :screen="screen" @close="closeDrawer" />
  </section>
</template>


<script setup>
// The model's 5 kB of JSON ships inside the page code. As its own file it was
// one more round trip before the buffer and pictures could even be requested,
// and Cloudflare does not cache .gltf, so every visit went back to the origin.
import deskGltf from '~/public/desk/model/desk.gltf?raw'

// The CSS matrix3d that maps a w x h box (transform-origin at its top left) onto
// the quadrilateral p = [top left, top right, bottom right, bottom left] in
// page pixels: the square-to-quad projective map (Heckbert 1989), scaled to the box.
function quadMatrix(w, h, p) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = p
  const sx = x0 - x1 + x2 - x3
  const sy = y0 - y1 + y2 - y3
  let g = 0
  let k = 0
  if (Math.abs(sx) > 1e-9 || Math.abs(sy) > 1e-9) {
    const dx1 = x1 - x2
    const dx2 = x3 - x2
    const dy1 = y1 - y2
    const dy2 = y3 - y2
    const den = dx1 * dy2 - dx2 * dy1
    g = (sx * dy2 - dx2 * sy) / den
    k = (dx1 * sy - sx * dy1) / den
  }
  const a = x1 - x0 + g * x1
  const b = x3 - x0 + k * x3
  const d = y1 - y0 + g * y1
  const e = y3 - y0 + k * y3
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1]
  return `matrix3d(${m.map((v) => +v.toFixed(9)).join(',')})`
}
const { site } = useContent()
const { locale } = useLocale()
const isEn = computed(() => locale.value === 'en')

const t = computed(() =>
  isEn.value
    ? {
        label: 'My desk',
        name: 'Ju-Shen Huang',
        thesis: 'I take AI from demo to something people still use three months later.',
        hint: 'Scroll to walk across my desk',
        tour: 'Things on my desk',
        stopsLabel: 'Stops on the desk',
        skip: 'Skip the desk ↓',
        go: 'walk over',
      }
    : {
        label: '我的桌子',
        name: '黃鉅燊',
        thesis: '我把 AI 從展示品，​做到三個月後還有人在用。',
        hint: '往下捲，走過我的桌子',
        tour: '桌上的東西',
        stopsLabel: '書桌上的每一站',
        skip: '跳過書桌，直接看介紹 ↓',
        go: '走過去看',
      }
)

/*
  The stops. `cam` and `at` are Blender coordinates (Z up), the same numbers
  as studio/desk/build_desk.py, converted on use.
*/
const STOPS = [
  { id: 'hero', cam: [0.78, -1.42, 1.4], at: [-0.02, 0.12, 0.92] },
  { id: 'notebook', side: 'right', cam: [-0.06, -0.66, 1.16], at: [-0.2, -0.19, 0.76], spot: [-0.2, -0.22, 0.77] },
  { id: 'laptop', cam: [0.1, -0.5, 1.03], at: [0.0, 0.1, 0.85], spot: [0.0, 0.12, 0.86] },
  { id: 'phone', cam: [0.33, -0.36, 0.93], at: [0.43, -0.02, 0.83], spot: [0.43, -0.03, 0.83] },
  { id: 'tablet', side: 'right', cam: [-0.3, -0.38, 0.99], at: [-0.45, 0.09, 0.84], spot: [-0.45, 0.09, 0.84] },
  { id: 'reports', cam: [0.48, -0.25, 1.15], at: [0.5, 0.18, 0.78], spot: [0.52, 0.2, 0.79] },
  { id: 'shelf', side: 'right', cam: [0.25, -0.45, 1.5], at: [0.12, 0.52, 1.32], spot: [0.05, 0.52, 1.32] }, // from the right, so the lamp head stays out of frame
  { id: 'kuaikuai', cam: [0.08, -0.26, 0.98], at: [0.25, 0.13, 0.84], spot: [0.25, 0.12, 0.84] },
]

const stops = computed(() => {
  const c = site.counts
  const zh = {
    notebook: { thing: '筆記本', title: '今天的待辦', text: '咖啡打勾了，綠色乖乖也補了，睡覺改到下週。右頁是這週的 bug 計數：十六個，還在數。', href: '/#about', cta: '讀我怎麼想' },
    laptop: { thing: '筆電', title: '現在在做的事', text: '斐闊 Finctory 共同創辦人暨技術長、醫數行銷 MedaLink 共同創辦人暨前線部署工程師、工研院 AI Intern，同時在中央資管讀碩士班。', href: '/#record', cta: '看我走過的路' },
    phone: { thing: '手機', title: '財伴 oSave', text: '用會計邏輯記帳的 App：問你三個問題，後端轉成 13 種現金流向和 6 個財務健康指標，回答「我的財務健不健康」。', href: '/work/osave/', cta: '看財伴怎麼做的', open: '拿起來試算' },
    tablet: { thing: '平板', title: '醫數行銷 MedaLink', text: '診所的 AI 營運系統：在 LINE 上回病患、把醫師診間儀器的時段算出來，AI 那一半是我一個人做的。', href: '/work/medalink/', cta: '看診所系統', open: '排一個療程看看' },
    reports: { thing: '一疊報告', title: `${c.researchGrants} 個國科會計畫`, text: '從生成式 AI 社交工程、股市異常追蹤，到財伴的 82 人實證研究；另有一篇 LAK 2025 國際會議發表。', href: '/resume/', cta: '看完整年表', open: '翻開來看' },
    shelf: { thing: '獎盃架', title: `${c.awards} 個競賽獎項`, text: `其中 ${c.topPrizes} 個全國首獎，包括台積電校園黑客松第一名。架上只擺得下四座，其他的在年表裡，每一座都附上主辦單位和公告。`, href: '/resume/', cta: '看每一座的出處', open: '一座一座看' },
    kuaikuai: { thing: '綠色乖乖', title: '機器乖乖，不當機', text: '台灣工程師的老規矩：伺服器旁邊放一包綠色乖乖。我放的這包是台積電聯名款，到目前為止都很乖。', href: '/#contact', cta: '寫信給我' },
  }
  const enT = {
    notebook: { thing: 'Notebook', title: 'Today’s list', text: 'Coffee: done. Green Kuai Kuai: restocked. Sleep: moved to next week. The right page is this week’s bug count. Sixteen, still counting.', href: '/en/#about', cta: 'How I think' },
    laptop: { thing: 'Laptop', title: 'What I do now', text: 'Co-founder and CTO of Finctory, co-founder and forward-deployed engineer at MedaLink, AI intern at ITRI, and a master’s student at NCU.', href: '/en/#record', cta: 'See the road so far' },
    phone: { thing: 'Phone', title: 'oSave', text: 'A budgeting app built on accounting logic: three questions, turned by the backend into 13 cash-flow directions and six financial-health indicators, to answer "am I financially healthy?".', href: '/en/work/osave/', cta: 'How oSave was built', open: 'Pick it up and try it' },
    tablet: { thing: 'Tablet', title: 'MedaLink', text: 'An AI operations system for clinics: answers patients on LINE and books the slot where doctor, room and equipment are all free. I built the AI half alone.', href: '/en/work/medalink/', cta: 'See the clinic system', open: 'Book a treatment' },
    reports: { thing: 'A stack of reports', title: `${c.researchGrants} NSTC research grants`, text: 'From generative AI in social engineering and market-anomaly tracking to an 82-person study of oSave; plus a LAK 2025 paper.', href: '/en/resume/', cta: 'See the full record', open: 'Open the stack' },
    shelf: { thing: 'The shelf', title: `${c.awards} competition awards`, text: `${c.topPrizes} of them national first prizes, including first at TSMC IT CareerHack. Only four fit on the shelf; the record has the rest, each with its organiser and announcement.`, href: '/en/resume/', cta: 'Where each one came from', open: 'Every award' },
    kuaikuai: { thing: 'A green bag of Kuai Kuai', title: 'Keeps the machines good', text: 'A Taiwanese engineering custom: a bag of green Kuai Kuai next to the server keeps it from crashing. Mine is the TSMC edition. So far, so good.', href: '/en/#contact', cta: 'Write to me' },
  }
  const T = isEn.value ? enT : zh
  return STOPS.map((s) => ({ ...s, ...(T[s.id] ?? {}) }))
})

const root = ref(null)
const canvas = ref(null)
const ready = ref(false)
// The stills stay under the canvas until its 900 ms fade-in has finished.
const stillsOn = ref(true)
watch(ready, (r) => {
  if (r) setTimeout(() => (stillsOn.value = false), 1000)
  else stillsOn.value = true
})
const on = ref(0)
const moving = ref(false)
const leaving = ref(false)
const hover = ref(null)
// The stop whose thing is open in the drawer (phone, tablet, shelf, reports).
const drawer = ref(null)


let dispose = null
let alive = true

/*
  Scroll position -> stop. Each stop owns one equal slice of the section;
  the camera holds still through the middle of its slice and moves only in
  the outer 30% on either side, and the caption changes only on arrival.
*/
const N = STOPS.length
const hold = (t) => {
  const x = Math.min(1, Math.max(0, (t - 0.3) / 0.4))
  return x * x * (3 - 2 * x)
}
const walk = { i: 0, e: 0, out: 0 }
let onWalk = null
// Set by the 3D scene: lean the camera in to a stop's thing (or back out with
// null). Returns where that thing sits on screen, for the drawer to grow from.
let onFocus = null
const origin = ref(null)
// Set by the 3D scene too: the phone and the tablet are not opened in the
// drawer but picked up, the camera facing the screen and the demo running on
// it (DeskScreen). Returns the size the demo lays out at, or null when the 3D
// desk is not running (phones, reduced motion), and the drawer opens instead.
let onScreen = null
const screen = ref(null)
const TALL = '(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)'
const scr = ref(null)
let backTimer = 0
// Which thing was picked up last: a window shrunk below the 3D desk puts it
// down before the dialog closes, and focus still has to go back to its button.
let lastScreen = null
watch(drawer, (id) => {
  if (screen.value && !id) {
    onScreen?.(null)
    screen.value = null
    const html = document.documentElement
    html.classList.remove('ds-back')
    void html.offsetWidth
    html.classList.add('ds-back')
    clearTimeout(backTimer)
    backTimer = setTimeout(() => html.classList.remove('ds-back'), 1200)
    return
  }
  const s = id === 'phone' || id === 'tablet' ? onScreen?.(id) : null
  if (s) {
    screen.value = s
    lastScreen = s.id
    origin.value = null
    return
  }
  origin.value = onFocus?.(id) ?? null
})
function readScroll() {
  const el = root.value
  if (!el) return
  const span = el.offsetHeight - innerHeight
  const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / Math.max(1, span)))
  const f = Math.min(N - 1, Math.max(0, p * N - 0.5))
  const i = Math.min(N - 2, Math.floor(f))
  const e = hold(f - i)
  walk.i = i
  walk.e = e
  moving.value = e > 0.1 && e < 0.9
  // As the stage scrolls away, the room sinks into the page colour from
  // below, so the walk ends in the page instead of at a straight cut.
  const box = el.getBoundingClientRect()
  // The stage has started to scroll away with the section: the last card
  // and the dots go first, so no card floats over the page coming up.
  // The last card and the dots stay through the first part of the crane up,
  // so the move never runs with nothing on screen to read.
  leaving.value = box.bottom < innerHeight * 0.72
  // While the room fills the top of the window, the header floats on it with
  // no page-coloured band behind it.
  document.documentElement.classList.toggle('is-over-desk', box.bottom > 120)
  const gone = (innerHeight - box.bottom) / (innerHeight * 0.5)
  walk.out = Math.min(1, Math.max(0, gone))
  el.style.setProperty('--out', walk.out.toFixed(3))
  if (e < 0.08) on.value = i
  else if (e > 0.92) on.value = i + 1
  onWalk?.()
  // Left between two stops, the room has no words on it. Once the reader
  // stops scrolling, walk the rest of the way to the nearer stop.
  clearTimeout(settle)
  const inside = box.top <= 1 && box.bottom >= innerHeight - 1
  if (inside && e > 0.1 && e < 0.9) settle = setTimeout(() => scrollToStop(e < 0.5 ? i : i + 1), 220)
}
let settle = 0
function scrollToStop(i) {
  const el = root.value
  const span = el.offsetHeight - innerHeight
  scrollTo({ top: el.getBoundingClientRect().top + scrollY + (span * (i + 0.5)) / N, behavior: 'smooth' })
}

// The dialog hands focus back to whatever had it, which is the page itself
// when it was opened by clicking the 3D desk; Tab would then start from the
// hero and scroll back up. Put focus on the visible button for this object.
function closeDrawer() {
  const id = drawer.value ?? lastScreen
  drawer.value = null
  const all = [...(root.value?.querySelectorAll(`.dk-open[data-stop="${id}"]`) ?? [])].filter((b) => b.offsetParent && !b.closest('[inert]'))
  const btn = all.find((b) => b.closest('.is-on')) ?? all[0]
  btn?.focus({ preventScroll: true })
}

// When the caption you were on goes inert, take keyboard focus to the new one.
// Focus landing in another caption walks the camera there. Stops passed on
// the way must not pull focus to themselves, so for the length of that walk
// focus stays in the caption the reader chose.
let walkTo = -1
let walkUntil = 0
function walkToFocus(i) {
  if (on.value === i) return
  walkTo = i
  walkUntil = performance.now() + 1500
  scrollToStop(i)
}
watch(on, async (i) => {
  const a = document.activeElement
  if (!root.value?.contains(a) || !a.closest('.dk-cap')) return
  await nextTick()
  const caps = root.value.querySelectorAll('.dk-cap')
  if (performance.now() < walkUntil && caps[walkTo]?.contains(document.activeElement)) return
  const cap = caps[i]
  // Already in it (focusing a link there is what walked the camera, or
  // Shift+Tab came back into it): leave focus where the reader put it.
  if (cap?.contains(document.activeElement)) return
  cap?.querySelector('a, button')?.focus({ preventScroll: true })
})

// Resizing across the 3D desk's size limit swaps the caption cards for the
// picture tour (or back). Focus left on a button that is now hidden would fall
// to the page; move it to the same button for the same stop in the shown layout.
// Chrome may already have dropped focus to the page by the time the change
// event fires, so remember what last had focus here; act after layout.
let tallMq = null
let lastIn = null
// Focus or a press anywhere else forgets it, so a resize never pulls focus back here.
const noteFocus = (e) => (lastIn = root.value?.contains(e.target) ? e.target : null)
function keepFocus() {
  requestAnimationFrame(moveFocus)
}
function moveFocus() {
  let a = document.activeElement
  if ((!a || a === document.body) && lastIn && !lastIn.offsetParent) a = lastIn
  if (!a || !root.value?.contains(a) || a.offsetParent) return
  const id = a.closest('[data-stop]')?.dataset.stop
  const kind = a.classList.contains('dk-link') ? '.dk-link' : '.dk-open'
  const next = [...root.value.querySelectorAll(`[data-stop="${id}"] ${kind}, ${kind}[data-stop="${id}"]`)].find((b) => b !== a && b.offsetParent && !b.closest('[inert]'))
  next?.focus({ preventScroll: true })
}

onMounted(() => {
  tallMq = matchMedia(TALL)
  tallMq.addEventListener('change', keepFocus)
  document.addEventListener('focusin', noteFocus)
  document.addEventListener('pointerdown', noteFocus)
  const tall = tallMq.matches
  if (!tall) return
  readScroll()
  addEventListener('scroll', readScroll, { passive: true })
  addEventListener('resize', readScroll)
  if (navigator.connection?.saveData) return
  // A machine without a GPU draws WebGL on the CPU (SwiftShader, llvmpipe):
  // the room would freeze the page for seconds, so the still stays.
  if (softwareGL()) return
  warm()
  // The page paints first; the room is built after. If it fails, the still stays.
  const go = () =>
    start().catch(() => dispose?.())
  'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 400)
})

onBeforeUnmount(() => {
  alive = false
  tallMq?.removeEventListener('change', keepFocus)
  document.removeEventListener('focusin', noteFocus)
  document.removeEventListener('pointerdown', noteFocus)
  clearTimeout(settle)
  document.documentElement.classList.remove('is-over-desk')
  removeEventListener('scroll', readScroll)
  removeEventListener('resize', readScroll)
  dispose?.()
})

// Download everything the room needs at once, while the page hydrates,
// instead of one step after another (three.js, then the model, then its
// buffer and pictures). The loaders in start() then read them from cache.
function warm() {
  const th = document.documentElement.dataset.theme
  const mood = (th ? th === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches) ? 'night' : 'day'
  import('three').catch(() => {})
  for (const g of ['desk', 'room']) {
    const img = new Image()
    img.crossOrigin = 'anonymous' // as three's TextureLoader asks, so the cached copy matches
    img.src = `/desk/${g}_${mood}.webp`
  }
  const j = JSON.parse(deskGltf)
  for (const x of [...(j.buffers ?? []), ...(j.images ?? [])])
    if (x.uri && !x.uri.startsWith('data:')) fetch(`/desk/model/${x.uri}`).catch(() => {})
}

function softwareGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!gl) return true
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /swiftshader|llvmpipe|software|basic render/i.test(String(name))
  } catch {
    return true
  }
}

async function start() {
  const owned = [] // GPU things to free on the way out
  const THREE = await import('three')
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
  const { Vector3 } = THREE
  const B = (a) => new Vector3(a[0], a[2], -a[1]) // Blender (Z up) -> three (Y up)

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  const room = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(room, 0.04).texture
  owned.push(env)
  let raf = 0
  let gone = false
  let teardown = () => {}
  dispose = () => {
    if (gone) return
    gone = true
    cancelAnimationFrame(raf)
    teardown()
    for (const x of owned) x?.dispose?.()
    room.traverse((o) => {
      o.geometry?.dispose()
      o.material?.dispose?.()
    })
    pmrem.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    ready.value = false
  }
  // A lost GPU context would leave a black canvas over the still: drop back to the still.
  canvas.value.addEventListener('webglcontextlost', () => dispose(), { once: true })
  const scene = new THREE.Scene()
  scene.environment = env

  // Same lens as the Blender camera: 30 mm on a 36 mm sensor.
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.02, 30)

  const dark = () => {
    const th = document.documentElement.dataset.theme
    return th ? th === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  }
  // Screens and the desk are seen at a slant; without the most anisotropic
  // filtering the GPU offers, a 1900 px screenshot smears into a grey blur.
  const maxAniso = renderer.capabilities.getMaxAnisotropy()
  const sharpen = (map) => {
    if (!map) return
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = maxAniso
    map.needsUpdate = true
  }
  const tl = new THREE.TextureLoader()
  const tex = (url) =>
    new Promise((res, rej) =>
      tl.load(url, (x) => {
        x.flipY = false
        // Display-ready sRGB from Blender (AgX). Decoded to linear on sampling and
        // encoded back on output, so what Blender showed is what the page shows.
        x.colorSpace = THREE.SRGBColorSpace
        x.anisotropy = maxAniso
        owned.push(x)
        res(x)
      }, undefined, rej)
    )

  const night = { value: dark() ? 1 : 0 }
  const first = night.value ? 'night' : 'day'
  const other = night.value ? 'day' : 'night'
  const blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1)
  blank.needsUpdate = true
  owned.push(blank)
  const baked = {}
  for (const g of ['desk', 'room']) {
    baked[g] = new THREE.ShaderMaterial({
      uniforms: { uDay: { value: blank }, uNight: { value: blank }, uMix: night },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `
        uniform sampler2D uDay;
        uniform sampler2D uNight;
        uniform float uMix;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(texture2D(uDay, vUv).rgb, texture2D(uNight, vUv).rgb, uMix), 1.0);
          #include <colorspace_fragment>
        }`,
    })
    owned.push(baked[g])
  }

  // A plain glTF whose .bin and textures are ordinary same-origin files: the
  // live CSP allows only 'self', which rules out a GLB's blob: textures and
  // Draco's blob: worker.
  const loader = new GLTFLoader()
  const [gltf, d1, r1] = await Promise.all([
    loader.parseAsync(deskGltf, '/desk/model/'),
    tex(`/desk/desk_${first}.webp`),
    tex(`/desk/room_${first}.webp`),
  ])
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return
    owned.push(o.geometry)
    for (const m of [].concat(o.material)) owned.push(m, m.map, m.emissiveMap)
  })
  // Left the page while it was loading: nothing to show it on.
  if (!alive) return dispose()
  const key = first === 'day' ? 'uDay' : 'uNight'
  baked.desk.uniforms[key].value = d1
  baked.room.uniforms[key].value = r1
  baked.desk.uniforms[first === 'day' ? 'uNight' : 'uDay'].value = d1
  baked.room.uniforms[first === 'day' ? 'uNight' : 'uDay'].value = r1
  // The other mood arrives later; until then both slots hold the first.
  Promise.all([tex(`/desk/desk_${other}.webp`), tex(`/desk/room_${other}.webp`)])
    .then(([d2, r2]) => {
      if (gone) return
      const k2 = other === 'day' ? 'uDay' : 'uNight'
      baked.desk.uniforms[k2].value = d2
      baked.room.uniforms[k2].value = r2
      kick()
    })
    .catch(() => {}) // the theme switch then keeps the first mood; nothing else breaks

  const glow = []
  const shiny = []
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return
    if (o.name.startsWith('baked_desk')) o.material = baked.desk
    else if (o.name.startsWith('baked_room')) o.material = baked.room
    else if (o.name.startsWith('screen_')) {
      const m = o.material
      const map = m.emissiveMap || m.map
      sharpen(map)
      o.material = new THREE.MeshBasicMaterial({ map, toneMapped: false })
      owned.push(o.material)
      glow.push(o.material)
    } else if (o.name.startsWith('kuaikuai')) {
      // The bag keeps its own sharp photo texture instead of the shared bake.
      // Shading is computed once from the window's direction into vertex colours,
      // and applyMood sets the overall brightness, so day and night stay in step
      // with the baked room around it.
      const map = o.material.map
      sharpen(map)
      const g = o.geometry
      const nrm = g.attributes.normal
      const col = new Float32Array(nrm.count * 3)
      const key = new Vector3(-0.75, 0.55, 0.35).normalize() // window: left, a little high
      const n3 = new Vector3()
      o.updateWorldMatrix(true, false)
      const q = new THREE.Matrix3().getNormalMatrix(o.matrixWorld)
      for (let i = 0; i < nrm.count; i++) {
        n3.fromBufferAttribute(nrm, i).applyMatrix3(q).normalize()
        const v = 0.62 + 0.38 * Math.max(0, n3.dot(key))
        col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = v
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3))
      // alphaTest cuts the photo's outline (the crimped seals, the pinched sides) out of the box-shaped mesh.
      o.material = new THREE.MeshBasicMaterial({ map, vertexColors: true, toneMapped: false, alphaTest: 0.5, side: THREE.DoubleSide })
      o.userData.bag = true
      owned.push(o.material)
    } else if (o.name.startsWith('print_')) {
      // Printed paper with its own sharp texture; applyMood dims it with the room.
      const m = o.material
      const map = m.emissiveMap || m.map
      sharpen(map)
      o.material = new THREE.MeshBasicMaterial({ map, toneMapped: false })
      // The painting hangs out of the lamp's reach, so at night it goes nearly as dark as the wall.
      o.userData.paper = o.name.startsWith('print_art') ? 'far' : 'near'
      owned.push(o.material)
    } else if (o.name.startsWith('window_glass')) {
      o.material = new THREE.MeshBasicMaterial({ color: 0xdfe9f5 })
      owned.push(o.material)
      o.userData.sky = true
      glow.push(o.material)
    } else if (o.name.startsWith('lamp_bulb')) {
      o.material = new THREE.MeshBasicMaterial({ color: 0xffd9a8, transparent: true })
      owned.push(o.material)
      o.userData.bulb = true
    } else {
      // Trophies and the plaque: real metal and glass, lit by the room.
      if (o.name.startsWith('crystal')) {
        // Clear glass by reflection only; real transmission costs a second full render every frame.
        // Faintly blue and mostly see-through, with the room's reflections
        // pushed up, so it reads as glass against the white wall rather than
        // as a frosted white slab.
        // Standard, not Physical: the clearcoat shader cost a second of
        // main-thread time to compile (Lighthouse TBT 1.5 s -> 2.7 s).
        o.material = new THREE.MeshStandardMaterial({
          color: 0x7fa6d6,
          roughness: 0.02,
          metalness: 0,
          envMapIntensity: 2.4,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        })
        o.material.userData.env = 2.4
        owned.push(o.material)
      }
      o.material.userData.emit = o.material.emissiveIntensity ?? 0
      shiny.push(o.material)
    }
  })
  scene.add(gltf.scene)

  const applyMood = () => {
    const n = night.value
    for (const m of shiny) {
      if ('envMapIntensity' in m) m.envMapIntensity = (m.userData.env ?? 1) * (1 - 0.94 * n)
      // The printed certificate is lit a little by day so it reads; at night only the lamp reaches it.
      if (m.emissiveMap) m.emissiveIntensity = m.userData.emit * (1 - 0.9 * n)
    }
    gltf.scene.traverse((o) => {
      if (o.userData.sky) o.material.color.setRGB(0.87 - 0.78 * n, 0.91 - 0.79 * n, 0.96 - 0.72 * n)
      if (o.userData.bulb) o.material.opacity = 0.15 + 0.85 * n
      // Matched to the baked wall beside it: daylight by day, a little warm lamp spill at night.
      if (o.userData.bag) o.material.color.setRGB(0.92 - 0.72 * n, 0.92 - 0.75 * n, 0.9 - 0.78 * n)
      if (o.userData.paper === 'near') o.material.color.setRGB(0.86 - 0.66 * n, 0.85 - 0.68 * n, 0.83 - 0.71 * n)
      if (o.userData.paper === 'far') o.material.color.setRGB(0.86 - 0.76 * n, 0.85 - 0.76 * n, 0.83 - 0.73 * n)
    })
    for (const m of glow) if (m.map) m.color.setScalar(0.88 + 0.12 * n)
  }
  applyMood()

  // ---- camera path ----------------------------------------------------
  const path = STOPS.map((s) => ({ cam: B(s.cam), at: B(s.at), spot: s.spot ? B(s.spot) : null, side: !s.spot ? 0 : s.side === 'right' ? 1 : -1 }))
  // The stops were framed at 1440x900. On a narrower or shorter window the
  // caption card takes more of the picture, so the picture slides away from it
  // (a shifted view window, the camera itself stays put): px per unit of side.
  const view = { w: 1, h: 1, shift: 0, shiftY: 0, want: 0, reach: 0 }
  const want = { cam: path[0].cam.clone(), at: path[0].at.clone() }
  // Close and nearly straight down, so the frame is the open notebook alone:
  // the mug and the tablet stay outside it.
  const exit = { cam: B([-0.2, -0.3, 1.24]), at: B([-0.2, -0.19, 0.76]) }
  const cur = { cam: want.cam.clone(), at: want.at.clone() }
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  const el = root.value
  const onScroll = () => {
    const { i, e } = walk
    const a = path[i]
    const b = path[i + 1]
    want.cam.lerpVectors(a.cam, b.cam, e)
    want.at.lerpVectors(a.at, b.at, e)
    // Rise a little between stops, as if leaning back to look for the next thing.
    want.cam.y += 0.06 * Math.sin(Math.PI * e)
    view.want = (a.side + ((b ?? a).side - a.side) * e) * (1 - walk.out)
    // Leaving: the camera cranes up off the last stop and settles over the
    // open notebook, the first thing on the tour, while the room sinks into
    // the page colour. The walk ends where it began, on the page.
    if (walk.out > 0) {
      const o = walk.out * walk.out * (3 - 2 * walk.out)
      want.cam.lerp(exit.cam, o)
      want.at.lerp(exit.at, o)
    }
    kick()
  }

  const size = () => {
    const w = canvas.value.clientWidth
    const h = canvas.value.clientHeight
    renderer.setSize(w, h, false)
    view.w = w
    view.h = h
    view.reach = w * 0.13 * Math.min(1, Math.max(0, (1500 - w) / 500, (900 - h) / 300))
    camera.aspect = w / h
    // Keep the 16:9 framing of the Blender camera; narrower windows widen the view instead of cropping.
    camera.fov = camera.aspect < 16 / 9 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(36) / 2) * (16 / 9) / camera.aspect)) : 36
    camera.updateProjectionMatrix()
    if (sf.on) {
      // Too small for the 3D desk now (the page below takes over): put it down.
      if (!matchMedia(TALL).matches) drawer.value = null
      else screen.value = layout(pose())
    }
    kick()
  }

  const onMove = (ev) => {
    const r = canvas.value.getBoundingClientRect()
    mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1
    mouse.y = ((ev.clientY - r.top) / r.height) * 2 - 1
    // Hover: the nearest stop whose spot is within reach of the pointer.
    let best = null
    path.forEach((p, i) => {
      if (!p.spot) return
      const v = p.spot.clone().project(camera)
      const x = ((v.x + 1) / 2) * r.width
      const y = ((1 - v.y) / 2) * r.height
      const d = Math.hypot(x - (ev.clientX - r.left), y - (ev.clientY - r.top))
      if (v.z < 1 && d < 70 && (!best || d < best.d)) best = { i, d, x, y }
    })
    // The thing you are standing at opens; any other thing walks you to it.
    const st = best && stops.value[best.i]
    const here = best && best.i === on.value && !moving.value && st.open
    hover.value = best ? { i: best.i, x: best.x, y: best.y, label: here ? `${st.thing} · ${st.open}` : best.i === on.value ? st.thing : `${st.thing} · ${t.value.go}`, here } : null
    canvas.value.style.cursor = best ? 'pointer' : ''
    kick()
  }
  const onLeave = () => {
    hover.value = null
    mouse.x = mouse.y = 0
    kick()
  }
  // Picking a thing up: the camera leans in to it, then the drawer opens out
  // of it; closing the drawer, the camera leans back to where it stood.
  const focus = { i: -1, on: false }
  const pc = new THREE.Vector3()
  const pa = new THREE.Vector3()
  onFocus = (id) => {
    const i = id ? stops.value.findIndex((s) => s.id === id) : -1
    focus.on = i >= 0 && !!path[i].spot
    // The name tag would float over the thing as the camera leans in.
    hover.value = null
    kick()
    if (!focus.on) return null
    focus.i = i
    const r = canvas.value.getBoundingClientRect()
    const v = path[i].spot.clone().project(camera)
    return { x: Math.round(r.left + ((v.x + 1) / 2) * r.width), y: Math.round(r.top + ((1 - v.y) / 2) * r.height) }
  }
  // Picking up the phone or the tablet: the camera turns square to its screen,
  // close enough that the screen fills the window above the bar, and the demo
  // (DeskScreen's .ds-device) is laid over the screen every frame.
  // px kept free under the screen for DeskScreen's bar; the phone has its bar
  // beside it instead and takes the full height.
  const bar = () => (sf.id === 'phone' ? 24 : 128)
  const sf = { on: false, id: null, c: new Vector3(), n: new Vector3(), u: new Vector3(), cam: new Vector3(), corners: [], aspect: 1, hWorld: 1, offY: 0, shown: false }
  const worldUp = new Vector3(0, 1, 0)
  cur.up = worldUp.clone()
  const pose = () => {
    const availH = view.h - bar() - 24
    const fitH = Math.min(availH * (sf.id === 'phone' ? 0.97 : 0.94), ((view.w - 48) * 0.94) / sf.aspect)
    const d = (sf.hWorld * view.h) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * fitH)
    sf.cam.copy(sf.c).addScaledVector(sf.n, d)
    // The screen centred in the space above the bar, not in the window.
    sf.offY = (bar() - 24) / 2
    return fitH
  }
  // Laid out at the size it shows at once the camera has arrived, so the text
  // ends up at 1:1 and sharp; the phone never narrower than 300 px of layout.
  const layout = (fitH) => {
    const w = sf.id === 'phone' ? Math.max(300, Math.round(fitH * sf.aspect)) : Math.min(1400, Math.max(640, Math.round(fitH * sf.aspect)))
    return { id: sf.id, w, h: Math.round(w / sf.aspect) }
  }
  // The demo from last time is still in the (closed) dialog: hide it, so it
  // does not show for a frame where it was before the camera has moved.
  const reset = () => {
    const dev = scr.value?.device
    if (dev) {
      dev.classList.remove('is-on')
      dev.style.transform = ''
    }
  }
  onScreen = (id) => {
    reset()
    if (!id) {
      sf.on = false
      sf.shown = false
      kick()
      return null
    }
    const mesh = gltf.scene.getObjectByName(`screen_${id}`)
    if (!mesh) return null
    mesh.updateWorldMatrix(true, false)
    const g = mesh.geometry
    if (!g.boundingBox) g.computeBoundingBox()
    const hx = g.boundingBox.max.x
    const hz = g.boundingBox.max.z
    // The screen is a plane in its own x/z; uv (0,0), the picture's top left, is at (-x, -z).
    sf.corners = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([x, z]) => new Vector3(x, 0, z).applyMatrix4(mesh.matrixWorld))
    sf.c.copy(sf.corners[0]).add(sf.corners[2]).multiplyScalar(0.5)
    const e = mesh.matrixWorld.elements
    sf.n.set(e[4], e[5], e[6]).normalize()
    if (sf.n.dot(camera.position.clone().sub(sf.c)) < 0) sf.n.negate()
    sf.u.set(-e[8], -e[9], -e[10]).normalize()
    sf.hWorld = sf.corners[0].distanceTo(sf.corners[3])
    sf.aspect = sf.corners[0].distanceTo(sf.corners[1]) / sf.hWorld
    sf.mat = mesh.material
    sf.id = id
    sf.on = true
    sf.shown = false
    hover.value = null
    const fitH = pose()
    kick()
    return layout(fitH)
  }
  // Lay the demo over the screen: the projective map that takes the element's
  // own rectangle onto the screen's four corners as they are drawn right now.
  const q = new Vector3()
  const place = (el) => {
    const r = canvas.value.getBoundingClientRect()
    const p = sf.corners.map((v) => {
      q.copy(v).project(camera)
      return [r.left + ((q.x + 1) / 2) * r.width, r.top + ((1 - q.y) / 2) * r.height]
    })
    el.style.transform = quadMatrix(el.offsetWidth, el.offsetHeight, p)
    // The 3D screen's brightness (it dims a little with the room's light), as a
    // CSS brightness, so the page's copy of the picture matches it exactly.
    el.style.setProperty('--glow', Math.pow(sf.mat?.color?.r ?? 1, 1 / 2.2).toFixed(3))
  }
  const onClick = (ev) => {
    // A tap has no hover before it: find what is under the finger first.
    if (ev.pointerType !== 'mouse') onMove(ev)
    if (hover.value?.here) drawer.value = stops.value[hover.value.i].id
    else if (hover.value) scrollToStop(hover.value.i)
  }

  const mo = new MutationObserver(() => {
    target = dark() ? 1 : 0
    kick()
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  let target = night.value

  // Draw only while something moves: once the camera, the pointer sway and
  // the day/night fade have settled, the loop stops until the next change.
  let visible = true
  function kick() {
    if (!raf && visible && !gone) raf = requestAnimationFrame(frame)
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    kick()
  })
  io.observe(el)

  // Each easing below was tuned per frame at 60 Hz; `ease(k)` gives the same
  // feel per unit of time, so a 144 Hz screen does not move twice as fast.
  let last = 0
  let dt = 1
  const ease = (k) => 1 - Math.pow(1 - k, dt)
  function frame(now) {
    raf = 0
    if (!visible || gone) return
    dt = last ? Math.min(4, (now - last) / (1000 / 60)) : 1
    last = now
    mouse.sx += (mouse.x - mouse.sx) * ease(0.05)
    mouse.sy += (mouse.y - mouse.sy) * ease(0.05)
    let tc = want.cam
    let ta = want.at
    const tu = sf.on ? sf.u : worldUp
    if (sf.on) {
      tc = sf.cam
      ta = sf.c
    } else if (focus.on) {
      const spot = path[focus.i].spot
      tc = pc.copy(want.cam).lerp(spot, 0.4)
      ta = pa.copy(want.at).lerp(spot, 0.85)
    }
    cur.cam.lerp(tc, ease(0.09))
    cur.at.lerp(ta, ease(0.09))
    cur.up.lerp(tu, ease(0.09)).normalize()
    const shiftTo = sf.on ? 0 : view.want * view.reach
    const shiftYTo = sf.on ? sf.offY : 0
    view.shiftY += (shiftYTo - view.shiftY) * ease(0.09)
    if (Math.abs(shiftYTo - view.shiftY) < 0.25) view.shiftY = shiftYTo
    view.shift += (shiftTo - view.shift) * ease(0.09)
    if (Math.abs(shiftTo - view.shift) < 0.25) view.shift = shiftTo
    if (Math.abs(view.shift) > 0.25 || Math.abs(view.shiftY) > 0.25) camera.setViewOffset(view.w, view.h, view.shift, view.shiftY, view.w, view.h)
    else if (camera.view?.enabled) camera.clearViewOffset()
    camera.position.copy(cur.cam)
    // The camera sways with the pointer: a couple of centimetres, enough to feel present.
    // (Not while holding a screen: it would slide under the pointer.)
    const sway = sf.on ? 0 : 1
    camera.position.x += mouse.sx * 0.03 * sway
    camera.position.y -= mouse.sy * 0.018 * sway
    camera.up.copy(cur.up)
    camera.lookAt(cur.at)
    if (Math.abs(night.value - target) > 0.001) {
      night.value += (target - night.value) * ease(0.06)
      applyMood()
    }
    renderer.render(scene, camera)
    const dev = sf.on && scr.value?.device
    if (dev) {
      camera.updateMatrixWorld()
      place(dev)
      // The demo fades in over the screen once the camera has all but arrived.
      if (!sf.shown && cur.cam.distanceTo(tc) < 0.004) {
        sf.shown = true
        dev.classList.add('is-on')
      }
    }
    const settled =
      cur.cam.distanceToSquared(tc) < 1e-9 &&
      cur.at.distanceToSquared(ta) < 1e-9 &&
      Math.abs(mouse.x - mouse.sx) + Math.abs(mouse.y - mouse.sy) < 1e-3 &&
      Math.abs(night.value - target) <= 0.001 &&
      cur.up.distanceToSquared(tu) < 1e-9 &&
      view.shift === shiftTo &&
      view.shiftY === shiftYTo &&
      (!sf.on || sf.shown)
    if (!settled) raf = requestAnimationFrame(frame)
    else last = 0
  }

  size()
  onWalk = onScroll
  onScroll()
  cur.cam.copy(want.cam)
  cur.at.copy(want.at)
  addEventListener('resize', size)
  canvas.value.addEventListener('pointermove', onMove)
  canvas.value.addEventListener('pointerleave', onLeave)
  canvas.value.addEventListener('click', onClick)
  kick()
  // Let the first frame land before the canvas fades in over the still.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      ready.value = true
    })
  )

  // Leaving the homepage inside the app keeps the tab alive; dispose() frees
  // everything in `owned` and the WebGL context itself.
  teardown = () => {
    onWalk = null
    onFocus = null
    onScreen = null
    io.disconnect()
    mo.disconnect()
    removeEventListener('resize', size)
  }
}
</script>

<style scoped>
.dk {
  position: relative;
}

.dk-stage {
  position: relative;
  overflow: hidden;
}

/* Two classes, to outrank `.dk-poster img { display: block }` below. */
.dk .dk-poster-night,
.dk .dk-forced {
  display: none;
}

.dk-poster-auto {
  display: block;
}

/* The toggle disagrees with the system: hide the <picture>, show the other still. */
@media (prefers-color-scheme: dark) {
  :root[data-theme='light'] .dk-poster-auto {
    display: none;
  }
  :root[data-theme='light'] .dk .dk-forced-day {
    display: block;
  }
}

@media (prefers-color-scheme: light) {
  :root[data-theme='dark'] .dk-poster-auto {
    display: none;
  }
  :root[data-theme='dark'] .dk .dk-forced-night {
    display: block;
  }
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .dk-poster-day {
    display: none;
  }
  :root:not([data-theme='light']) .dk-poster-night {
    display: block;
  }
}

:root[data-theme='dark'] .dk-poster-day {
  display: none;
}

:root[data-theme='dark'] .dk-poster-night {
  display: block;
}

.dk-poster img,
.dk-canvas {
  display: block;
  width: 100%;
  object-fit: cover;
}

/* Phones and reduced motion: the still, with the name and thesis laid over
   its lower edge, so the first screen says whose desk this is. */
.dk-poster img {
  aspect-ratio: 4 / 3;
  max-height: 80svh;
}

.dk-canvas,
.dk-veil,
.dk-dots,
.dk-tag,
.dk-cap:not(.dk-cap--hero),
.dk-cap--hero .dk-hint,
.dk-cap--hero .dk-skip {
  display: none;
}

/* The still stays clear, with only a short fade at its foot; the name and
   thesis start on that fade and run on below it, still in the first screen. */
.dk-caps {
  position: relative;
  margin-top: -3.5rem;
  padding: 0 var(--page-gut) var(--sp-5);
  list-style: none;
}

.dk-poster {
  position: relative;
}

.dk-poster::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 5rem;
  background: linear-gradient(transparent, var(--bg));
  pointer-events: none;
}

.dk-caps .dk-title > span {
  display: block;
}

.dk-name {
  font-size: clamp(2.25rem, 1.5rem + 3vw, 3.5rem);
}

.dk-caps .dk-thesis {
  margin-top: var(--sp-2);
  font-size: var(--step-1);
}

/* The tour: a row of cards you swipe through, each snapping into place,
   the next one peeking in from the right so it is clear there is more. */
.dk-tour {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(82%, 26rem);
  gap: var(--sp-4);
  padding: var(--sp-6) var(--page-gut) var(--sp-7);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--page-gut);
  scrollbar-width: none;
  list-style: none;
}

.dk-tour::-webkit-scrollbar {
  display: none;
}

/* Wide screens under reduced motion: room for all of them, no swiping.
   Seven stops never fill rows evenly, so the first (the notebook, where the
   walk starts) takes two columns with a wide picture: eight cells, two rows
   of four or four rows of two, and no card left alone at the end. */
@media (min-width: 900px) {
  .dk-tour {
    grid-auto-flow: row;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--sp-7) var(--sp-6);
    max-width: var(--page-w);
    margin-inline: auto;
    padding-inline: var(--page-gut);
    overflow: visible;
  }
}

@media (min-width: 900px) {
  .dk-stop:first-child {
    grid-column: span 2;
  }

  .dk-stop:first-child .dk-stop-pic img {
    aspect-ratio: 3 / 1;
  }
}

@media (min-width: 1200px) {
  .dk-tour {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.dk-stop {
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.dk-stop-pic {
  position: relative;
  width: 100%;
  margin-bottom: var(--sp-4);
  overflow: hidden;
  border-radius: var(--r-3);
  box-shadow: var(--shadow-1);
}

.dk-stop-pic img {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
}

.dk-stop-n {
  position: absolute;
  left: var(--sp-3);
  top: var(--sp-3);
  padding: 2px 10px;
  border-radius: var(--r-full);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  color: var(--ink-2);
  font-size: var(--step--1);
  font-weight: 700;
}

.dk-stop-of {
  color: var(--ink-3);
}

.dk-stop .dk-h {
  font-size: var(--step-2);
}

.dk-stop .dk-text {
  font-size: var(--step--1);
}

.dk-stop .dk-acts {
  margin-top: auto;
  padding-top: var(--sp-3);
}

.dk-stop .dk-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

/* Wide screens with motion: the section is tall and the stage sticks, so scrolling is walking.
   One 55svh slice per stop, plus a window so the last stop can be held. */
.dk-stills {
  display: none;
}

@media (min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference) {
  .dk-stills {
    display: block;
    position: absolute;
    inset: 0;
  }

  .dk-still {
    position: absolute;
    inset: 0;
    animation: dk-still-in 450ms var(--ease-entrance) both;
  }

  .dk-still img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dk {
    height: calc(var(--stops) * 55svh + 100svh);
    /* Up under the floating header, so the room reaches the top of the
       window instead of starting below a band of page colour. */
    margin-top: calc(-1 * var(--header-h));
  }

  .dk-tour {
    display: none;
  }

  .dk-stage {
    position: sticky;
    top: 0;
    height: 100svh;
  }

  /* Grows up from the bottom edge as the stage leaves. Its lowest row is
     always the solid page colour, so there is never a seam to see. */
  .dk-stage::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
    height: calc(var(--out, 0) * 75%);
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--bg) 80%, transparent) 60%, var(--bg));
  }

  .dk-poster {
    position: absolute;
    inset: 0;
  }

  /* The <picture> must be as tall as the stage, or its image's 100% height
     has nothing to resolve against and the still stops at 16:9. */
  .dk-poster-auto {
    height: 100%;
  }

  .dk-poster img,
  .dk-canvas {
    height: 100%;
    max-height: none;
    aspect-ratio: auto;
  }

  .dk-canvas {
    display: block;
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 900ms var(--ease-entrance);
  }

  .dk.is-ready .dk-canvas {
    opacity: 1;
  }

  /* The name sits on the picture: a soft wash of the room colour behind it keeps it readable over the lamp and shelf. */
  .dk-veil {
    display: block;
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 52% 78% at 10% 32%, color-mix(in srgb, var(--bg) 80%, transparent), transparent 72%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 600ms var(--ease-entrance);
  }

  .dk-veil.is-on {
    opacity: 1;
  }

  .dk-caps {
    position: static;
    margin-top: 0;
    padding: 0;
    background: none;
  }

  .dk-poster::after {
    display: none;
  }

  .dk-caps .dk-name {
    font-size: clamp(2.5rem, 1.6rem + 3.4vw, 4.75rem);
  }

  .dk-caps .dk-thesis {
    margin-top: var(--sp-4);
    font-size: var(--step-2);
  }

  .dk-cap:not(.dk-cap--hero),
  .dk-cap--hero .dk-hint {
    display: block;
  }

  .dk-cap--hero .dk-skip {
    display: inline-flex;
  }

  .dk-cap {
    position: absolute;
    left: clamp(var(--sp-4), 5vw, var(--sp-9));
    bottom: clamp(var(--sp-6), 9svh, var(--sp-9));
    max-width: min(30rem, 42vw);
    padding: var(--sp-5) var(--sp-6);
    border-radius: var(--r-3);
    background: var(--surface);
    box-shadow: var(--shadow-2);
    opacity: 0;
    transform: translateY(14px);
    pointer-events: none;
    transition:
      opacity 450ms var(--ease-entrance),
      transform 450ms var(--ease-entrance);
  }

  .dk-cap.is-on,
  .dk-cap:focus-within {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }

  /* A short window: the card keeps every word but takes less of the height,
     so it stays below the thing instead of climbing over it. */
  @media (max-height: 820px) {
    .dk-cap:not(.dk-cap--hero) {
      bottom: var(--sp-5);
      max-width: min(26rem, 40vw);
      padding: var(--sp-4) var(--sp-5);
    }

    .dk-cap:not(.dk-cap--hero) .dk-h {
      font-size: var(--step-2);
    }

    .dk-cap:not(.dk-cap--hero) .dk-text {
      margin-top: var(--sp-2);
      font-size: var(--step--1);
      line-height: 1.65;
    }

    .dk-cap:not(.dk-cap--hero) .dk-acts {
      margin-top: var(--sp-3);
    }
  }

  /* Cards sit on the side away from the thing they are about. */
  .dk-cap--right {
    left: auto;
    right: calc(clamp(var(--sp-4), 5vw, var(--sp-9)) + 1.5rem);
  }

  /* The opening caption is the name, set large, with no card behind it. */
  .dk-cap--hero {
    top: calc(var(--header-h) + clamp(var(--sp-6), 8svh, var(--sp-9)));
    bottom: auto;
    /* Narrow enough that the thesis breaks at its comma, left of the lamp. */
    max-width: min(24rem, 34vw);
    padding: 0;
    background: none;
    box-shadow: none;
  }

  .dk-dots {
    display: grid;
  }

  .dk-tag {
    display: block;
  }
}

.dk-name {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 1.6rem + 3.4vw, 4.75rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.01em;
}

.dk-thesis {
  margin-top: var(--sp-4);
  word-break: keep-all;
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 800;
  line-height: 1.35;
  text-wrap: balance;
}

.dk-skip {
  align-items: center;
  min-height: 44px;
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink-2);
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
  text-underline-offset: 0.24em;
}

.dk-skip:hover {
  color: var(--ink);
}

.dk-hint {
  margin-top: var(--sp-6);
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--ink-2);
}

.dk-hint::after {
  content: '';
  display: block;
  width: 1px;
  height: 2.5rem;
  margin: var(--sp-3) 0 0 0.5rem;
  background: currentColor;
  animation: dk-drip 1.8s var(--ease-inout) infinite;
  transform-origin: top;
}

@keyframes dk-drip {
  0% {
    transform: scaleY(0);
  }
  50% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}

.dk-eyebrow {
  margin-bottom: var(--sp-2);
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--pop-ink);
}

.dk-h {
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 900;
  line-height: 1.15;
}

.dk-text {
  margin-top: var(--sp-3);
  color: var(--ink-2);
  line-height: 1.75;
}

/* A caption's ways on: open the thing right here, or go to its page. */
.dk-acts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2) var(--sp-4);
  margin-top: var(--sp-4);
}

.dk-open {
  min-height: 40px;
  padding: 0 var(--sp-4);
  border: 0;
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font: inherit;
  font-size: var(--step--1);
  font-weight: 800;
  cursor: pointer;
  transition: translate var(--dur-2) var(--ease-entrance);
}

.dk-open:hover {
  translate: 0 -1px;
}

.dk-link {
  display: inline-block;
  font-weight: 700;
  color: var(--pop-ink);
  text-decoration: none;
}

.dk-link:hover {
  text-decoration: underline;
}

.dk-tag {
  position: absolute;
  transform: translate(-50%, calc(-100% - 14px));
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--surface);
  font-size: var(--step--1);
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
}

.dk-dots {
  position: absolute;
  right: clamp(var(--sp-4), 3vw, var(--sp-7));
  top: 50%;
  gap: 0;
  padding: 4px 0;
  transform: translateY(-50%);
  /* A pill of page colour behind the dots, so they read over the green
     snack bag and the dark desk mat as well as over the wall. */
  border-radius: var(--r-full);
  background: color-mix(in srgb, var(--surface) 72%, transparent);
  box-shadow: var(--shadow-1);
}

.dk-dots button {
  position: relative;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: pointer;
}

.dk-dots button:hover .dk-dot {
  background: var(--ink);
}

/* The stop's name, shown beside its dot on hover or keyboard focus. */
.dk-dot-label {
  position: absolute;
  right: calc(100% + 6px);
  top: 50%;
  padding: 3px 10px;
  border-radius: var(--r-full);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  color: var(--ink);
  font-size: var(--step--1);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translate(6px, -50%);
  transition:
    opacity 200ms var(--ease-entrance),
    transform 200ms var(--ease-entrance);
  pointer-events: none;
}

.dk-dots button:hover .dk-dot-label,
.dk-dots button:focus-visible .dk-dot-label {
  opacity: 1;
  transform: translate(0, -50%);
}

.dk-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ink) 40%, transparent);
  transition:
    transform 300ms var(--ease-entrance),
    background-color 300ms;
}

.dk-dots .is-on .dk-dot {
  background: var(--pop);
  transform: scale(1.6);
}

.dk-dots {
  transition: opacity 300ms var(--ease-entrance);
}

.dk-dots.is-gone {
  opacity: 0;
}

:global(.hd::before) {
  transition: opacity var(--dur-3) var(--ease-inout);
}

:global(html.is-over-desk .hd::before) {
  opacity: 0;
}

@keyframes dk-still-in {
  from {
    opacity: 0;
  }
}
</style>
