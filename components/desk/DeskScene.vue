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
    On phones and under reduced motion only the still shows; the person
    column right after it carries the name and thesis.
  -->
  <section ref="root" class="dk" :class="{ 'is-ready': ready }" :style="{ '--stops': stops.length }" :aria-label="t.label">
    <div class="dk-stage">
      <!-- Both stills ship; CSS shows the one matching the site theme (system or toggle). -->
      <div class="dk-poster" aria-hidden="true">
        <img class="dk-poster-day" src="/desk/poster-day.webp" alt="" width="1600" height="900" fetchpriority="high" />
        <img class="dk-poster-night" src="/desk/poster-night.webp" alt="" width="1600" height="900" fetchpriority="high" />
      </div>
      <canvas ref="canvas" class="dk-canvas" aria-hidden="true" />
      <div class="dk-veil" :class="{ 'is-on': on === 0 }" aria-hidden="true" />

      <!--
        The loader: the room being set up, with a real count of what has
        arrived. Wide screens only (the same CSS gate as the 3D). It lifts
        like a shutter when the room is ready, and a CSS timer lifts it
        anyway after a few seconds, so a slow line or no script never traps
        anyone behind it; the still is underneath.
      -->
      <div v-if="!skipLoader" class="dk-load" :class="{ 'is-done': loaded }" aria-hidden="true">
        <div class="dk-load-panel dk-load-top" />
        <div class="dk-load-panel dk-load-bot" />
        <div class="dk-load-in">
          <p class="dk-load-name">
            <span v-for="(ch, k) in [...t.name]" :key="k" :style="{ '--k': k }">{{ ch === ' ' ? '\u00a0' : ch }}</span>
          </p>
          <div class="dk-load-bar"><span :style="{ transform: `scaleX(${pct / 100})` }" /></div>
          <p class="dk-load-row">
            <span class="dk-load-step">{{ step }}</span>
            <span class="dk-load-pct figures">{{ String(Math.round(pct)).padStart(3, '0') }}</span>
          </p>
        </div>
      </div>

      <p v-if="hover" class="dk-tag" :style="{ left: `${hover.x}px`, top: `${hover.y}px` }" aria-hidden="true">
        {{ hover.label }}
      </p>

      <!-- One caption per stop. In 3D only the current one shows. -->
      <ol class="dk-caps">
        <li v-for="(s, i) in stops" :key="s.id" class="dk-cap" :class="[`dk-cap--${s.id}`, { 'is-on': on === i }]" :inert="on !== i">
          <template v-if="s.id === 'hero'">
            <p class="dk-name">{{ t.name }}</p>
            <p class="dk-thesis">{{ t.thesis }}</p>
            <p class="dk-hint">{{ t.hint }}</p>
          </template>
          <template v-else>
            <h2 class="dk-h">{{ s.title }}</h2>
            <p class="dk-text">{{ s.text }}</p>
            <NuxtLink v-if="s.href" :to="s.href" class="dk-link">{{ s.cta }} →</NuxtLink>
          </template>
        </li>
      </ol>

      <div class="dk-dots" aria-hidden="true">
        <span v-for="(s, i) in stops" :key="s.id" :class="{ 'is-on': on === i }" />
      </div>
    </div>
  </section>
</template>

<script>
// Survives remounts within one tab: the loader shows on the first visit only.
let loaderSeen = false
</script>

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
        steps: ['Wiping the desk', 'Switching on the lamp', 'Making coffee', 'Restocking Kuai Kuai', 'Ready'],
      }
    : {
        label: '我的桌子',
        name: '黃鉅燊',
        thesis: '我把 AI 從展示品，​做到三個月後還有人在用。',
        hint: '往下捲，走過我的桌子',
        steps: ['擦桌子', '開檯燈', '泡咖啡', '補乖乖', '好了'],
      }
)

/*
  The stops. `cam` and `at` are Blender coordinates (Z up), the same numbers
  as studio/desk/build_desk.py, converted on use.
*/
const STOPS = [
  { id: 'hero', cam: [0.78, -1.42, 1.4], at: [-0.02, 0.12, 0.92] },
  { id: 'notebook', cam: [-0.06, -0.66, 1.16], at: [-0.2, -0.19, 0.76], spot: [-0.2, -0.22, 0.77] },
  { id: 'laptop', cam: [0.1, -0.5, 1.03], at: [0.0, 0.1, 0.85], spot: [0.0, 0.12, 0.86] },
  { id: 'phone', cam: [0.33, -0.36, 0.93], at: [0.43, -0.02, 0.83], spot: [0.43, -0.03, 0.83] },
  { id: 'tablet', cam: [-0.3, -0.38, 0.99], at: [-0.45, 0.09, 0.84], spot: [-0.45, 0.09, 0.84] },
  { id: 'reports', cam: [0.48, -0.25, 1.15], at: [0.5, 0.18, 0.78], spot: [0.52, 0.2, 0.79] },
  { id: 'shelf', cam: [0.05, -0.62, 1.46], at: [0.05, 0.52, 1.31], spot: [0.05, 0.52, 1.32] },
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
    shelf: { thing: '獎盃架', title: `${c.awards} 個競賽獎項`, text: `其中 ${c.topPrizes} 個全國首獎，包括台積電校園黑客松第一名。每一座都附上主辦單位和公告。`, href: '/resume/', cta: '看每一座的出處' },
    kuaikuai: { thing: '綠色乖乖', title: '機器乖乖，不當機', text: '台灣工程師的老規矩：伺服器旁邊放一包綠色乖乖。我放的這包是台積電聯名款，到目前為止都很乖。', href: '/#contact', cta: '寫信給我' },
  }
  const enT = {
    notebook: { thing: 'Notebook', title: 'Today’s list', text: 'Coffee: done. Green Kuai Kuai: restocked. Sleep: moved to next week. The right page is this week’s bug count. Sixteen, still counting.', href: '/en/#about', cta: 'How I think' },
    laptop: { thing: 'Laptop', title: 'What I do now', text: 'Co-founder and CTO of Finctory, co-founder and forward-deployed engineer at MedaLink, AI intern at ITRI, and a master’s student at NCU.', href: '/en/#record', cta: 'See the road so far' },
    phone: { thing: 'Phone', title: 'oSave', text: 'A budgeting app built on accounting logic: three questions, turned by the backend into 13 cash-flow directions and six financial-health indicators, to answer "am I financially healthy?".', href: '/en/work/osave/', cta: 'How oSave was built' },
    tablet: { thing: 'Tablet', title: 'MedaLink', text: 'An AI operations system for clinics: answers patients on LINE and books the slot where doctor, room and equipment are all free. I built the AI half alone.', href: '/en/work/medalink/', cta: 'See the clinic system' },
    reports: { thing: 'A stack of reports', title: `${c.researchGrants} NSTC research grants`, text: 'From generative AI in social engineering and market-anomaly tracking to an 82-person study of oSave; plus a LAK 2025 paper.', href: '/en/resume/', cta: 'See the full record' },
    shelf: { thing: 'The shelf', title: `${c.awards} competition awards`, text: `${c.topPrizes} of them national first prizes, including first at TSMC IT CareerHack. Each one links to its organiser and announcement.`, href: '/en/resume/', cta: 'Where each one came from' },
    kuaikuai: { thing: 'A green bag of Kuai Kuai', title: 'Keeps the machines good', text: 'A Taiwanese engineering custom: a bag of green Kuai Kuai next to the server keeps it from crashing. Mine is the TSMC edition. So far, so good.', href: '/en/#contact', cta: 'Write to me' },
  }
  const T = isEn.value ? enT : zh
  return STOPS.map((s) => ({ ...s, ...(T[s.id] ?? {}) }))
})

const root = ref(null)
const canvas = ref(null)
const ready = ref(false)
const on = ref(0)
const hover = ref(null)

/*
  Loader state. `got` is the real fraction of the three files that has
  arrived; `pct` is what is shown: it eases towards `got`, creeps a little
  on its own so a file without a length never looks stuck, and never goes
  backwards. Seen once per tab: coming back to the page in the app skips it.
*/
const skipLoader = ref(loaderSeen)
const loaded = ref(false)
const pct = ref(0)
let got = 0
let pctRaf = 0
const step = computed(() => {
  const s = t.value.steps
  return loaded.value ? s[s.length - 1] : s[Math.min(s.length - 2, Math.floor((pct.value / 100) * (s.length - 1)))]
})
function tickPct() {
  pctRaf = 0
  const goal = loaded.value ? 100 : Math.max(got * 100, Math.min(90, pct.value + 0.25))
  pct.value = Math.min(100, pct.value + Math.max(0.15, (goal - pct.value) * 0.12))
  if (pct.value < 99.9) pctRaf = requestAnimationFrame(tickPct)
  else pct.value = 100
}
function finishLoader() {
  if (loaded.value) return
  loaded.value = true
  loaderSeen = true
  if (!pctRaf) pctRaf = requestAnimationFrame(tickPct)
}

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
  if (!tall || navigator.connection?.saveData) finishLoader()
  else if (!skipLoader.value) pctRaf = requestAnimationFrame(tickPct)
  if (!tall) return
  readScroll()
  addEventListener('scroll', readScroll, { passive: true })
  addEventListener('resize', readScroll)
  if (navigator.connection?.saveData) return
  // The page paints first; the room loads after. If it fails, the still stays.
  const go = () =>
    start().catch(() => {
      dispose?.()
      finishLoader()
    })
  'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 400)
})

onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(pctRaf)
  removeEventListener('scroll', readScroll)
  removeEventListener('resize', readScroll)
  dispose?.()
})

async function start() {
  const owned = [] // GPU things to free on the way out
  const THREE = await import('three')
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js')
  const { Vector3 } = THREE
  const B = (a) => new Vector3(a[0], a[2], -a[1]) // Blender (Z up) -> three (Y up)

  const renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  const draco = new DRACOLoader().setDecoderPath('/desk/draco/')
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
    draco.dispose()
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
  // Bytes arrived per file, weighted by its rough size, for the loader.
  const part = { glb: 0, desk: 0, room: 0 }
  const W = { glb: 0.45, desk: 0.45, room: 0.1 }
  const note = (k) => (e) => {
    part[k] = e.lengthComputable && e.total ? e.loaded / e.total : part[k]
    got = Object.keys(W).reduce((a, j) => a + W[j] * part[j], 0)
  }
  const tl = new THREE.TextureLoader()
  const tex = (url, k) =>
    new Promise((res, rej) =>
      tl.load(url, (x) => {
        if (k) note(k)({ lengthComputable: true, loaded: 1, total: 1 })
        x.flipY = false
        // Display-ready sRGB from Blender (AgX). Decoded to linear on sampling and
        // encoded back on output, so what Blender showed is what the page shows.
        x.colorSpace = THREE.SRGBColorSpace
        x.anisotropy = 8
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

  const loader = new GLTFLoader().setDRACOLoader(draco)
  const [gltf, d1, r1] = await Promise.all([
    loader.loadAsync('/desk/desk.glb', note('glb')),
    tex(`/desk/desk_${first}.webp`, 'desk'),
    tex(`/desk/room_${first}.webp`, 'room'),
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
      if (map) map.colorSpace = THREE.SRGBColorSpace
      o.material = new THREE.MeshBasicMaterial({ map, toneMapped: false })
      owned.push(o.material)
      glow.push(o.material)
    } else if (o.name.startsWith('kuaikuai')) {
      // The bag keeps its own sharp photo texture instead of the shared bake.
      // Shading is computed once from the window's direction into vertex colours,
      // and applyMood sets the overall brightness, so day and night stay in step
      // with the baked room around it.
      const map = o.material.map
      if (map) map.colorSpace = THREE.SRGBColorSpace
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
      if (map) map.colorSpace = THREE.SRGBColorSpace
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
        o.material = new THREE.MeshStandardMaterial({ color: 0xeef4ff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.35 })
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
      if ('envMapIntensity' in m) m.envMapIntensity = 1 - 0.94 * n
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
  // First arrival: start a step back and drift in as the shutter lifts.
  if (!skipLoader.value && cur.at.distanceTo(path[0].at) < 1e-6) cur.cam.addScaledVector(cur.cam.clone().sub(cur.at), 0.28)
  addEventListener('resize', size)
  canvas.value.addEventListener('pointermove', onMove)
  canvas.value.addEventListener('pointerleave', onLeave)
  canvas.value.addEventListener('click', onClick)
  kick()
  // Let the first frame land before the canvas fades in over the still.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      ready.value = true
      finishLoader()
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

.dk-poster .dk-poster-night {
  display: none;
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

/* Phones and reduced motion: the still alone, then the person column. */
.dk-poster img {
  aspect-ratio: 16 / 9;
  max-height: 80svh;
}

.dk-canvas,
.dk-veil,
.dk-caps,
.dk-dots,
.dk-tag {
  display: none;
}

/* Wide screens with motion: the section is tall and the stage sticks, so scrolling is walking.
   One 75svh slice per stop, plus a window so the last stop can be held. */
@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
  .dk {
    height: calc(var(--stops) * 75svh + 100svh);
  }

  .dk-stage {
    position: sticky;
    top: 0;
    height: 100svh;
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
    display: block;
    list-style: none;
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

  .dk-cap.is-on {
    opacity: 1;
    transform: none;
    pointer-events: auto;
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
  gap: 10px;
  transform: translateY(-50%);
}

.dk-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ink) 30%, transparent);
  transition:
    transform 300ms var(--ease-entrance),
    background-color 300ms;
}

.dk-dots span.is-on {
  background: var(--pop);
  transform: scale(1.6);
}

/* ---- loader ------------------------------------------------------------ */
.dk-load {
  display: none;
}

@media (min-width: 900px) and (prefers-reduced-motion: no-preference) {
  .dk-load {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
    /* The safety net: lifts by itself if the script never gets here. */
    animation: dk-load-auto 0s linear 7s forwards;
  }

  .dk-load-panel {
    position: absolute;
    left: 0;
    right: 0;
    height: 50.5%;
    background: var(--ink);
    transition: transform 900ms cubic-bezier(0.76, 0, 0.24, 1) 350ms;
  }

  .dk-load-top {
    top: 0;
  }

  .dk-load-bot {
    bottom: 0;
  }

  .dk-load-in {
    position: absolute;
    left: clamp(var(--sp-5), 6vw, var(--sp-10, 6rem));
    right: clamp(var(--sp-5), 6vw, var(--sp-10, 6rem));
    bottom: 12svh;
    color: var(--bg);
    transition:
      opacity 300ms var(--ease-entrance),
      transform 300ms var(--ease-entrance);
  }

  .dk-load-name {
    display: flex;
    overflow: hidden;
    font-family: var(--font-display);
    font-weight: 900;
    font-stretch: 112%;
    font-size: clamp(4rem, 2rem + 7vw, 9rem);
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .dk-load-name span {
    display: inline-block;
    transform: translateY(105%);
    animation: dk-load-rise 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(120ms + var(--k) * 70ms);
  }

  .dk-load-bar {
    margin-top: var(--sp-5);
    height: 2px;
    background: color-mix(in srgb, var(--bg) 22%, transparent);
  }

  .dk-load-bar span {
    display: block;
    height: 100%;
    background: var(--bg);
    transform-origin: left;
  }

  .dk-load-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: var(--sp-3);
    font-size: var(--step-0, 1rem);
    color: color-mix(in srgb, var(--bg) 75%, transparent);
  }

  .dk-load-pct {
    font-size: var(--step-2, 1.5rem);
    font-weight: 700;
    color: var(--bg);
    font-variant-numeric: tabular-nums;
  }

  .dk-load.is-done .dk-load-in {
    opacity: 0;
    transform: translateY(-12px);
  }

  .dk-load.is-done .dk-load-top {
    transform: translateY(-101%);
  }

  .dk-load.is-done .dk-load-bot {
    transform: translateY(101%);
  }

  .dk-load.is-done {
    animation: dk-load-auto 0s linear 1300ms forwards;
  }
}

@keyframes dk-load-rise {
  to {
    transform: none;
  }
}

@keyframes dk-load-auto {
  to {
    visibility: hidden;
  }
}
</style>
