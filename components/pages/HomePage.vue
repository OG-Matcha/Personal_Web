<template>
  <!--
    The homepage is about the person. On a wide screen it is two columns:
    on the left, who I am and what I am doing now, held in place; on the
    right, what I think, the road that got me here, and the things I built
    along it, which serve as evidence for the first two.
    On a phone the left column becomes the opening and the rest follows.
  -->
  <DeskScene />
  <!-- The walk ends looking down at the desk; the page is laid out on it. -->
  <div class="pp-desk" :style="grain">
  <!-- Things left on the desk, rendered from the same 3D models (studio/desk/render_props.py) -->
  <div class="pp-props" aria-hidden="true">
    <img v-for="p in props" :key="p.n" :class="`pp-prop pp-prop--${p.n}`" :src="asset(`/images/desk-prop-${p.n}.webp`)" :width="p.w" :height="p.h" :style="{ width: `min(${p.w}px, (100vw - var(--col-w)) * ${(p.w / 800).toFixed(3)})` }" alt="" loading="lazy" decoding="async" />
  </div>
  <div class="pp">
    <aside class="pp-me" :aria-label="c.meLabel">
      <div class="pp-me-in">
        <div class="pp-badge">
        <div class="pp-id">
          <img
            class="pp-face"
            :src="asset('/images/avatar-face.webp')"
            :alt="c.photoAlt"
            width="320"
            height="320"
          />
          <p class="pp-names">
            <span class="pp-name" :lang="c.nameLang">{{ c.name }}</span>
            <span class="pp-alt" :lang="isEn ? 'zh-Hant' : undefined">{{ c.altName }}</span>
          </p>
        </div>

        </div>

        <div class="pp-now">
          <h2 class="pp-now-h">{{ c.nowH }}</h2>
          <ul>
            <li v-for="n in c.now" :key="n.what">
              <span class="pp-now-what">{{ n.what }}</span>
              <span class="pp-now-where">{{ n.where }}</span>
            </li>
          </ul>
        </div>

      </div>
    </aside>

    <div class="pp-flow">
      <!-- What I think -->
      <section id="about" class="pp-sec" aria-labelledby="about-h">
        <h2 id="about-h" class="pp-h">{{ c.aboutH }}</h2>
        <div class="pp-prose">
          <p v-for="(p, i) in c.about" :key="i">{{ p }}</p>
        </div>
      </section>

      <!-- The road -->
      <section id="record" class="pp-sec" aria-labelledby="record-h">
        <h2 id="record-h" class="pp-h">{{ c.pathH }}</h2>
        <p class="pp-lede">{{ c.pathLede }}</p>
        <div ref="roadEl" class="pp-road-wrap" :class="{ 'is-live': live }">
          <span class="pp-trail" aria-hidden="true"
            ><span ref="trailEl" class="pp-trail-fill"
          /></span>
          <span ref="walkerEl" class="pp-walker" aria-hidden="true" />
          <ol class="pp-road">
            <li
              v-for="(b, i) in road"
              :key="b.id"
              class="pp-stop"
              :class="{ 'is-lit': !live || i <= reached }"
            >
              <p class="pp-when figures">{{ b.when }}</p>
              <div class="pp-stop-body">
                <h3 class="pp-q">{{ b.title }}</h3>
                <p v-if="b.lede" class="pp-stop-text">{{ b.lede }}</p>
                <!-- The year's events fold away: the road reads as questions and
                     answers, and the record is one tap away, not in the way. -->
                <details class="pp-ev" @toggle="refreshWalk">
                  <summary class="pp-ev-sum">{{ c.events(b.shown.length + b.more) }}</summary>
                  <ul class="pp-events">
                    <li v-for="e in b.shown" :key="e.date + e.title">
                      <time class="figures" :datetime="e.date">{{ formatDate(e.date) }}</time>
                      <span>{{ e.title }}</span>
                    </li>
                  </ul>
                  <p v-if="b.more" class="pp-more">
                    <NuxtLink :to="`${pre}/resume/`">{{ c.more(b.more) }}</NuxtLink>
                  </p>
                </details>
              </div>
              <span
                class="pp-dot"
                :class="{ 'pp-dot--now': i === road.length - 1 }"
                aria-hidden="true"
              />
            </li>
          </ol>
        </div>

        <dl class="pp-counts reveal">
          <div v-for="n in counts" :key="n.label">
            <dt>{{ n.label }}</dt>
            <dd class="figures">{{ n.n }}</dd>
          </div>
        </dl>
        <p class="pp-act">
          <NuxtLink :to="`${pre}/resume/`" class="btn">{{ c.resume }}</NuxtLink>
        </p>
      </section>

      <!-- The things built along it -->
      <section id="work" class="pp-sec" aria-labelledby="work-h">
        <h2 id="work-h" class="pp-h">{{ c.workH }}</h2>
        <p class="pp-lede">{{ c.workLede }}</p>
        <ul class="pp-works">
          <li v-for="(w, i) in workList" :key="w.title" class="pp-work reveal" :class="{ 'pp-work--small': i >= BIG }">
            <component
              :is="w.internal ? NuxtLinkC : 'a'"
              v-bind="w.internal ? { to: w.href } : { href: w.href, ...linkAttrs(w.href) }"
              class="pp-work-link"
            >
              <span class="pp-print"><SiteShot class="pp-work-shot" fit="cover" sizes="(min-width: 1024px) 46rem, 100vw" :src="w.img" :width="w.w" :height="w.h" /></span>
              <div class="pp-work-body">
                <p class="pp-work-meta">
                  <span>{{ w.when }}</span>
                  <span v-if="w.status" class="pp-status">{{ w.status }}</span>
                </p>
                <h3 class="pp-work-title">
                  {{ w.title }}
                  <ArrowUpRight :size="18" :stroke-width="2" class="pp-arrow" aria-hidden="true" />
                </h3>
                <p class="pp-work-role">{{ w.role }}</p>
                <p v-if="i < BIG" class="pp-work-line">{{ w.line }}</p>
                <ul v-if="w.tags && i < BIG" class="pp-tags">
                  <li v-for="t in w.tags" :key="t">{{ t }}</li>
                </ul>
              </div>
            </component>
          </li>
        </ul>
        <p class="pp-act">
          <NuxtLink :to="`${pre}/portfolio/`" class="btn">{{ c.all }}</NuxtLink>
        </p>
      </section>

    </div>
  </div>
  <!--
    Contact closes the page as a scene, not as one more block in the column:
    the walk began at the desk in daylight and ends there with the lamp on,
    the note stuck on the desk top. It is the same still the room opens on.
  -->
  <section id="contact" class="pp-end" aria-labelledby="contact-h">
    <h2 id="contact-h" class="pp-h pp-end-h">{{ c.contactH }}</h2>
    <div class="pp-end-scene">
      <img class="pp-end-desk" :src="asset('/desk/poster-night.webp')" :srcset="srcset('/desk/poster-night.webp')" sizes="100vw" alt="" width="1600" height="1000" loading="lazy" decoding="async" />
      <div class="pp-note reveal">
        <p class="pp-lede">{{ c.contactLede }}</p>
        <p class="pp-mail">
          <!-- If it has to wrap, it wraps before the @, never inside a word. -->
          <a :href="`mailto:${site.contact.email}`"
            >{{ site.contact.email.split('@')[0] }}<wbr />@{{ site.contact.email.split('@')[1] }}</a
          >
        </p>
        <ul class="pp-links">
          <li v-for="l in links" :key="l.label">
            <a :href="l.href" v-bind="l.attrs" :aria-label="l.label">
              <component :is="l.icon" :size="20" :stroke-width="1.9" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a :href="cvHref" class="pp-cv" download>
              <FileText :size="18" :stroke-width="1.9" aria-hidden="true" />
              {{ c.cv }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
import { nextTick, resolveComponent } from 'vue'
import { ArrowUpRight, FileText, Github, Instagram, Linkedin } from 'lucide-vue-next'
import DeskScene from '~/components/desk/DeskScene.vue'
import deskProps from '~/components/pages/desk-props.json'

const NuxtLinkC = resolveComponent('NuxtLink')
const { site, en, beats, works, alsoBuilt } = useContent()
const { locale } = useLocale()
const isEn = computed(() => locale.value === 'en')
const pre = computed(() => (isEn.value ? '/en' : ''))
const cvHref = computed(() => (isEn.value ? site.contact.cv.hrefEn : site.contact.cv.href))
const work = Object.fromEntries(works.map((w) => [w.slug, w]))
const repo = (n) => alsoBuilt.find((a) => a.name === n)
// Desk props for the right margin, sized by studio/desk/ship_props.py.
// Same scale for all three.
const props = ['mug', 'kuaikuai', 'plant'].map((n) => ({ n, ...deskProps[n] }))
// The grain tiles' URLs carry their content hash (utils/asset.ts), so they are set here, not in the CSS.
const grain = { '--grain-day': `url(${asset('/images/desk-grain-day.webp')})`, '--grain-night': `url(${asset('/images/desk-grain-night.webp')})` }

// The paragraphs under 我怎麼想 are a first-person draft written from the
// case studies and the five questions; every claim in them is checkable in
// content/work/*.yml or timeline.yml.
const c = computed(() =>
  isEn.value
    ? {
        meLabel: 'About me',
        name: site.person.nameEn,
        nameLang: 'en',
        altName: `${site.person.nameZh} · OG_Matcha`,
        photoAlt: 'Ju-Shen Huang',
        thesis: 'I take AI from demo to something people still use three months later.',
        nowH: 'Now',
        now: [
          { what: 'Co-founder & CTO', where: 'Finctory' },
          { what: 'Co-founder & forward-deployed engineer', where: 'MedaLink' },
          { what: 'AI intern', where: 'ITRI ISTI' },
          { what: 'Master’s student, since Sep 2026', where: 'NCU Information Management' },
        ],
        cv: 'CV',
        aboutH: 'How I think',
        about: [
          'I use AI as leverage: a way to turn a one-off fix into a system that keeps running. A demo that works takes a weekend. What I care about is that three months later people are still using it, and when it breaks, someone knows where.',
          'The way I learn has not changed. I teach myself something, teach it to someone else, then build with it. After my college entrance exam I taught myself Python, built a Discord bot as my first project, and started teaching classmates to code. In my first year at university I joined the SAP student team at the ERP centre and taught its summer course the year after; later I started a project-based Python course for students across campus. Most of what Finctory and MedaLink run on, I learned the same way.',
          'Every team I have been on was small. Finctory’s engineering team is four people or fewer; at MedaLink, the AI half is me. So the first question I ask of any technical decision is whether the next person can pick it up: one stack across products, the reasons written down, and tests that remember how the system should behave.',
          'I have also got it wrong. We spent close to a year on Invoice Doctor before admitting it could not answer the question users actually had, and started oSave from scratch. Since then I work out what answer the user wants before deciding whether AI belongs in it at all.',
        ],
        pathH: 'The road so far',
        pathLede: 'Five questions I had to answer, in order, each with what actually happened.',
        more: (n) => `${n} more in the full record`,
        events: (n) => `${n} things that year`,
        resume: 'Full record and skills',
        workH: 'Things I built',
        workLede: 'What each one is, the part that was mine, and where it stands now.',
        all: 'Everything I have built',
        contactH: 'Get in touch',
        contactLede:
          'Generative-AI and agent architecture, early-stage technical partnerships, talks and workshops. Email reaches me fastest.',
      }
    : {
        meLabel: '關於我',
        name: site.person.nameZh,
        nameLang: 'zh-Hant',
        altName: `${site.person.nameEn} · OG_Matcha`,
        photoAlt: '黃鉅燊',
        thesis: '我把 AI 從展示品，​做到三個月後還有人在用。',
        nowH: '現在',
        now: [
          { what: '共同創辦人暨技術長', where: '斐闊 Finctory' },
          { what: '共同創辦人暨前線部署工程師', where: '醫數行銷 MedaLink' },
          { what: 'AI Intern', where: '工研院 產科國際所' },
          { what: '碩士班在學，2026.09 起', where: '中央大學 資訊管理學系' },
        ],
        cv: '履歷 PDF',
        aboutH: '我怎麼想',
        about: [
          '我把 AI 當成槓桿，用它把一次性的解法，變成能一直跑下去的系統。做出一個會動的 demo，通常一個週末就夠；我在意的是三個月後使用者還在用，出錯的時候有人知道錯在哪。',
          '我學東西的方式一直沒變：自己學會，教給別人，再拿去做出東西。學測後我自學 Python，第一個作品是 Discord 機器人，接著開始教同學寫程式；大一加入 ERP 中心的 SAP 學生團隊，隔年變成暑期講師；後來又開了一門給全校學生的 Python 專案課。斐闊和醫數行銷用到的技術，大多也是這樣學來的。',
          '我待過的團隊都很小。斐闊的工程團隊不到四個人，醫數行銷的 AI 那一半只有我。所以每個技術決策，我先問的是下一個人接不接得住：幾條產品線用同一套技術、把理由寫下來、讓測試替大家記住系統該怎麼動。',
          '我也做錯過。發票醫生做了將近一年，我們才承認它答不出使用者真正想問的問題，於是從頭做了財伴。從那之後，我會先弄清楚使用者想得到什麼答案，再決定那裡需不需要 AI。',
        ],
        pathH: '我走的路',
        pathLede: '五個我得回答的問題，依序排下來，每一個後面接著當時實際發生的事。',
        more: (n) => `還有 ${n} 筆，見完整年表`,
        events: (n) => `這段路上的 ${n} 件事`,
        resume: '完整年表與能力',
        workH: '做出來的東西',
        workLede: '每一件是什麼、哪一部分是我做的，以及它現在的狀態。',
        all: '看全部作品',
        contactH: '聯絡',
        contactLede: `${site.open.join('、')}。寫信最快。`,
      }
)

const links = [
  {
    label: 'GitHub',
    href: site.contact.github,
    icon: Github,
    attrs: linkAttrs(site.contact.github, { me: true }),
  },
  {
    label: 'LinkedIn',
    href: site.contact.linkedin,
    icon: Linkedin,
    attrs: linkAttrs(site.contact.linkedin, { me: true }),
  },
  {
    label: 'Instagram',
    href: site.contact.instagram,
    icon: Instagram,
    attrs: linkAttrs(site.contact.instagram, { me: true }),
  },
]

const SHOW = 5
const road = computed(() =>
  beats.map((b) => {
    const tr = isEn.value ? (en.beats?.[b.id] ?? {}) : {}
    const events = b.events.map((e) => ({
      date: e.date,
      title: isEn.value ? (en.timeline?.[`${e.date} ${e.title}`]?.title ?? e.title) : e.title,
    }))
    const shown = events.length > SHOW ? events.slice(-SHOW) : events
    const sameYear =
      b.from.slice(0, 4) === b.to.slice(0, 4) && b.from.endsWith('-01') && b.to.endsWith('-12')
    return {
      id: b.id,
      when: sameYear ? b.from.slice(0, 4) : `${formatDate(b.from)} – ${formatDate(b.to)}`,
      title: tr.title ?? b.title,
      lede: tr.lede ?? b.lede,
      shown,
      more: events.length - shown.length,
      year: b.from.slice(0, 4),
    }
  })
)

const counts = computed(() =>
  isEn.value
    ? [
        { n: site.counts.awards, label: 'competition awards' },
        { n: site.counts.topPrizes, label: 'national top prizes' },
        { n: site.counts.researchGrants, label: 'NSTC research grants' },
      ]
    : [
        { n: site.counts.awards, label: '競賽獎項' },
        { n: site.counts.topPrizes, label: '全國首獎' },
        { n: site.counts.researchGrants, label: '國科會研究計畫' },
      ]
)

const workList = computed(() => {
  const E = isEn.value
  const p = pre.value
  const tess = repo('tessera')
  const kit = repo('orca-companion-kit')
  return [
    {
      title: E ? 'MedaLink clinic operations' : '醫數行銷 MedaLink 診所營運系統',
      when: E ? '2026 –' : '2026 起',
      status: E ? 'Live' : work.medalink.status,
      role: E
        ? 'Co-founder, forward-deployed engineer · the whole AI half'
        : '共同創辦人、前線部署工程師 · AI 那一半全由我負責',
      line: E
        ? 'Answers patients on LINE, books them into slots where doctor, room and equipment are all free, then handles reminders, rescheduling and recalls.'
        : '在 LINE 上回病患訊息，把人約進醫師、診間、儀器同時空得出來的時段，再接手提醒、改約和回診召回。',
      tags: E
        ? ['173 API routes', '63 eval cases', '2 people']
        : ['173 條 API 路由', '63 個 eval case', '2 人做完'],
      img: '/images/medalink-cover.webp',
      w: 1600,
      h: 900,
      href: `${p}/work/medalink/`,
      internal: true,
    },
    {
      title: E ? 'oSave' : '財伴 oSave',
      when: E ? '2025 –' : '2025 起',
      status: E ? 'Live' : work.osave.status,
      role: E ? 'CTO · system architecture and backend' : '技術長 · 系統架構與後端',
      line: E
        ? 'A budgeting app that tells you whether your finances are healthy. Three questions become thirteen cash-flow directions and six health measures.'
        : '會告訴你財務健不健康的記帳 App。三個問題，翻成 13 項金流方向和六項健康指標。',
      tags: E ? ['App Store', 'Google Play', 'v1.1.5'] : ['App Store', 'Google Play', 'v1.1.5'],
      img: '/images/osave-1.webp',
      w: 1800,
      h: 1200,
      href: `${p}/work/osave/`,
      internal: true,
    },
    {
      title: E ? 'Finctory' : '斐闊 Finctory',
      when: E ? '2024 –' : '2024 起',
      status: E ? 'Operating' : work.finctory.status,
      role: E
        ? 'Co-founder, CTO · architecture, AI choices, engineering team'
        : '共同創辦人、技術長 · 架構、AI 選型、工程團隊',
      line: E
        ? 'A student-run company, registered in 2025, with four product lines and no investors. Built so that anyone can leave and the system still runs.'
        : '學生創業，2025 年完成登記，四條產品線、沒有投資人。系統要做到任何一個人離開都還能運作。',
      tags: E
        ? ['4 product lines', 'NT$1M+ in prizes and grants']
        : ['4 條產品線', '獎金與補助 NT$100 萬+'],
      img: '/images/finctory-site.webp',
      w: 1600,
      h: 1000,
      href: `${p}/work/finctory/`,
      internal: true,
    },
    {
      title: 'PhishForge',
      when: '2024',
      status: E ? 'Concluded' : work.phishforge.status,
      role: E ? 'Backend and AI engineering' : '後端與 AI 工程',
      line: E
        ? 'Phishing drills where the AI writes emails staff cannot tell from real ones, and the company sees how many people clicked.'
        : '讓 AI 把演練信寫到員工分不出真假，再用點擊數據告訴企業有多少人上鉤。',
      tags: E
        ? ['1st place, security track', 'NSTC project']
        : ['資安應用組第一名', '國科會大專生計畫'],
      img: '/images/phishforge-1.png',
      w: 1600,
      h: 894,
      href: `${p}/work/phishforge/`,
      internal: true,
    },
    {
      title: 'tessera',
      when: '2026',
      status: E ? 'Open source' : '開源',
      role: E ? 'Author' : '作者',
      line: E ? en.alsoBuilt.tessera.line : tess.line,
      tags: tess.stack,
      img: '/images/tessera-1.png',
      w: 1280,
      h: 640,
      href: tess.repo,
      internal: false,
    },
    {
      title: 'orca-companion-kit',
      when: '2026',
      status: E ? 'Open source' : '開源',
      role: E ? 'Author' : '作者',
      line: E ? en.alsoBuilt['orca-companion-kit'].line : kit.line,
      tags: kit.stack,
      img: '/images/orca-companion-kit-1.png',
      w: 1600,
      h: 947,
      href: kit.repo,
      internal: false,
    },
  ]
})

let ro = null

/* The road walk. A line is drawn down the road as it is scrolled, a dot
   walks at its tip, and each stop lights up as the dot reaches it. Only
   when motion is welcome; otherwise every stop is simply lit. */
const roadEl = ref(null)
const trailEl = ref(null)
const walkerEl = ref(null)
const live = ref(false)
const reached = ref(-1)
let walk = null
// Opening or closing a year's events moves every dot below it.
let refreshWalk = () => {}
// The first two works as large prints; the other four small, two by two.
const BIG = 2
onMounted(() => {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) startWalk()

  // Each block settles in once, as it is reached. Skipped under reduced motion.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const items = document.querySelectorAll('.pp .reveal, .pp-end .reveal')
    ro = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          ro.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    items.forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('is-waiting')
        ro.observe(el)
      }
    })
  }
})
// Kept alive when the reader leaves (app.vue): the road walk stops while
// away and starts again on the way back.
let away = false
onDeactivated(() => {
  away = true
  walk?.revert()
  walk = null
})
onActivated(() => {
  if (!away) return
  away = false
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) startWalk()
})
onBeforeUnmount(() => {
  ro?.disconnect()
  walk?.revert()
})

async function startWalk() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)
  refreshWalk = () => ScrollTrigger.refresh()
  const el = roadEl.value
  if (!el) return
  live.value = true
  await nextTick()
  walk = gsap.context(() => {
    let marks = []
    let span = 1
    const measure = () => {
      const top = el.querySelector('.pp-trail').offsetTop
      marks = [...el.querySelectorAll('.pp-dot')].map(
        (d) => d.closest('.pp-stop').offsetTop + d.offsetTop + d.offsetHeight / 2 - top
      )
      span = el.querySelector('.pp-trail').offsetHeight
    }
    measure()
    const toTrail = gsap.quickTo(trailEl.value, 'scaleY', { duration: 0.4, ease: 'power2.out' })
    const toWalker = gsap.quickTo(walkerEl.value, 'y', { duration: 0.4, ease: 'power2.out' })
    ScrollTrigger.create({
      trigger: el,
      // The walker sits where the eye reads: a little above the middle.
      start: 'top 55%',
      end: 'bottom 55%',
      invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate: (st) => {
        // Never past the last year, and close to a year it settles on that
        // year's dot, so the two never sit a few pixels apart like a double dot.
        let y = Math.min(st.progress * span, marks[marks.length - 1] ?? span)
        const near = marks.find((m) => Math.abs(y - m) < 28)
        if (near !== undefined) y = near
        toTrail(y / span)
        toWalker(y)
        let r = -1
        marks.forEach((m, i) => {
          if (y + 4 >= m) r = i
        })
        reached.value = r
      },
    })
  }, el)
}
</script>

<style scoped>
.pp-desk {
  position: relative;
  isolation: isolate;
  overflow-x: clip; /* props hang off the window's edge; clip, not hidden, keeps the column sticky */
}

/* Things left on the desk, in the margins either side of the column. The
   room's sun throws every shadow up and to the right: on the right each
   thing's shadow runs off the window, and the one on the left sits far
   enough out that its shadow ends before the text. */
.pp-props {
  display: none;
}

@media (min-width: 1280px) {
  .pp-props {
    display: block;
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* Each keeps its size relative to the others, but all of them shrink with
     the margin: when the page was two columns the margin at 1440 px was 130 px
     and the mug at full size ran off the window, cut in half. The width is set inline from the
     picture's own (desk-props.json). */
  .pp-prop {
    position: absolute;
    left: calc(50% + var(--col-w) / 2 + 1rem);
    height: auto;
  }

  .pp-prop--mug {
    top: 30rem;
  }

  .pp-prop--kuaikuai {
    left: auto;
    right: calc(50% + var(--col-w) / 2 + 2.5rem);
    top: 44%;
    rotate: -8deg;
  }

  .pp-prop--plant {
    top: 76%;
  }
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .pp-prop {
    filter: brightness(0.72) saturate(0.85);
  }
}

:root[data-theme='dark'] .pp-prop {
  filter: brightness(0.72) saturate(0.85);
}

/* The desk top, washed out to the page colour (studio/desk/make_page_grain.py):
   one tile stretched to the window's width and repeated down. It fades in
   over the first screen, so it meets the room's fade with no edge. */
.pp-desk::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--grain-day) center top / max(100%, 1024px) auto repeat-y;
  -webkit-mask-image: linear-gradient(transparent, #000 32rem);
  mask-image: linear-gradient(transparent, #000 32rem);
  pointer-events: none;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .pp-desk::before {
    background-image: var(--grain-night);
  }
}

:root[data-theme='dark'] .pp-desk::before {
  background-image: var(--grain-night);
}

.pp {
  --gut: var(--page-gut);
  max-width: var(--page-w);
  margin-inline: auto;
  padding-inline: var(--gut);
}

/* ---- Left: the person -------------------------------------------- */

.pp-me-in {
  padding-block: var(--sp-8) var(--sp-7);
}

.pp-id {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.pp-face {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow:
    0 0 0 3px var(--surface),
    var(--shadow-1);
}

.pp-names {
  display: grid;
  gap: 2px;
}

.pp-name {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: var(--step-3);
  line-height: 1.05;
}

.pp-alt {
  font-size: var(--step--1);
  color: var(--ink-3);
}

.pp-thesis {
  margin-top: var(--sp-6);
  max-width: 18em;
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 800;
  line-height: 1.35;
  text-wrap: balance;
}

.pp-now {
  margin-top: var(--sp-6);
}

.pp-now-h {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--step--1);
  font-weight: 700;
  color: var(--ink);
}

.pp-now-h::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--clay-sage);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--clay-sage) 30%, transparent);
}

.pp-now ul {
  display: grid;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
  list-style: none;
  font-size: var(--step--1);
}

.pp-now li {
  display: grid;
  align-content: start;
}

.pp-now-what {
  color: var(--ink);
  font-weight: 600;
}

.pp-now-where {
  color: var(--ink-3);
}

.pp-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1) var(--sp-2);
  margin-top: var(--sp-6);
  margin-left: calc(-1 * var(--sp-3));
  list-style: none;
}

.pp-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  min-width: 44px;
  min-height: 44px;
  padding-inline: var(--sp-3);
  color: var(--ink-2);
  text-decoration: none;
  transition: color 160ms var(--ease-entrance);
}

.pp-links a:hover {
  color: var(--pop-ink);
}

.pp-cv {
  font-size: var(--step--1);
  font-weight: 600;
}

/* ---- Right: the flow -------------------------------------------- */

.pp-sec {
  padding-block: var(--sp-8);
  scroll-margin-top: calc(var(--header-h) + var(--sp-5));
}

.pp-h {
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 900;
  line-height: 1.15;
}

.pp-lede {
  margin-top: var(--sp-3);
  max-width: var(--measure-han);
  color: var(--ink-2);
}

/* A page torn from the notebook on the desk: punched holes and a red
   margin line down the left. No ruled lines: Latin words set in Archivo
   inside Han text stretch some line boxes, so rules drift off the text. */
.pp-prose {
  position: relative;
  display: grid;
  gap: 1lh;
  margin-top: var(--sp-6);
  max-width: 36em;
  padding: 1lh clamp(1rem, 4%, 2rem) 1lh calc(clamp(1rem, 4%, 2rem) + 1.75rem);
  font-size: var(--step-1);
  line-height: 1.85;
  color: var(--ink-2);
  border-radius: 4px var(--r-1) var(--r-1) 4px;
  background:
    radial-gradient(circle at 0.85rem 50%, var(--bg) 0 0.32rem, rgb(var(--shadow-rgb) / 0.12) 0.34rem, transparent 0.42rem) 0 0 / 100% 2.75rem repeat-y,
    linear-gradient(90deg, transparent calc(clamp(1rem, 4%, 2rem) + 0.75rem), var(--margin-line) 0 calc(clamp(1rem, 4%, 2rem) + 0.75rem + 1.5px), transparent 0),
    var(--paper);
  box-shadow: var(--shadow-2);
  transform: rotate(-0.4deg);
  --paper: #fffdf8;
  --margin-line: rgb(207 96 58 / 0.55);
}

:root[data-theme='dark'] .pp-prose {
  --paper: #232633;
  --margin-line: rgb(255 138 91 / 0.45);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .pp-prose {
    --paper: #232633;
      --margin-line: rgb(255 138 91 / 0.45);
  }
}

.pp-prose p:first-child {
  color: var(--ink);
  font-weight: 600;
}

/* The road: a rule down the left, a dot at each stop, the last one lit.
   With motion, a line is drawn down it and a dot walks at its tip. */
.pp-road-wrap {
  position: relative;
  margin-top: var(--sp-7);
}

.pp-road {
  position: relative;
  display: grid;
  gap: var(--sp-7);
  padding-left: var(--sp-6);
  list-style: none;
}

.pp-road::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(var(--rule), var(--rule-strong));
}

.pp-stop {
  position: relative;
}

.pp-trail {
  position: absolute;
  left: 5px;
  top: 0.75rem;
  bottom: 0.5rem;
  width: 2px;
  display: none;
}

.pp-trail-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--pop);
  transform: scaleY(0);
  transform-origin: top;
}

.pp-walker {
  position: absolute;
  left: 0;
  top: calc(0.75rem - 6px);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--pop);
  box-shadow:
    0 0 0 5px color-mix(in srgb, var(--pop) 20%, transparent),
    0 0 18px 2px color-mix(in srgb, var(--pop) 45%, transparent);
  display: none;
  z-index: 1;
}

.pp-road-wrap.is-live .pp-trail,
.pp-road-wrap.is-live .pp-walker {
  display: block;
}

/* Stops ahead of the walker wait, quieter; each one lights as it is reached. */
.pp-road-wrap.is-live .pp-stop > :not(.pp-dot) {
  transition:
    opacity 500ms var(--ease-entrance),
    transform 500ms var(--ease-entrance);
}

.pp-road-wrap.is-live .pp-stop:not(.is-lit) > :not(.pp-dot) {
  /* Quieter, still readable: the text ahead keeps 4.5:1 in both themes. */
  opacity: 0.72;
  transform: translateY(10px);
}

.pp-road-wrap.is-live .pp-events li {
  transition:
    opacity 450ms var(--ease-entrance),
    transform 450ms var(--ease-entrance);
}

.pp-road-wrap.is-live .pp-stop:not(.is-lit) .pp-events li {
  /* The stop's own dimming already applies; the rows only slide. */
  opacity: 1;
  transform: translateX(-6px);
}

.pp-road-wrap.is-live .pp-stop.is-lit .pp-events li:nth-child(2) {
  transition-delay: 60ms;
}
.pp-road-wrap.is-live .pp-stop.is-lit .pp-events li:nth-child(3) {
  transition-delay: 120ms;
}
.pp-road-wrap.is-live .pp-stop.is-lit .pp-events li:nth-child(4) {
  transition-delay: 180ms;
}
.pp-road-wrap.is-live .pp-stop.is-lit .pp-events li:nth-child(5) {
  transition-delay: 240ms;
}

.pp-road-wrap.is-live .pp-stop.is-lit .pp-dot {
  background: var(--pop);
  border-color: var(--pop);
  animation: pp-ring 700ms var(--ease-entrance);
}

@keyframes pp-ring {
  from {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--pop) 55%, transparent);
  }
  to {
    box-shadow: 0 0 0 14px color-mix(in srgb, var(--pop) 0%, transparent);
  }
}

.pp-dot {
  position: absolute;
  left: calc(-1 * var(--sp-6));
  top: 0.35rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--rule-strong);
}

.pp-dot--now {
  background: var(--pop);
  border-color: var(--pop);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--pop) 22%, transparent);
}

.pp-when {
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--pop-ink);
}

.pp-q {
  margin-top: var(--sp-2);
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 800;
  line-height: 1.3;
  text-wrap: balance;
}

.pp-stop-text {
  margin-top: var(--sp-3);
  max-width: 36em;
  color: var(--ink-2);
}

.pp-ev-sum {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
  padding-block: 10px;
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--pop-ink);
  cursor: pointer;
  list-style: none;
}

.pp-ev-sum::-webkit-details-marker {
  display: none;
}

.pp-ev-sum::after {
  content: '';
  width: 0.45em;
  height: 0.45em;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  rotate: 45deg;
  translate: 0 -0.15em;
  transition: rotate 200ms var(--ease-entrance), translate 200ms var(--ease-entrance);
}

.pp-ev[open] > .pp-ev-sum::after {
  rotate: 225deg;
  translate: 0 0.1em;
}

.pp-ev-sum:focus-visible {
  outline: 2px solid var(--pop);
  outline-offset: 2px;
  border-radius: 2px;
}

.pp-ev .pp-events {
  margin-top: var(--sp-2);
}

/* Each stop's events on an index card: one ruled line per row (a wrapped
   title gets a second line, still on the rules), the red head line, and the
   cards tipped a little either way, as if dealt onto the desk. */
.pp-events {
  --rule-h: 2rem;
  --sink: 0.4rem; /* lifts each rule to just under the baseline, where a hand writes */
  --card: #fffdf8;
  --card-rule: rgb(70 120 190 / 0.22);
  --card-head: rgb(207 96 58 / 0.6);
  display: grid;
  margin-top: var(--sp-4);
  padding: calc(var(--rule-h) * 0.75) var(--sp-5) calc(var(--rule-h) * 0.5);
  border-radius: 3px;
  background:
    linear-gradient(var(--card-head), var(--card-head)) 0 calc(var(--rule-h) * 0.75 - 2px) / 100% 1.5px no-repeat,
    repeating-linear-gradient(transparent 0 calc(var(--rule-h) - 1px), var(--card-rule) 0 var(--rule-h)) 0 calc(var(--rule-h) * 0.75 - var(--sink)) / 100% calc(100% - var(--rule-h) * 1.25) no-repeat,
    var(--card);
  box-shadow: var(--shadow-2);
  list-style: none;
  font-size: var(--step--1);
  line-height: var(--rule-h);
  rotate: 0.5deg;
}

@media (max-width: 640px) {
  .pp-events {
    --rule-h: 1.75rem;
    --sink: 0.3rem;
    padding-inline: var(--sp-4);
  }
}

.pp-stop:nth-child(even) .pp-events {
  rotate: -0.6deg;
}

:root[data-theme='dark'] .pp-events {
  --card: #232633;
  --card-rule: rgb(140 170 230 / 0.13);
  --card-head: rgb(255 138 91 / 0.45);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .pp-events {
    --card: #232633;
    --card-rule: rgb(140 170 230 / 0.13);
    --card-head: rgb(255 138 91 / 0.45);
  }
}

.pp-events li {
  display: grid;
  grid-template-columns: 4.5em 1fr;
  gap: var(--sp-3);
}

.pp-events time {
  color: var(--ink-3);
}

.pp-more {
  margin-top: var(--sp-3);
  font-size: var(--step--1);
}

.pp-more a {
  display: inline-block;
  padding-block: 12px;
  margin-block: -12px;
  color: var(--pop-ink);
  font-weight: 600;
}

/* The tally: a slip of paper taped to the desk, each count a red seal pressed
   on it. Three equal columns at every width: never two and a stray one. */
.pp-counts {
  --card: #fffdf8;
  --tape: rgb(232 222 196 / 0.8);
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-4);
  max-width: 34rem;
  margin-top: var(--sp-8);
  padding: var(--sp-6) var(--sp-5) var(--sp-5);
  border-radius: 3px;
  background: var(--card);
  box-shadow: var(--shadow-2);
  rotate: -0.7deg;
}

/* Masking tape holding it down. */
.pp-counts::before {
  content: '';
  position: absolute;
  top: -0.7rem;
  left: 50%;
  width: 6rem;
  height: 1.4rem;
  translate: -50% 0;
  rotate: 2.5deg;
  background: var(--tape);
  box-shadow: 0 1px 2px rgb(var(--shadow-rgb) / 0.08);
}

:root[data-theme='dark'] .pp-counts {
  --card: #232633;
  --tape: rgb(150 150 165 / 0.35);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .pp-counts {
    --card: #232633;
    --tape: rgb(150 150 165 / 0.35);
  }
}

.pp-counts div {
  display: flex;
  flex-direction: column-reverse;
  /* Reversed, flex-end is the top: the seals share one line however many
     lines their labels take. */
  justify-content: flex-end;
  align-items: flex-start;
}

/* A seal: the figure inside a double ring, pressed a little crooked. */
.pp-counts dd {
  min-width: 1.7em;
  padding: 0.12em 0.2em 0.08em;
  border: 4px double currentColor;
  border-radius: 0.2em;
  font-family: var(--font-display);
  font-size: var(--step-4);
  font-weight: 900;
  line-height: 1;
  text-align: center;
  color: var(--pop-ink);
  rotate: -4deg;
}

.pp-counts div:nth-child(2) dd {
  rotate: 3deg;
}

.pp-counts div:nth-child(3) dd {
  rotate: -1.5deg;
}

.pp-counts dt {
  margin-top: var(--sp-3);
  font-size: var(--step--1);
  color: var(--ink-2);
  text-wrap: balance; /* 國科會研究計畫 on a phone: two even lines, not one character left alone */
}

/* Reached: the slip settles, then the seals go down one after another. */
.pp-counts.reveal.is-waiting:not(.is-in) dd {
  opacity: 0;
  scale: 1.4;
}

.pp-counts.reveal.is-in dd {
  transition:
    opacity 90ms linear,
    scale 240ms cubic-bezier(0.3, 1.5, 0.55, 1);
  transition-delay: 380ms;
}

.pp-counts.reveal.is-in div:nth-child(2) dd {
  transition-delay: 560ms;
}

.pp-counts.reveal.is-in div:nth-child(3) dd {
  transition-delay: 740ms;
}

.pp-act {
  margin-top: var(--sp-6);
}

/* The work: a row each, picture beside words; the whole row is the link. */
.pp-works {
  display: grid;
  /* Far more air between works than inside one, so each picture reads as
     belonging to the title under it, not to the one above. */
  gap: var(--sp-7) var(--sp-5);
  margin-top: var(--sp-6);
  list-style: none;
}

/* After the first two, the rest are small prints two to a row, phones
   too: the same things, less of the scroll. */
.pp-works {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pp-work:not(.pp-work--small) {
  grid-column: 1 / -1;
}

@media (max-width: 559px) {
  .pp-works {
    column-gap: var(--sp-3);
  }

  .pp-work--small .pp-print {
    padding: 5px 5px 7px;
  }

  .pp-work--small .pp-work-link {
    padding: 0;
  }

  .pp-work--small .pp-work-role {
    display: none;
  }
}

.pp-work--small .pp-print {
  padding: 8px 8px 10px;
}

.pp-work--small .pp-work-link {
  gap: var(--sp-3);
  padding: var(--sp-2);
}

.pp-work--small .pp-work-title {
  font-size: var(--step-0);
}

/* A work's picture uncovers upward the first time it is reached. */
.pp-work.reveal.is-waiting:not(.is-in) .pp-work-shot {
  clip-path: inset(100% 0 0 0 round var(--r-2));
}

.pp-work.reveal.is-in .pp-work-shot {
  clip-path: inset(0 0 0 0 round var(--r-2));
  transition: clip-path 900ms var(--ease-entrance) 120ms;
}

.pp-work-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--sp-4);
  padding: var(--sp-4);
  border-radius: var(--r-3);
  color: inherit;
  text-decoration: none;
}

/* Each product as a print lying on the desk: white border, a slight tilt
   (alternating, as prints dropped one after another), a real shadow. It
   replaced a flat CSS laptop that looked nothing like the 3D one above.
   On hover the print is picked up: straightened and lifted. */
.pp-print {
  display: block;
  padding: 12px 12px 14px;
  border-radius: 3px;
  background: var(--print);
  box-shadow:
    0 1px 1px rgb(var(--shadow-rgb) / 0.12),
    0 18px 28px -16px rgb(var(--shadow-rgb) / 0.45);
  rotate: -0.8deg;
  transition:
    rotate 260ms var(--ease-entrance),
    transform 260ms var(--ease-entrance),
    box-shadow 260ms var(--ease-entrance);
}

.pp-work:nth-child(even) .pp-print {
  rotate: 0.9deg;
}

.pp-work-link:hover .pp-print,
.pp-work-link:focus-visible .pp-print {
  rotate: 0deg;
  transform: translateY(-6px);
  box-shadow:
    0 1px 1px rgb(var(--shadow-rgb) / 0.12),
    0 30px 40px -20px rgb(var(--shadow-rgb) / 0.55);
}

.pp-work-link:focus-visible {
  outline: 2px solid var(--pop);
  outline-offset: 4px;
}

.pp-work-shot {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 3px;
}

.pp-work-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-2) var(--sp-3);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.pp-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  color: var(--ink-2);
  font-weight: 600;
}

.pp-status::before {
  content: '';
  width: 0.45em;
  height: 0.45em;
  border-radius: 50%;
  background: var(--clay-sage);
}

.pp-work-title {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-top: var(--sp-1);
  font-family: var(--font-display);
  font-size: var(--step-1);
  font-weight: 800;
}

.pp-arrow {
  flex: none;
  color: var(--ink-3);
  transition:
    transform 200ms var(--ease-entrance),
    color 200ms var(--ease-entrance);
}

.pp-work-link:hover .pp-arrow {
  color: var(--pop-ink);
  transform: translate(2px, -2px);
}

.pp-work-role {
  margin-top: var(--sp-1);
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--ink-2);
}

.pp-work-line {
  margin-top: var(--sp-2);
  font-size: var(--step--1);
  line-height: 1.75;
  color: var(--ink-2);
}

.pp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
  list-style: none;
}

.pp-tags li {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--surface-2);
  box-shadow: inset 0 0 0 1px var(--rule);
  color: var(--ink-2);
  font-size: var(--step--1);
  font-weight: 600;
}

/* ---- The end: the desk at night, the note on it ----------------- */

.pp-end {
  padding-block: var(--sp-8) var(--sp-7);
  scroll-margin-top: calc(var(--header-h) + var(--sp-5));
}

.pp-end-h {
  /* On the column's left edge, like every heading above it. */
  max-width: calc(var(--col-w, var(--page-w)) + 2 * var(--page-gut));
  margin-inline: auto;
  padding-inline: var(--page-gut);
}

.pp-end-scene {
  position: relative;
  margin-top: var(--sp-6);
}

/* Full width, cropped to the desk; its top and bottom fade into the page
   so the scene sits in the paper rather than on it. */
.pp-end-desk {
  display: block;
  width: 100%;
  height: clamp(22rem, 56vw, 44rem);
  object-fit: cover;
  object-position: 50% 62%;
  -webkit-mask-image: linear-gradient(transparent, #000 18%, #000 78%, transparent);
  mask-image: linear-gradient(transparent, #000 18%, #000 78%, transparent);
}

/* On the desk top, right of the laptop, where the light falls. */
.pp-end .pp-note {
  position: absolute;
  left: 50%;
  top: 56%;
  /* The address is sized to the note (cqi), so the note is its container. */
  container-type: inline-size;
  width: min(36rem, calc(100% - 2 * var(--page-gut)));
  margin: 0;
  /* translate and rotate, not transform: the entrance (.reveal) animates
     transform and would otherwise wipe the placement when it ends. */
  translate: -14% -50%;
  rotate: -2.2deg;
}

@media (max-width: 640px) {
  /* Too narrow for the note to sit on the desk: it hangs off the picture's foot. */
  .pp-end-desk {
    height: 16rem;
    -webkit-mask-image: linear-gradient(transparent, #000 20%, #000 72%, transparent);
    mask-image: linear-gradient(transparent, #000 20%, #000 72%, transparent);
  }

  .pp-end .pp-note {
    position: relative;
    left: auto;
    top: auto;
    margin: -3.5rem var(--page-gut) 0;
    width: auto;
    translate: none;
    rotate: -1.2deg;
  }
}



/* A note stuck on the edge of the screen: butter paper, a strip of tape. */
.pp-note {
  position: relative;
  margin-top: var(--sp-6);
  padding: var(--sp-7) clamp(1.25rem, 5cqi, 2.5rem) var(--sp-6);
  background: #f6dc93;
  color: #1e1b18;
  box-shadow:
    0 1px 1px rgb(64 44 24 / 0.1),
    0 22px 30px -18px rgb(64 44 24 / 0.45);
  rotate: 0.6deg;
}

.pp-note::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  width: 7rem;
  height: 26px;
  background: rgb(255 255 255 / 0.55);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
  transform: translateX(-50%) rotate(-2deg);
}

.pp-note .pp-lede {
  margin-top: 0;
  color: #4b453f;
}

.pp-note .pp-mail a {
  color: #1e1b18;
  text-decoration-color: #c44a24;
}

/* Everywhere else to find me, on the same note: the paper is the same
   yellow in both themes, so the ink is too. */
.pp-note .pp-links {
  margin-top: var(--sp-5);
}

.pp-note .pp-links a {
  color: #4b453f;
}

.pp-note .pp-links a:hover {
  color: #a83c1c;
}

/* The badge on its lanyard: the name and role on a card with a slot. */
.pp-badge {
  position: relative;
  padding: var(--sp-6) var(--sp-5) var(--sp-5);
  border-radius: var(--r-2);
  background: var(--surface);
  box-shadow: var(--shadow-1);
}

.pp-badge::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  width: 3rem;
  height: 8px;
  border-radius: var(--r-full);
  background: var(--bg);
  box-shadow: inset 0 1px 2px rgb(var(--shadow-rgb) / 0.25);
  transform: translateX(-50%);
}

/* Sized to its column (30 characters of a wide display face, about 17em),
   so the address stays on one line at every width. */
.pp-mail {
  margin-top: var(--sp-6);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(0.95rem, 5.4cqi, 2.5rem);
  line-height: 1.1;
}

.pp-mail a {
  /* The address is one unit: never split at a dot. It is sized to the
     card (cqi) so it fits on one line. */
  white-space: nowrap;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.18em;
  text-decoration-color: var(--pop);
}

/* Opening: the person settles in, one piece after another. CSS, so it runs
   from the first frame and needs no script. */
@media (prefers-reduced-motion: no-preference) {
  .pp-me-in > * {
    animation: pp-rise 800ms var(--ease-entrance) both;
  }

  .pp-me-in > :nth-child(2) {
    animation-delay: 90ms;
  }
  .pp-me-in > :nth-child(3) {
    animation-delay: 160ms;
  }
  .pp-me-in > :nth-child(4) {
    animation-delay: 260ms;
  }
  .pp-me-in > :nth-child(5) {
    animation-delay: 340ms;
  }
  .pp-me-in > :nth-child(6) {
    animation-delay: 420ms;
  }

  .pp-face {
    animation: pp-face 900ms var(--ease-entrance) both;
  }

  .pp-flow > :first-child {
    animation: pp-rise 900ms var(--ease-entrance) 300ms both;
  }

  /* The address underlines itself, left to right, when it is reached. */
  .pp-mail a {
    text-decoration: none;
    background: linear-gradient(var(--pop), var(--pop)) left bottom / 100% 2px no-repeat;
    padding-bottom: 0.08em;
  }

  .pp-mail.is-waiting:not(.is-in) a {
    background-size: 0% 2px;
  }

  .pp-mail.is-in a {
    transition: background-size 1000ms var(--ease-entrance) 200ms;
  }
}

@keyframes pp-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
}

@keyframes pp-face {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(-6deg);
  }
}

/* Entrances: settle up once, when first reached. */
.reveal.is-waiting {
  opacity: 0;
  transform: translateY(16px);
}

.reveal.is-in {
  opacity: 1;
  transform: none;
  transition:
    opacity 600ms var(--ease-entrance),
    transform 600ms var(--ease-entrance);
}

/* ---- One column ------------------------------------------------- */

/* On a wide screen the page is one column down the middle of the desk, the
   way a sheet is read: who I am and what I am doing now laid side by side at
   the top, then the rest. The desk shows in both margins. */
@media (min-width: 1024px) {
  .pp-desk {
    --col-w: 46rem;
  }

  .pp {
    max-width: calc(var(--col-w) + 2 * var(--gut));
  }

  .pp-me-in {
    display: grid;
    grid-template-columns: 20rem minmax(0, 1fr);
    gap: var(--sp-6);
    align-items: center;
    padding-block: var(--sp-8) var(--sp-6);
  }

  .pp-badge {
    transform: rotate(-1.2deg);
  }

  .pp-face {
    width: 4.5rem;
    height: 4.5rem;
  }

  .pp-now {
    margin-top: 0;
  }

  /* Each column as wide as its longest title, so none of them wraps. */
  .pp-now ul {
    grid-template-columns: repeat(2, auto);
    justify-content: start;
    gap: var(--sp-3) var(--sp-6);
  }

  .pp-thesis {
    font-size: clamp(1.5rem, 0.9rem + 1.2vw, 2.25rem);
    line-height: 1.3;
  }

  .pp-thesis:lang(en) {
    font-size: clamp(1.375rem, 0.85rem + 1vw, 2rem);
  }

  .pp-flow {
    padding-top: var(--sp-5);
  }
}

@media (max-width: 560px) {
  .pp-work-link {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--sp-3);
    padding: var(--sp-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pp-print,
  .pp-arrow {
    transition: none;
  }

  .pp-work-link:hover .pp-print,
  .pp-work-link:focus-visible .pp-print {
    rotate: 0deg;
    transform: none;
  }
}
</style>
