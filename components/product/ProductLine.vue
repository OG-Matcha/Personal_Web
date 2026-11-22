<template>
  <!--
    The product line, set like a launch page. A stage holds four devices built
    in three.js - a phone, a laptop, a tablet and a monitor - and each piece of
    work takes the one it actually runs on. The words scroll past normally;
    the stage stays pinned behind them, and scroll position decides which
    device is out, how it turns, and what is on its screen.

    Without WebGL, with reduced motion, or in the text-only version, the
    canvas is never created and every beat shows its screenshot instead.
  -->
  <section ref="root" class="pl" aria-labelledby="pl-title">
    <div class="pl-sticky" aria-hidden="true">
      <canvas ref="canvas" class="pl-canvas" :class="{ 'is-live': live }" />
    </div>

    <!-- The opening: one device at a time, each with its chapter lit in the index -->
    <div class="pl-beat pl-beat--hero" data-beat="hero">
      <div class="pl-text">
        <div class="pl-in">
          <p class="pl-who">
            <span class="pl-name" :lang="c.nameLang">{{ c.name }}</span>
            <span class="pl-alt">{{ c.altName }}</span>
          </p>
          <h1 id="pl-title" class="pl-h1">
            <span v-for="(l, i) in c.thesisLines" :key="i" class="pl-line">{{ l }}</span>
          </h1>
          <p class="pl-sub">{{ c.thesisSub }}</p>
          <ul class="pl-index" :aria-label="c.indexLabel">
            <li v-for="ch in chapters" :key="ch.id" :class="{ 'is-on': heroOn >= 0 && CYCLE[heroOn].chapter === ch.id }">
              <a :href="`#${ch.anchor}`">
                <span class="pl-index-name">{{ ch.name }}</span>
                <span class="pl-index-kind">{{ ch.kind }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <article
      v-for="ch in chapters"
      :id="ch.anchor"
      :key="ch.id"
      class="pl-ch"
      :class="`pl-ch--${ch.id}`"
      :aria-labelledby="`pl-${ch.id}`"
    >
      <div v-for="(b, i) in ch.beats" :key="i" class="pl-beat" :data-beat="`${ch.id}-${i}`">
        <div class="pl-text">
          <div class="pl-in">
            <h2 v-if="i === 0" :id="`pl-${ch.id}`" class="pl-big">{{ b.big }}</h2>
            <p v-else class="pl-big">{{ b.big }}</p>
            <p v-if="i === 0" class="pl-meta">
              <span class="pl-tag">{{ ch.kind }}</span>
              <span v-if="ch.status" class="pl-status">{{ ch.status }}</span>
            </p>
            <p v-if="b.text" class="pl-copy">{{ b.text }}</p>

            <figure v-if="b.hours" class="pl-hours">
              <div class="pl-hours-bar" role="img" :aria-label="b.hours.label">
                <span class="pl-hours-on" :style="{ width: `${(176 / 720) * 100}%` }" />
              </div>
              <figcaption class="pl-hours-key">
                <span><b class="figures">176</b> {{ b.hours.on }}</span>
                <span><b class="figures">544</b> {{ b.hours.off }}</span>
              </figcaption>
            </figure>

            <dl v-if="b.figs" class="pl-figs">
              <div v-for="f in b.figs" :key="f.label">
                <dt>{{ f.label }}</dt>
                <dd class="figures">{{ f.n }}</dd>
              </div>
            </dl>

            <p v-if="b.role" class="pl-role">{{ b.role }}</p>

            <p v-if="b.links?.length" class="pl-act">
              <template v-for="l in b.links" :key="l.href">
                <NuxtLink v-if="l.href.startsWith('/')" :to="l.href" class="btn" :class="{ 'btn--pop': l.pop }">
                  {{ l.label }}
                </NuxtLink>
                <a v-else :href="l.href" v-bind="linkAttrs(l.href)" class="btn" :class="{ 'btn--pop': l.pop }">
                  {{ l.label }}
                </a>
              </template>
            </p>
          </div>
        </div>
        <img
          v-if="b.shot"
          class="pl-shot"
          :class="`pl-shot--${b.shot.shape ?? 'wide'}`"
          :src="asset(b.shot.src)"
          :alt="b.shot.alt"
          :width="b.shot.w"
          :height="b.shot.h"
          loading="lazy"
          decoding="async"
        />
      </div>
    </article>
  </section>
</template>

<script setup>
// The name is one unit on the nameplate: no break at its space or after its hyphen.
const NBSP = String.fromCharCode(0xa0)
const NBHY = '-' + String.fromCharCode(0x2060)
const { site, about, en, works, alsoBuilt } = useContent()
const { locale } = useLocale()
const byslug = Object.fromEntries(works.map((w) => [w.slug, w]))
const repo = (name) => alsoBuilt.find((a) => a.name === name)

const isEn = computed(() => locale.value === 'en')
const pre = computed(() => (isEn.value ? '/en' : ''))

const c = computed(() =>
  isEn.value
    ? {
        name: site.person.nameEn,
        nameLang: 'en',
        altName: `${site.person.nameZh} · OG_Matcha`,
        thesisLines: en.thesisLines,
        thesisSub: en.thesisSub,
        indexLabel: 'On this page',
        oldQ: 'So, am I doing all right?',
        oldName: 'Invoice Doctor',
      }
    : {
        name: site.person.nameZh,
        nameLang: 'zh-Hant',
        altName: `${site.person.nameEn.replace(/ /g, NBSP).replace(/-/g, NBHY)} · OG_Matcha`,
        thesisLines: about.thesisLines,
        thesisSub: about.thesisSub,
        indexLabel: '這一頁有什麼',
        oldQ: '所以我的財務健康嗎？',
        oldName: '發票醫生',
      }
)

// Every figure below is from content/work/*.yml or also-built.yml; the copy
// only rearranges them. Change a fact there, not here.
// Headlines set `word-break: keep-all`, so Chinese lines break only at a
// space or at a ​ placed between two phrases - never inside a word.
const chapters = computed(() => {
  const E = isEn.value
  const os = byslug.osave
  const tess = repo('tessera')
  const kit = repo('orca-companion-kit')
  return [
    {
      id: 'osave',
      anchor: 'work',
      name: E ? 'oSave' : '財伴 oSave',
      kind: E ? 'App · iOS and Android' : 'App · iOS 與 Android',
      status: E ? 'Live' : os.status,
      beats: [
        {
          big: E ? 'oSave' : '財伴 oSave',
          text: E
            ? 'A budgeting app that tells you whether your money is actually in good shape. Live on the App Store and Google Play.'
            : '一個會告訴你「財務到底健不健康」的記帳 App，已在 App Store 與 Google Play 上線。',
          links: os.links.map((l) => ({ ...l })),
          shot: { src: '/images/osave-2.webp', w: 782, h: 1816, shape: 'phone', alt: E ? 'oSave home screen: balance for today, spending this week, unusual spending' : '財伴首頁：今日餘額、本周支出、異常支出' },
        },
        {
          big: E ? 'We got it wrong once.' : '我們做錯過一次。',
          text: E
            ? 'Its first version, Invoice Doctor, could pull in what you spent automatically. It could not answer the one question that mattered: am I doing all right?'
            : '前身「發票醫生」自動抓得到你花了多少錢，卻答不出那個唯一重要的問題：所以我的財務健康嗎？',
          shot: { src: '/images/invoicedoctor-1.jpg', w: 1600, h: 1132, alt: E ? 'Invoice Doctor, the earlier version' : '前身發票醫生' },
        },
        {
          big: E ? 'Now it asks three questions.' : '現在，\u200b它只問三個問題。',
          text: E
            ? 'The backend turns those three answers into thirteen cash-flow directions, then into six measures of financial health.'
            : '後端把這三個答案翻成 13 項金流方向，再算出六項財務健康指標。',
          figs: [
            { n: '3', label: E ? 'questions asked' : '個問題' },
            { n: '13', label: E ? 'cash-flow directions' : '項金流方向' },
            { n: '6', label: E ? 'health measures' : '項健康指標' },
          ],
          shot: { src: '/images/osave-3.webp', w: 750, h: 2078, shape: 'phone', alt: E ? 'Monthly analysis: income against spending, where money went' : '月度分析：收支比較、金流走向、支出情況' },
        },
        {
          big: E ? 'CTO. Architecture and backend.' : '技術長，\u200b負責架構與後端。',
          text: E
            ? 'I designed the system and built the backend, from the pivot in May 2025 to the store release. Version 1.1.5, build 32.'
            : '從 2025 年五月的轉向，到上架兩個商店，系統是我設計的，後端是我寫的。現在是 v1.1.5，第 32 次建置。',
          links: [{ label: E ? 'Read the case study' : '讀完整案例', href: `${pre.value}/work/osave/`, pop: true }],
          shot: { src: '/images/osave-4.webp', w: 750, h: 1624, shape: 'phone', alt: E ? 'Score for income and spending trends, with suggestions' : '收支趨勢評分與建議' },
        },
      ],
    },
    {
      id: 'phishforge',
      anchor: 'phishforge',
      name: 'PhishForge',
      kind: E ? 'Security drills · research' : '資安演練 · 研究',
      status: E ? 'Concluded' : byslug.phishforge.status,
      beats: [
        {
          big: 'PhishForge',
          text: E
            ? 'Use a template drill email a few times and staff learn to spot it. What they learn is how to recognise the company’s drill, and they still click the real thing.'
            : '範本做的演練信用過幾次，員工就認得出來了。他們學會的是辨認公司寄的演練信，真正的釣魚信照樣點。',
          shot: { src: '/images/phishforge-1.png', w: 1600, h: 894, alt: 'PhishForge' },
        },
        {
          big: E ? 'So the AI writes mail you cannot tell apart.' : '所以我讓 AI 把信寫到\u200b你分不出來。',
          text: E
            ? 'Type a company name. The system pulls recent news for a pretext, then you and the model refine the email, the landing page and the notice until they read as real. Each drill runs in its own container.'
            : '輸入公司名稱，系統先爬近期新聞找題材，再跟 AI 一起把信件、網頁和附件改到像真的。每一場演練都跑在自己的容器裡。',
          shot: { src: '/images/phishforge-3.png', w: 952, h: 500, alt: E ? 'Drafting the email with the model, with news-based prompts on the right' : '與 AI 討論信件內容，右側是從近期新聞產生的提示' },
        },
        {
          big: E ? 'First place, security track.' : '資安應用組，\u200b第一名。',
          text: E
            ? 'At the 29th National Innovative Information Application Competition. Funded and concluded as an NSTC undergraduate research project.'
            : '第 29 屆大專校院資訊應用服務創新競賽。同時是 113 年度國科會大專學生研究計畫，通過並結案。',
          role: E ? 'My part: backend and AI engineering.' : '我負責後端與 AI 工程。',
          links: [{ label: E ? 'Read the case study' : '讀完整案例', href: `${pre.value}/work/phishforge/`, pop: true }],
        },
      ],
    },
    {
      id: 'medalink',
      anchor: 'medalink',
      name: E ? 'MedaLink' : '醫數行銷 MedaLink',
      kind: E ? 'Clinic operations system' : '診所營運系統',
      status: E ? 'Live' : byslug.medalink.status,
      beats: [
        {
          big: E ? 'A month has 720 hours. The front desk covers 176.' : '一個月 720\u00a0小時，\u200b櫃檯在的\u200b只有 176\u00a0小時。',
          text: E
            ? 'For the other 544, messages keep arriving and nobody answers. Every message the ad budget paid for goes to waste when the reply comes late.'
            : '剩下的 544 小時，訊息照樣進來，卻沒有人回。廣告費買來的每一則私訊，回慢了就是浪費。',
          hours: E
            ? { label: '176 of 720 hours staffed, 544 unstaffed', on: 'hours staffed', off: 'hours nobody is there' }
            : { label: '720 小時中有人在 176 小時，沒人在 544 小時', on: '小時有人在', off: '小時沒人在' },
          shot: { src: '/images/medalink-2.jpg', w: 1900, h: 1012, alt: E ? 'Customer records, each with its source and booking status' : '客戶資料 CRM：每一筆的來源與預約狀態' },
        },
        {
          big: E ? 'A reply is finished when the booking is.' : '約得到，\u200b才算回覆完。',
          text: E
            ? 'After answering, the AI has to bring the patient into a slot where the doctor, assistant, room and equipment are all free; then it handles reminders, rescheduling, aftercare and the six-month recall.'
            : 'AI 回完問題，還要把人帶進醫師、助理、診間、儀器同時空得出來的時段；約完之後，再接手提醒、改約、術後衛教和半年回診召回。',
          shot: { src: '/images/medalink-1.jpg', w: 1900, h: 1015, alt: E ? 'The clinic calendar, with bookings made from LINE conversations' : '診所行事曆，含從 LINE 對話解析出的預約' },
        },
        {
          big: E ? 'Two people, requirements to production.' : '兩個人，\u200b從需求做到上線。',
          figs: [
            { n: '173', label: E ? 'API routes' : '條 API 路由' },
            { n: '63', label: E ? 'eval cases' : '個對話 eval case' },
            { n: '59', label: E ? 'features, in 7 groups' : '項功能，分 7 類' },
          ],
          role: E
            ? 'Co-founder and forward-deployed engineer. The AI half, from the conversation engine to cloud deployment, is mine.'
            : '共同創辦人暨前線部署工程師。AI 那一半，從對話引擎到雲端部署都是我。',
          links: [
            { label: E ? 'Read the case study' : '讀完整案例', href: `${pre.value}/work/medalink/`, pop: true },
            { label: 'medalink.ai', href: byslug.medalink.orgUrl },
          ],
          shot: { src: '/images/medalink-3.jpg', w: 1271, h: 1336, alt: E ? 'Resources and treatments: who can see patients, which rooms and devices exist' : '資源與療程：誰能看診、有哪些診間與儀器' },
        },
      ],
    },
    {
      id: 'finctory',
      anchor: 'finctory',
      name: E ? 'Finctory' : '斐闊 Finctory',
      kind: E ? 'Company · since 2024' : '公司 · 2024 起',
      status: E ? 'Operating' : byslug.finctory.status,
      beats: [
        {
          big: E ? 'Finctory' : '斐闊 Finctory',
          text: E
            ? 'No investors, everyone still a student, anyone free to leave. So every technical decision I make has to pass one check first: can the next person pick it up?'
            : '沒有投資人、所有人都還在唸書、每個人隨時可以走。所以我做每個技術決策，第一個檢查都是：下一個人接得住嗎？',
          figs: [
            { n: '4', label: E ? 'product lines' : '條產品線' },
            { n: 'NT$1M+', label: E ? 'in prizes and grants' : '競賽獎金與補助' },
          ],
          role: E ? 'Co-founder and CTO, since April 2024.' : '共同創辦人暨技術長，2024 年四月起。',
          links: [
            { label: E ? 'Read the case study' : '讀完整案例', href: `${pre.value}/work/finctory/`, pop: true },
            { label: 'finctory.com', href: byslug.finctory.orgUrl },
          ],
          shot: { src: '/images/finctory-site.webp', w: 1600, h: 1000, alt: E ? 'The Finctory website' : '斐闊官網' },
        },
      ],
    },
    {
      id: 'open',
      anchor: 'open-source',
      name: E ? 'Open source' : '開源',
      kind: 'GitHub',
      status: null,
      beats: [
        {
          big: 'tessera',
          text: E ? en.alsoBuilt.tessera.line : tess.line,
          links: [{ label: E ? 'Source on GitHub' : 'GitHub 原始碼', href: tess.repo }],
          shot: { src: '/media/tessera-demo.webp', w: 1010, h: 784, alt: E ? 'tessera previewing a pasted image inside a terminal' : 'tessera 在終端機裡預覽貼上的圖片' },
        },
        {
          big: 'orca-companion-kit',
          text: E ? en.alsoBuilt['orca-companion-kit'].line : kit.line,
          links: [
            { label: E ? 'Source on GitHub' : 'GitHub 原始碼', href: kit.repo },
            { label: E ? 'Everything I have built' : '看全部作品', href: `${pre.value}/portfolio/`, pop: true },
          ],
          shot: { src: '/media/puff-pet-throw.webp', w: 862, h: 510, alt: E ? 'The desktop pet being thrown across the screen' : '桌面寵物被丟過螢幕' },
        },
      ],
    },
  ]
})

/* ------------------------------------------------------------------------ */
/* The scene                                                                 */
/* ------------------------------------------------------------------------ */

const root = ref(null)
const canvas = ref(null)
const live = ref(false)
let stage = null
let gctx = null
let tl = null
let gsapRef = null
const cleanups = []

/** The old app's screen: a list of what you spent, and no answer. */
function oldScreen() {
  const cv = document.createElement('canvas')
  cv.width = 750
  cv.height = 1600
  const g = cv.getContext('2d')
  const font = getComputedStyle(document.documentElement).getPropertyValue('--font-body')
  g.fillStyle = '#f2f2f0'
  g.fillRect(0, 0, 750, 1600)
  g.fillStyle = '#1e1b18'
  g.font = `800 54px ${font}`
  g.fillText(c.value.oldName, 56, 190)
  const rows = isEn.value
    ? [['Convenience store', '-65'], ['Lunch', '-120'], ['Metro', '-35'], ['Bubble tea', '-55'], ['Online order', '-890'], ['Dinner', '-180'], ['Convenience store', '-42'], ['Cinema', '-320']]
    : [['便利商店', '-65'], ['午餐', '-120'], ['捷運', '-35'], ['飲料', '-55'], ['網購', '-890'], ['晚餐', '-180'], ['便利商店', '-42'], ['電影', '-320']]
  rows.forEach(([k, v], i) => {
    const y = 300 + i * 112
    g.fillStyle = '#ffffff'
    g.beginPath()
    g.roundRect(40, y, 670, 92, 22)
    g.fill()
    g.fillStyle = '#4b453f'
    g.font = `500 34px ${font}`
    g.fillText(k, 76, y + 58)
    g.textAlign = 'right'
    g.fillStyle = '#1e1b18'
    g.font = `700 34px ${font}`
    g.fillText(v, 674, y + 58)
    g.textAlign = 'left'
  })
  g.fillStyle = '#c44a24'
  g.font = `800 ${isEn.value ? 40 : 50}px ${font}`
  g.textAlign = 'center'
  g.fillText(c.value.oldQ, 375, 1330)
  g.font = `500 30px ${font}`
  g.fillStyle = '#6a6259'
  g.fillText('……', 375, 1400)
  return cv
}

const isDark = () => {
  const t = document.documentElement.dataset.theme
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
}
const sceneOn = () => 'scene' in document.documentElement.dataset

function teardown() {
  cycleTl?.kill()
  cycleTl = null
  tl?.scrollTrigger?.kill()
  tl?.kill()
  tl = null
  gctx?.revert()
  gctx = null
}

function fail() {
  live.value = false
  delete document.documentElement.dataset.scene
  teardown()
  stage?.dispose()
  stage = null
}

/**
 * Where each device stands, per layout. x and y are fractions of the frame
 * from its centre; scale is relative to the device's fitted size; z pulls it
 * toward the camera.
 */
function poses(wide) {
  const W = wide
  return {
    focus: {
      phone: W ? { x: 0.23, y: 0, z: 0, scale: 1.12, rotX: 0.04 } : { x: 0, y: 0.2, z: 0, scale: 0.66, rotX: 0.04 },
      laptop: W ? { x: 0.21, y: 0.02, z: 0, scale: 0.92, rotX: 0.2 } : { x: 0, y: 0.2, z: 0, scale: 0.82, rotX: 0.2 },
      tablet: W ? { x: 0.24, y: 0, z: 0, scale: 1, rotX: 0.03 } : { x: 0, y: 0.21, z: 0, scale: 0.84, rotX: 0.03 },
      monitor: W ? { x: 0.24, y: 0.02, z: 0, scale: 1, rotX: 0.02 } : { x: 0, y: 0.2, z: 0, scale: 0.86, rotX: 0.02 },
    },
  }
}

/** The opening shows one device at a time, in this order, each with its chapter. */
const CYCLE = [
  { device: 'phone', chapter: 'osave', screen: 0, rotY: -0.26 },
  { device: 'laptop', chapter: 'phishforge', screen: 0, rotY: -0.3 },
  { device: 'tablet', chapter: 'medalink', screen: 0, rotY: -0.24 },
  { device: 'monitor', chapter: 'finctory', screen: 0, rotY: -0.2 },
  { device: 'monitor', chapter: 'open', screen: 1, rotY: -0.2, stay: true },
]

/** In the opening a device stands where its chapter will put it; on a phone, lower and smaller, under the words. */
function heroPose(P, name, wide) {
  const f = P.focus[name]
  return wide ? { ...f } : { ...f, y: -0.24, scale: f.scale * 0.78 }
}

/* The opening cycle: one device rises, holds, and leaves upward as the next
   rises. It stops the moment the page is scrolled. */
let cycleTl = null
const heroOn = ref(-1)

function startCycle(wide) {
  const { gsap } = gsapRef
  stopCycle(true)
  const S = stage.states
  const P = poses(wide)
  const HOLD = 2.6
  cycleTl = gsap.timeline({ repeat: -1 })
  CYCLE.forEach((c, i) => {
    const s = S[c.device]
    const next = CYCLE[(i + 1) % CYCLE.length]
    const at = cycleTl.duration()
    cycleTl.call(() => (heroOn.value = i), null, at)
    if (c.stay) {
      // Same device, next screen: no exit and re-entry, only the picture changes.
      cycleTl.to(s, { screen: c.screen, duration: 0.8, ease: 'power1.inOut' }, at)
    } else {
      cycleTl.fromTo(
        s,
        { ...heroPose(P, c.device, wide), dy: -1.3, spin: -1.1, rotY: c.rotY, rotZ: 0, screen: c.screen, open: 1 },
        { dy: 0, spin: 0, duration: 1.1, ease: 'power3.out' },
        at
      )
    }
    const leave = at + (c.stay ? 0.8 : 1.1) + HOLD
    if (next.device !== c.device) cycleTl.to(s, { dy: 1.4, spin: 0.9, duration: 0.7, ease: 'power2.in' }, leave)
    else cycleTl.to({}, { duration: 0.01 }, leave)
  })
}

function stopCycle(silent) {
  if (!cycleTl) return
  cycleTl.kill()
  cycleTl = null
  heroOn.value = -1
  if (silent === true || !stage) return
  // Whatever was up leaves downward, out of the way of the first chapter.
  for (const s of Object.values(stage.states)) {
    if (Math.abs(s.dy) < 1.2) gsapRef.gsap.to(s, { dy: -1.5, duration: 0.45, ease: 'power2.in' })
  }
}

function build() {
  const { gsap } = gsapRef
  teardown()
  const el = root.value
  const S = stage.states
  const wide = innerWidth >= 900
  const P = poses(wide)
  const vh = innerHeight
  const base = el.getBoundingClientRect().top + scrollY
  const beat = (k) => el.querySelector(`[data-beat="${k}"]`)
  // Timeline time is scroll distance in pixels, so a key placed at a beat's
  // offset happens exactly when that beat arrives.
  const at = (k, f = 0) => beat(k).getBoundingClientRect().top + scrollY - base - vh * 0.7 + f * vh
  const D = vh * 0.6
  const total = el.offsetHeight - vh

  // Every device starts parked below the frame; the opening cycle brings
  // them up one at a time.
  for (const name of Object.keys(S)) Object.assign(S[name], { rotZ: 0, rotY: 0, spin: 0, screen: 0, open: 1, ...heroPose(P, name, wide), dy: -1.5 })

  gctx = gsap.context(() => {
    tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: D },
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: false },
    })
    const to = (name, vars, t) => tl.to(S[name], vars, t)

    // Opening -> oSave: whatever the cycle was showing has gone; the phone
    // rises and turns once to face you.
    let t = at('osave-0', -0.3)
    tl.fromTo(
      S.phone,
      { ...P.focus.phone, dy: -1.4, rotY: -0.8, rotZ: 0, spin: 0, screen: 0 },
      { dy: 0, rotY: Math.PI * 2 + 0.3, duration: D * 1.4, immediateRender: false },
      t
    )
    // The old app, its question, then the three questions.
    t = at('osave-1')
    to('phone', { screen: 1, rotY: Math.PI * 2 - 0.32, rotZ: -0.04 }, t)
    t = at('osave-2')
    to('phone', { screen: 2, rotY: Math.PI * 2 + 0.26, rotZ: 0 }, t)
    t = at('osave-3')
    to('phone', { screen: 3, rotY: Math.PI * 2 - 0.12 }, t)

    // oSave -> PhishForge: the phone drops away; the laptop rises shut and
    // opens on the first beat.
    t = at('phishforge-0', -0.35)
    to('phone', { y: -1.5, rotZ: 0.3, duration: D * 0.8, ease: 'power2.in' }, t)
    tl.set(S.laptop, { ...P.focus.laptop, dy: 0, spin: 0, y: -1.4, rotY: -0.5, open: 0, screen: 0 }, t)
    to('laptop', { y: P.focus.laptop.y, rotY: -0.22, duration: D * 1.1, ease: 'power3.out' }, t + D * 0.3)
    to('laptop', { open: 1, rotY: -0.3, duration: D * 0.9, ease: 'power2.out' }, t + D * 1.0)
    t = at('phishforge-1')
    to('laptop', { screen: 1, rotY: 0.18 }, t)
    to('laptop', { screen: 2, rotY: 0.1 }, t + D * 0.9)
    t = at('phishforge-2')
    to('laptop', { rotY: -0.3 }, t)

    // PhishForge -> MedaLink: the lid closes, the laptop leaves; the tablet
    // swings in from the right.
    t = at('medalink-0', -0.35)
    to('laptop', { open: 0, duration: D * 0.6 }, t)
    to('laptop', { y: -1.5, duration: D * 0.6, ease: 'power2.in' }, t + D * 0.45)
    tl.set(S.tablet, { ...P.focus.tablet, dy: 0, spin: 0, x: 1.4, rotY: -1.4, rotZ: 0, screen: 0 }, t)
    to('tablet', { x: P.focus.tablet.x, rotY: -0.2, duration: D * 1.2, ease: 'power3.out' }, t + D * 0.5)
    t = at('medalink-1')
    to('tablet', { screen: 1, rotY: 0.2 }, t)
    t = at('medalink-2')
    to('tablet', { screen: 2, rotY: -0.26, rotZ: 0.03 }, t)

    // MedaLink -> Finctory: the tablet leaves right; the monitor rises.
    t = at('finctory-0', -0.35)
    to('tablet', { x: 1.5, rotY: -1.0, duration: D * 0.8, ease: 'power2.in' }, t)
    tl.set(S.monitor, { ...P.focus.monitor, dy: 0, spin: 0, y: -1.4, rotY: 0.5, screen: 0 }, t)
    to('monitor', { y: P.focus.monitor.y, rotY: -0.16, duration: D * 1.2, ease: 'power3.out' }, t + D * 0.35)
    // Open source: the same monitor, now running the recordings.
    t = at('open-0')
    to('monitor', { screen: 1, rotY: 0.14 }, t)
    t = at('open-1')
    to('monitor', { screen: 2, rotY: -0.14 }, t)

    // Pad the timeline to the full scroll distance, so time == pixels.
    tl.set({}, {}, Math.max(total, tl.duration()))

    // The opening cycle runs only while the opening is on screen.
    gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${vh * 0.3}`,
        onLeave: stopCycle,
        onEnterBack: () => startCycle(wide),
      },
    })

    // The words: each beat fades in as it arrives and out as it leaves.
    el.querySelectorAll('.pl-beat').forEach((b) => {
      const inner = b.querySelector('.pl-in')
      const hero = b.dataset.beat === 'hero'
      const bt = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: b, start: hero ? 'top top' : 'top 80%', end: 'bottom 20%', scrub: true },
      })
      if (!hero) bt.fromTo(inner, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.22 }, 0)
      bt.to(inner, { autoAlpha: 0, y: -40, duration: 0.2 }, 0.8)
      bt.set({}, {}, 1)
    })
  }, el)

  // A rebuild (fonts arriving, a resize) resets every device, so the opening
  // cycle starts again here rather than once at boot.
  if (scrollY < vh * 0.3) startCycle(wide)
}

async function boot() {
  if (stage || !sceneOn() || !canvas.value) return
  try {
    const [{ createStage }, { gsap }, { ScrollTrigger }] = await Promise.all([
      import('~/studio/stage.js'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
    if (!sceneOn() || !canvas.value) return
    gsap.registerPlugin(ScrollTrigger)
    gsapRef = { gsap, ScrollTrigger }

    stage = createStage(canvas.value, {
      dark: isDark(),
      onLost: fail,
      // Each screen's file with its content hash in the URL (utils/asset.ts).
      devices: Object.fromEntries(Object.entries({
        monitor: ['/images/finctory-site.webp', { video: '/media/tessera-demo.mp4', fit: 'contain', bg: '#0c0c0c' }, { video: '/media/puff-pet-throw.mp4', fit: 'contain', bg: '#1b1d24' }],
        laptop: ['/images/phishforge-1.png', '/images/phishforge-2.png', '/images/phishforge-3.png'],
        tablet: ['/images/medalink-2.jpg', '/images/medalink-1.jpg', '/images/medalink-3.jpg'],
        phone: ['/images/osave-2.webp', oldScreen(), '/images/osave-3.webp', '/images/osave-4.webp'],
      }).map(([k, list]) => [k, list.map((s) => (typeof s === 'string' ? asset(s) : s?.video ? { ...s, video: asset(s.video) } : s))])),
    })
    build()

    // Draw only while the stage is on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? stage?.start() : stage?.stop()))
    io.observe(root.value)
    cleanups.push(() => io.disconnect())

    let timer = 0
    const onResize = () => {
      stage?.resize()
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!stage) return
        build()
        ScrollTrigger.refresh()
      }, 180)
    }
    addEventListener('resize', onResize)
    cleanups.push(() => {
      removeEventListener('resize', onResize)
      clearTimeout(timer)
    })

    // Fonts move every beat; re-measure once they are in.
    document.fonts?.ready.then(() => {
      if (!stage) return
      build()
      ScrollTrigger.refresh()
    })

    const mo = new MutationObserver(() => {
      if (!sceneOn()) return fail()
      stage?.setDark(isDark())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-scene'] })
    cleanups.push(() => mo.disconnect())

    live.value = true
    ScrollTrigger.refresh()
  } catch (e) {
    console.warn('[product line] falling back to the text version', e)
    fail()
  }
}

onMounted(() => {
  const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1))
  idle(boot, { timeout: 500 })
  // The text-only toggle can turn the scene back on later.
  const mo = new MutationObserver(() => sceneOn() && !stage && boot())
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scene'] })
  cleanups.push(() => mo.disconnect())
})

onBeforeUnmount(() => {
  cleanups.forEach((f) => f())
  teardown()
  stage?.dispose()
  stage = null
})
</script>

<style scoped>
.pl {
  position: relative;
}

/* ---- Stacked (text-only, reduced motion, no WebGL) ---------------- */

.pl-sticky {
  display: none;
}

.pl-beat {
  padding-inline: var(--gutter, clamp(1rem, 4vw, 3rem));
  max-width: 76rem;
  margin-inline: auto;
}

.pl-beat--hero {
  padding-block: var(--sp-8) var(--sp-8);
}

.pl-ch {
  display: grid;
  gap: var(--sp-8);
  padding-block: var(--sp-9);
  border-top: 1px solid var(--rule);
}

.pl-in {
  max-width: 44rem;
}

.pl-shot {
  display: block;
  margin-top: var(--sp-6);
  width: min(46rem, 100%);
  height: auto;
  border-radius: var(--r-2);
  box-shadow: var(--shadow-2);
}

.pl-shot--phone {
  width: min(15rem, 60vw);
  border-radius: 28px;
}

/* ---- Type --------------------------------------------------------- */

.pl-who {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--sp-1) var(--sp-3);
}

.pl-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-1);
}

.pl-alt {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.pl-h1 {
  word-break: keep-all;
  margin-top: var(--sp-5);
  font-size: var(--step-5);
  font-weight: 900;
}

.pl-line {
  display: block;
}

.pl-sub {
  margin-top: var(--sp-5);
  font-size: var(--step-2);
  font-weight: 600;
  color: var(--ink-2);
}

/* The index of the opening: every piece, and a way straight to it. */
.pl-index {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-2);
  margin-top: var(--sp-7);
  max-width: 32rem;
}

.pl-index a {
  display: grid;
  gap: 2px;
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--r-2);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  text-decoration: none;
  color: var(--ink);
  transition:
    transform 200ms var(--ease-entrance),
    box-shadow 200ms var(--ease-entrance);
}

.pl-index a:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
}

/* The chapter whose device is on stage in the opening. */
.pl-index .is-on a {
  box-shadow:
    inset 0 0 0 2px var(--pop),
    var(--shadow-2);
}

.pl-index-name {
  font-weight: 700;
}

.pl-index-kind {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.pl-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-4);
  font-size: var(--step--1);
  color: var(--ink-2);
}

.pl-tag {
  font-weight: 600;
}

.pl-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.15em 0.7em;
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--shadow-1);
  font-weight: 600;
  color: var(--ink);
}

.pl-status::before {
  content: '';
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: var(--clay-sage);
}

.pl-big {
  word-break: keep-all;
  overflow-wrap: anywhere;
  font-family: var(--font-display);
  font-size: var(--step-5);
  font-weight: 900;
  line-height: 1.08;
  text-wrap: balance;
}

.pl-copy {
  margin-top: var(--sp-5);
  max-width: 30em;
  font-size: var(--step-1);
  color: var(--ink-2);
}

.pl-role {
  margin-top: var(--sp-5);
  max-width: 30em;
  font-weight: 600;
  color: var(--ink);
}

.pl-act {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-top: var(--sp-6);
}

.pl-figs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-5) var(--sp-8);
  margin-top: var(--sp-7);
}

.pl-figs div {
  display: flex;
  flex-direction: column-reverse;
}

.pl-figs dd {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(2.75rem, 1.8rem + 3.6vw, 5rem);
  line-height: 1;
  color: var(--pop-ink);
}

.pl-figs dt {
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  color: var(--ink-3);
}

/* 720 hours as one bar; the lit part is when someone is at the desk. */
.pl-hours {
  margin-top: var(--sp-7);
  max-width: 30rem;
}

.pl-hours-bar {
  height: 0.9rem;
  border-radius: 999px;
  background: var(--rule);
  overflow: hidden;
}

.pl-hours-on {
  display: block;
  height: 100%;
  background: var(--pop);
  border-radius: 999px;
}

.pl-hours-key {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-4);
  margin-top: var(--sp-3);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.pl-hours-key b {
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 900;
  color: var(--ink);
  margin-right: 0.2em;
}
</style>

<!-- Unscoped: the scene layout hangs off <html data-scene>. -->
<style>
/* The stage is pinned behind everything in the section: sticky, one screen
   tall, and pulled back out of the flow by its own height. */
html[data-scene] .pl-sticky {
  display: block;
  position: sticky;
  top: 0;
  height: 100svh;
  margin-bottom: -100svh;
  pointer-events: none;
  z-index: 0;
}

html[data-scene] .pl-canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 900ms var(--ease-entrance);
}

html[data-scene] .pl-canvas.is-live {
  opacity: 1;
}

html[data-scene] .pl-ch {
  display: block;
  padding: 0;
  border: 0;
}

html[data-scene] .pl-beat {
  position: relative;
  z-index: 1;
  max-width: none;
  min-height: 150svh;
  padding-inline: clamp(var(--sp-6), 6vw, 9rem);
}

/* The words stay put in the middle of the screen while their beat passes. */
html[data-scene] .pl-text {
  position: sticky;
  top: 50svh;
  transform: translateY(-50%);
}

html[data-scene] .pl-in {
  width: min(40rem, 40vw);
}

html[data-scene] .pl-beat--hero {
  min-height: 135svh;
  padding-block: 0;
}

html[data-scene] .pl-beat--hero .pl-text {
  position: relative;
  top: 0;
  transform: none;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding-top: var(--header-h);
}

html[data-scene] .pl-h1,
html[data-scene] .pl-big {
  font-size: clamp(2.25rem, 4.6vw, 5.25rem);
}

html[data-scene] .pl-shot {
  display: none;
}

/* The last beat of the line gets a little more room before the next section. */
html[data-scene] .pl-ch:last-of-type .pl-beat:last-child {
  min-height: 170svh;
}

/* A phone: the device takes the top of the frame, the words the bottom. */
@media (max-width: 899px) {
  html[data-scene] .pl-beat {
    min-height: 125svh;
    padding-inline: var(--sp-4);
  }

  html[data-scene] .pl-text {
    top: 0;
    transform: none;
    min-height: 100svh;
    display: flex;
    align-items: flex-end;
    padding-bottom: var(--sp-6);
  }

  html[data-scene] .pl-in {
    width: 100%;
  }

  html[data-scene] .pl-beat--hero .pl-text {
    align-items: flex-start;
    padding-top: calc(var(--header-h) + var(--sp-6));
  }

  html[data-scene] .pl-big,
  html[data-scene] .pl-h1 {
    font-size: clamp(1.9rem, 1.1rem + 4vw, 2.6rem);
  }

  html[data-scene] .pl-copy,
  html[data-scene] .pl-sub {
    font-size: var(--step-0);
  }

  html[data-scene] .pl-index {
    display: none;
  }

  html[data-scene] .pl-figs {
    margin-top: var(--sp-5);
  }

  html[data-scene] .pl-figs dd {
    font-size: 2.4rem;
  }
}
</style>
