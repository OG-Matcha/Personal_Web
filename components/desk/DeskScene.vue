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
          <img src="/desk/poster-day.webp" :srcset="srcset('/desk/poster-day.webp')" sizes="100vw" alt="" width="1600" height="900" fetchpriority="high" />
        </picture>
        <img class="dk-forced dk-forced-day" src="/desk/poster-day.webp" :srcset="srcset('/desk/poster-day.webp')" sizes="100vw" alt="" width="1600" height="900" loading="lazy" />
        <img class="dk-forced dk-forced-night" src="/desk/poster-night.webp" :srcset="srcset('/desk/poster-night.webp')" sizes="100vw" alt="" width="1600" height="900" loading="lazy" />
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
          :class="[`dk-cap--${s.id}`, s.side && `dk-cap--${s.side}`, { 'is-on': on === i && !moving && !leaving }]"
          @focusin="on !== i && scrollToStop(i)"
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
            <NuxtLink v-if="s.href" :to="s.href" class="dk-link">{{ s.cta }} →</NuxtLink>
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
      <li v-for="(s, i) in stops.slice(1)" :key="s.id" class="dk-stop">
        <div class="dk-stop-pic">
          <img class="dk-poster-day" :src="`/desk/stops/${s.id}-day.webp`" :srcset="srcset(`/desk/stops/${s.id}-day.webp`)" sizes="(min-width: 900px) 25vw, 82vw" alt="" width="1200" height="800" loading="lazy" decoding="async" />
          <img class="dk-poster-night" :src="`/desk/stops/${s.id}-night.webp`" :srcset="srcset(`/desk/stops/${s.id}-night.webp`)" sizes="(min-width: 900px) 25vw, 82vw" alt="" width="1200" height="800" loading="lazy" decoding="async" />
          <span class="dk-stop-n figures" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }} · {{ s.thing }}</span>
        </div>
        <h2 class="dk-h">{{ s.title }}</h2>
        <p class="dk-text">{{ s.text }}</p>
        <NuxtLink v-if="s.href" :to="s.href" class="dk-link">{{ s.cta }} →</NuxtLink>
      </li>
    </ol>
  </section>
</template>


<script setup>
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
      }
    : {
        label: '我的桌子',
        name: '黃鉅燊',
        thesis: '我把 AI 從展示品，​做到三個月後還有人在用。',
        hint: '往下捲，走過我的桌子',
        tour: '桌上的東西',
        stopsLabel: '書桌上的每一站',
        skip: '跳過書桌，直接看介紹 ↓',
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
    phone: { thing: '手機', title: '財伴 oSave', text: '用會計邏輯記帳的 App：問你三個問題，後端轉成 13 種現金流向和 6 個財務健康指標，回答「我的財務健不健康」。', href: '/work/osave/', cta: '看財伴怎麼做的' },
    tablet: { thing: '平板', title: '醫數行銷 MedaLink', text: '診所的 AI 營運系統：在 LINE 上回病患、把醫師診間儀器的時段算出來，AI 那一半是我一個人做的。', href: '/work/medalink/', cta: '看診所系統' },
    reports: { thing: '一疊報告', title: `${c.researchGrants} 個國科會計畫`, text: '從生成式 AI 社交工程、股市異常追蹤，到財伴的 82 人實證研究；另有一篇 LAK 2025 國際會議發表。', href: '/resume/', cta: '看完整年表' },
    shelf: { thing: '獎盃架', title: `${c.awards} 個競賽獎項`, text: `其中 ${c.topPrizes} 個全國首獎，包括台積電校園黑客松第一名。架上只擺得下四座，其他的在年表裡，每一座都附上主辦單位和公告。`, href: '/resume/', cta: '看每一座的出處' },
    kuaikuai: { thing: '綠色乖乖', title: '機器乖乖，不當機', text: '台灣工程師的老規矩：伺服器旁邊放一包綠色乖乖。我放的這包是台積電聯名款，到目前為止都很乖。', href: '/#contact', cta: '寫信給我' },
  }
  const enT = {
    notebook: { thing: 'Notebook', title: 'Today’s list', text: 'Coffee: done. Green Kuai Kuai: restocked. Sleep: moved to next week. The right page is this week’s bug count. Sixteen, still counting.', href: '/en/#about', cta: 'How I think' },
    laptop: { thing: 'Laptop', title: 'What I do now', text: 'Co-founder and CTO of Finctory, co-founder and forward-deployed engineer at MedaLink, AI intern at ITRI, and a master’s student at NCU.', href: '/en/#record', cta: 'See the road so far' },
    phone: { thing: 'Phone', title: 'oSave', text: 'A budgeting app built on accounting logic: three questions, turned by the backend into 13 cash-flow directions and six financial-health indicators, to answer "am I financially healthy?".', href: '/en/work/osave/', cta: 'How oSave was built' },
    tablet: { thing: 'Tablet', title: 'MedaLink', text: 'An AI operations system for clinics: answers patients on LINE and books the slot where doctor, room and equipment are all free. I built the AI half alone.', href: '/en/work/medalink/', cta: 'See the clinic system' },
    reports: { thing: 'A stack of reports', title: `${c.researchGrants} NSTC research grants`, text: 'From generative AI in social engineering and market-anomaly tracking to an 82-person study of oSave; plus a LAK 2025 paper.', href: '/en/resume/', cta: 'See the full record' },
    shelf: { thing: 'The shelf', title: `${c.awards} competition awards`, text: `${c.topPrizes} of them national first prizes, including first at TSMC IT CareerHack. Only four fit on the shelf; the record has the rest, each with its organiser and announcement.`, href: '/en/resume/', cta: 'Where each one came from' },
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
const walk = { i: 0, e: 0 }
let onWalk = null
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
  leaving.value = p > 0.99 || box.bottom < innerHeight - 2
  // While the room fills the top of the window, the header floats on it with
  // no page-coloured band behind it.
  document.documentElement.classList.toggle('is-over-desk', box.bottom > 120)
  const gone = (innerHeight - box.bottom) / (innerHeight * 0.5)
  el.style.setProperty('--out', Math.min(1, Math.max(0, gone)).toFixed(3))
  if (e < 0.08) on.value = i
  else if (e > 0.92) on.value = i + 1
  onWalk?.()
}
function scrollToStop(i) {
  const el = root.value
  const span = el.offsetHeight - innerHeight
  scrollTo({ top: el.getBoundingClientRect().top + scrollY + (span * (i + 0.5)) / N, behavior: 'smooth' })
}

// When the caption you were on goes inert, take keyboard focus to the new one.
watch(on, async (i) => {
  const a = document.activeElement
  if (!root.value?.contains(a) || !a.closest('.dk-cap')) return
  await nextTick()
  root.value.querySelectorAll('.dk-cap')[i]?.querySelector('a')?.focus({ preventScroll: true })
})

onMounted(() => {
  const tall = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)').matches
  if (!tall) return
  readScroll()
  addEventListener('scroll', readScroll, { passive: true })
  addEventListener('resize', readScroll)
  if (navigator.connection?.saveData) return
  // A machine without a GPU draws WebGL on the CPU (SwiftShader, llvmpipe):
  // the room would freeze the page for seconds, so the still stays.
  if (softwareGL()) return
  // The page paints first; the room loads after. If it fails, the still stays.
  const go = () =>
    start().catch(() => dispose?.())
  'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 400)
})

onBeforeUnmount(() => {
  alive = false
  document.documentElement.classList.remove('is-over-desk')
  removeEventListener('scroll', readScroll)
  removeEventListener('resize', readScroll)
  dispose?.()
})

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
    loader.loadAsync('/desk/model/desk.gltf'),
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
      o.userData.paper = true
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
      if (o.userData.paper) o.material.color.setRGB(0.86 - 0.66 * n, 0.85 - 0.68 * n, 0.83 - 0.71 * n)
    })
    for (const m of glow) if (m.map) m.color.setScalar(0.88 + 0.12 * n)
  }
  applyMood()

  // ---- camera path ----------------------------------------------------
  const path = STOPS.map((s) => ({ cam: B(s.cam), at: B(s.at), spot: s.spot ? B(s.spot) : null }))
  const want = { cam: path[0].cam.clone(), at: path[0].at.clone() }
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
    kick()
  }

  const size = () => {
    const w = canvas.value.clientWidth
    const h = canvas.value.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Keep the 16:9 framing of the Blender camera; narrower windows widen the view instead of cropping.
    camera.fov = camera.aspect < 16 / 9 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(36) / 2) * (16 / 9) / camera.aspect)) : 36
    camera.updateProjectionMatrix()
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
    hover.value = best ? { i: best.i, x: best.x, y: best.y, label: stops.value[best.i].thing } : null
    canvas.value.style.cursor = best ? 'pointer' : ''
    kick()
  }
  const onLeave = () => {
    hover.value = null
    mouse.x = mouse.y = 0
    kick()
  }
  const onClick = () => {
    if (hover.value) scrollToStop(hover.value.i)
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

  function frame() {
    raf = 0
    if (!visible || gone) return
    mouse.sx += (mouse.x - mouse.sx) * 0.05
    mouse.sy += (mouse.y - mouse.sy) * 0.05
    cur.cam.lerp(want.cam, 0.08)
    cur.at.lerp(want.at, 0.08)
    camera.position.copy(cur.cam)
    // The camera sways with the pointer: a couple of centimetres, enough to feel present.
    camera.position.x += mouse.sx * 0.03
    camera.position.y -= mouse.sy * 0.018
    camera.lookAt(cur.at)
    if (Math.abs(night.value - target) > 0.001) {
      night.value += (target - night.value) * 0.06
      applyMood()
    }
    renderer.render(scene, camera)
    const settled =
      cur.cam.distanceToSquared(want.cam) < 1e-9 &&
      cur.at.distanceToSquared(want.at) < 1e-9 &&
      Math.abs(mouse.x - mouse.sx) + Math.abs(mouse.y - mouse.sy) < 1e-3 &&
      Math.abs(night.value - target) <= 0.001
    if (!settled) raf = requestAnimationFrame(frame)
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

/* Wide screens under reduced motion: room for all of them, no swiping. */
@media (min-width: 900px) {
  .dk-tour {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
    gap: var(--sp-7) var(--sp-6);
    max-width: var(--page-w);
    margin-inline: auto;
    padding-inline: var(--page-gut);
    overflow: visible;
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

.dk-stop .dk-h {
  font-size: var(--step-2);
}

.dk-stop .dk-text {
  font-size: var(--step--1);
}

.dk-stop .dk-link {
  margin-top: auto;
  padding-top: var(--sp-3);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

/* Wide screens with motion: the section is tall and the stage sticks, so scrolling is walking.
   One 55svh slice per stop, plus a window so the last stop can be held. */
.dk-stills {
  display: none;
}

@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
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
    background: radial-gradient(ellipse 50% 55% at 10% 20%, color-mix(in srgb, var(--bg) 70%, transparent), transparent 70%);
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

.dk-link {
  display: inline-block;
  margin-top: var(--sp-4);
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
  transform: translateY(-50%);
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
  background: color-mix(in srgb, var(--ink) 30%, transparent);
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
