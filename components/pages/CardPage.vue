<template>
  <!--
    The card handed over in person: someone scans a QR or taps an NFC tag and
    lands here on their phone. Everything they need is in the first screen:
    who this is, one tap to save the contact, and the way to hand theirs back.
    The owner opens the same page (or its home-screen icon) to show the code.
  -->
  <div class="cd" :style="{ '--mx': `${mx}%`, '--my': `${my}%`, '--tx': `${tx}deg`, '--ty': `${ty}deg` }">
    <header class="cd-top">
      <NuxtLink :to="t.home" class="cd-site">ogmatcha.com</NuxtLink>
      <NuxtLink :to="altPath" class="cd-lang" :lang="locale === 'en' ? 'zh-Hant-TW' : 'en'" :hreflang="locale === 'en' ? 'zh-Hant-TW' : 'en'">{{ t.other }}</NuxtLink>
    </header>

    <main id="main" class="cd-main" tabindex="-1">
      <h1 class="sr-only">{{ t.h1 }}</h1>

      <div class="cd-stage" @pointermove="tilt" @pointerleave="untilt">
        <!-- A div, not a <button>: Chrome lays a button's content in an inner
             box that flattens the 3D, and the far face never turned round. -->
        <div
          role="button"
          tabindex="0"
          class="cd-card"
          :class="{ 'is-back': back }"
          :aria-pressed="back ? 'true' : 'false'"
          :aria-label="back ? t.cardBack : t.cardFront"
          @click="back = !back"
          @keydown.enter.prevent="back = !back"
          @keydown.space.prevent="back = !back"
        >
          <span class="cd-flip">
            <span class="cd-face cd-front" :aria-hidden="back ? 'true' : undefined">
              <span class="cd-brand"><span class="cd-dot" aria-hidden="true" />{{ person.handle }}</span>
              <img class="cd-photo" :src="'/card/photo.jpg'" alt="" width="320" height="320" decoding="async" />
              <span class="cd-who">
                <span class="cd-name" :lang="locale === 'en' ? 'en' : 'zh-Hant-TW'">{{ locale === 'en' ? person.nameEn : person.nameZh }}</span>
                <span class="cd-name2" :lang="locale === 'en' ? 'zh-Hant-TW' : 'en'">{{ locale === 'en' ? person.nameZh : person.nameEn }}</span>
              </span>
              <span class="cd-roles">
                <span v-for="r in roles" :key="r.org" class="cd-role"><b>{{ r.org }}</b>{{ r.role }}</span>
              </span>
              <span class="cd-foil" aria-hidden="true" />
            </span>
            <span class="cd-face cd-back" :aria-hidden="back ? undefined : 'true'">
              <img class="cd-qr" :src="qr" alt="" width="200" height="200" />
              <span class="cd-scan">{{ t.scanHint }}</span>
              <span class="cd-url">ogmatcha.com{{ t.path }}</span>
              <span class="cd-foil cd-foil--paper" aria-hidden="true" />
            </span>
          </span>
        </div>
        <p class="cd-hint" aria-hidden="true">{{ back ? t.flipBack : t.flip }}</p>
      </div>

      <div class="cd-acts">
        <a class="cd-btn cd-btn--main" :href="vcf" type="text/vcard">
          <UserPlus :size="20" :stroke-width="2.2" aria-hidden="true" />{{ t.save }}
        </a>
        <button type="button" class="cd-btn" @click="openQr">
          <QrCode :size="20" :stroke-width="2.2" aria-hidden="true" />{{ t.show }}
        </button>
        <button type="button" class="cd-btn" @click="share">
          <Share2 :size="20" :stroke-width="2.2" aria-hidden="true" />{{ shared ? t.copied : t.share }}
        </button>
      </div>
      <p class="sr-only" role="status">{{ shared ? t.copied : '' }}</p>

      <ul class="cd-links" :aria-label="t.linksLabel">
        <li v-for="l in links" :key="l.label">
          <a :href="l.href" :target="l.ext ? '_blank' : undefined" :rel="l.ext ? 'noopener' : undefined">
            <component :is="l.icon" :size="18" :stroke-width="2" aria-hidden="true" />
            <span>{{ l.label }}</span>
          </a>
        </li>
      </ul>

      <section class="cd-about" aria-labelledby="cd-about-h">
        <h2 id="cd-about-h" class="cd-kicker">{{ t.aboutH }}</h2>
        <p class="cd-thesis">{{ thesis }}</p>
        <p class="cd-thesis-sub">{{ thesisSub }}</p>
        <ul class="cd-stats">
          <li v-for="c in stats" :key="c.label"><b>{{ c.n }}</b><span>{{ c.label }}</span></li>
        </ul>
        <h3 class="cd-sub">{{ t.nowH }}</h3>
        <ul class="cd-now">
          <li v-for="r in now" :key="r.org">
            <span class="cd-now-org">{{ r.org }}</span>
            <span class="cd-now-role">{{ r.role }}</span>
            <span class="cd-now-scope">{{ r.scope }}</span>
          </li>
        </ul>
        <h3 class="cd-sub">{{ t.openH }}</h3>
        <ul class="cd-open">
          <li v-for="o in open" :key="o">{{ o }}</li>
        </ul>
        <p class="cd-where"><MapPin :size="16" :stroke-width="2" aria-hidden="true" />{{ t.where }}</p>
      </section>

      <section class="cd-swap" aria-labelledby="cd-swap-h">
        <h2 id="cd-swap-h" class="cd-swap-h">{{ t.swapH }}</h2>
        <div v-if="sent" ref="doneEl" class="cd-done" tabindex="-1" role="status">
          <CheckCircle2 :size="22" :stroke-width="2.2" aria-hidden="true" />
          <p>{{ t.done(name.trim()) }}</p>
        </div>
        <form v-else class="cd-form" novalidate @submit.prevent="send">
          <p class="cd-swap-lede">{{ t.swapLede }}</p>
          <p class="cd-noscript">{{ t.noScript }}<a :href="`mailto:${contact.email}`">{{ contact.email }}</a></p>
          <label class="cd-field">
            <span>{{ t.name }} <small>{{ t.optional }}</small></span>
            <input v-model="name" name="name" autocomplete="name" maxlength="80" />
          </label>
          <label class="cd-field">
            <span>{{ t.reach }}</span>
            <input
              id="cd-reach"
              v-model="reach"
              name="contact"
              autocomplete="email"
              maxlength="160"
              aria-required="true"
              :aria-invalid="err ? 'true' : undefined"
              :aria-describedby="err ? 'cd-reach-hint cd-err' : 'cd-reach-hint'"
              @input="err = ''"
            />
            <small id="cd-reach-hint">{{ t.reachHint }}</small>
            <small v-if="err" id="cd-err" class="cd-err">{{ t.empty }}</small>
          </label>
          <label class="cd-field">
            <span>{{ t.note }} <small>{{ t.optional }}</small></span>
            <textarea v-model="note" name="message" rows="2" maxlength="3000" />
          </label>
          <!-- Left empty by people; bots fill it. -->
          <label class="cd-hp" aria-hidden="true">Website <input v-model="website" name="website" tabindex="-1" autocomplete="off" /></label>
          <button type="submit" class="cd-btn cd-btn--main cd-send" :disabled="busy">
            <Send :size="18" :stroke-width="2.2" aria-hidden="true" />{{ busy ? t.sending : t.send }}
          </button>
          <p v-if="status" ref="statusEl" class="cd-status" role="alert" tabindex="-1">
            <template v-if="failed">{{ t.failedLead }}<a :href="`mailto:${contact.email}`">{{ contact.email }}</a></template>
            <template v-else>{{ status }}</template>
          </p>
        </form>
      </section>
    </main>

    <dialog ref="qrDlg" class="cd-qrdlg" :aria-label="t.show" @close="onQrClose" @click="onDlgClick">
      <div class="cd-qrbox">
        <img :src="qr" :alt="t.qrAlt" width="320" height="320" />
        <p class="cd-qrname">{{ person.nameZh }} · {{ person.nameEn }}</p>
        <p class="cd-qrhint">{{ t.qrHint }}</p>
        <button type="button" class="cd-btn cd-qrclose" @click="$event.currentTarget.closest('dialog').close()">
          <X :size="20" :stroke-width="2.2" aria-hidden="true" />{{ t.close }}
        </button>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { CheckCircle2, FileText, Github, Globe, Instagram, Linkedin, Mail, MapPin, QrCode, Send, Share2, UserPlus, X } from 'lucide-vue-next'

const { site, about, en } = useContent()
const { locale, altPath } = useLocale()
const route = useRoute()
const router = useRouter()
const { person, contact } = site
const SITE = 'https://www.ogmatcha.com'

const t = computed(() =>
  locale.value === 'en'
    ? {
        h1: `Ju-Shen Huang’s card`,
        home: '/en/',
        other: '中文',
        path: '/en/card/',
        cardFront: 'Ju-Shen Huang’s card. Show the QR code side',
        cardBack: 'QR code side of the card. Show the front',
        flip: 'Tap the card to see its QR code',
        flipBack: 'Tap the card to turn it back',
        scanHint: 'Scan to keep this card',
        save: 'Save contact',
        show: 'Show QR',
        share: 'Share',
        copied: 'Link copied',
        linksLabel: 'Other ways to reach me',
        site: 'Website',
        cv: 'Résumé',
        aboutH: 'About me',
        nowH: 'Right now',
        openH: 'Talk to me about',
        where: 'Taoyuan, Taiwan',
        swapH: 'Your turn',
        swapLede: 'Leave a way to reach you and I’ll get in touch. Only I see it.',
        noScript: 'This needs JavaScript, which is off. Email me instead: ',
        name: 'Your name',
        reach: 'How do I reach you?',
        reachHint: 'Email, LINE ID, phone: any of them works.',
        empty: 'Leave one way to reach you, or I cannot find you.',
        note: 'Where we met, or a note',
        optional: '(optional)',
        send: 'Hand it over',
        sending: 'Sending…',
        done: (n) => `Got it${n ? `, ${n}` : ''}. I’ll be in touch.`,
        slow: 'That was quick. Try again in a minute.',
        failedLead: 'It did not go through. Please email me: ',
        qrAlt: 'QR code that opens this card',
        qrHint: 'Point a phone camera at the code',
        close: 'Close',
        shareText: 'Ju-Shen Huang’s card',
      }
    : {
        h1: '黃鉅燊的名片',
        home: '/',
        other: 'EN',
        path: '/card/',
        cardFront: '黃鉅燊的名片。翻到 QR code 那面',
        cardBack: '名片的 QR code 面。翻回正面',
        flip: '點名片看 QR code',
        flipBack: '點名片翻回正面',
        scanHint: '掃描存下這張名片',
        save: '存到通訊錄',
        show: '給對方掃',
        share: '分享',
        copied: '已複製連結',
        linksLabel: '其他聯絡方式',
        site: '網站',
        cv: '履歷',
        aboutH: '關於我',
        nowH: '現在在做',
        openH: '可以找我聊',
        where: '桃園，台灣',
        swapH: '換你留一張',
        swapLede: '留下聯絡方式，我會主動找你。只有我看得到。',
        noScript: '這需要 JavaScript，但目前關著。請直接寫信：',
        name: '你的名字',
        reach: '怎麼聯絡你？',
        reachHint: 'Email、LINE ID 或電話都可以。',
        empty: '留一個聯絡方式，我才找得到你。',
        note: '在哪裡認識的，或想說的話',
        optional: '（選填）',
        send: '交給我',
        sending: '送出中…',
        done: (n) => `收到了${n ? `，${n}` : ''}。我會用你留的方式聯絡你。`,
        slow: '送得有點快，等一分鐘再試一次。',
        failedLead: '沒有送出去，請改寄 email：',
        qrAlt: '打開這張名片的 QR code',
        qrHint: '請對方用手機相機掃描',
        close: '關閉',
        shareText: '黃鉅燊的名片',
      }
)

const roles = computed(() =>
  locale.value === 'en'
    ? en.posts.slice(0, 2).map((p, i) => ({ org: about.posts[i].orgEn, role: p.role }))
    : about.posts.slice(0, 2).map((p) => ({ org: p.org, role: p.role.replace(/（.*?）/, '') }))
)
// The rest of the card, from the same content the homepage prints.
const thesis = computed(() => (locale.value === 'en' ? en.thesisLines.join(' ') : about.thesis))
const thesisSub = computed(() => (locale.value === 'en' ? en.thesisSub : about.thesisSub))
const stats = computed(() => {
  const c = site.counts
  return locale.value === 'en'
    ? [{ n: c.awards, label: 'competition awards' }, { n: c.topPrizes, label: 'national top prizes' }, { n: c.researchGrants, label: 'NSTC research grants' }]
    : [{ n: c.awards, label: '競賽獎項' }, { n: c.topPrizes, label: '全國首獎' }, { n: c.researchGrants, label: '國科會大專生計畫' }]
})
// The GPA as site.yml states it, not a second copy here.
const gpa = (site.now.find((n) => /GPA/.test(n.detail ?? ''))?.detail.match(/GPA [\d.]+ \/ [\d.]+/) ?? [''])[0].replace(/ \//g, String.fromCharCode(160) + '/').replace(/\/ /g, '/' + String.fromCharCode(160))
const now = computed(() =>
  locale.value === 'en'
    ? [
        ...en.posts.map((p, i) => ({ org: about.posts[i].orgEn, role: p.role, scope: p.scope })),
        { org: 'National Central University', role: 'Master’s student, Information Management', scope: `From September 2026; BS 2026, ${gpa}` },
      ]
    : [
        ...about.posts.map((p) => ({ org: p.org, role: p.role, scope: p.scope })),
        { org: '中央大學 資訊管理學系', role: '碩士班', scope: `2026.09 起；學士 ${gpa}` },
      ]
)
const open = computed(() => (locale.value === 'en' ? en.open : site.open))
const vcf = computed(() => (locale.value === 'en' ? '/card/ju-shen-huang-en.vcf' : '/card/ju-shen-huang.vcf'))
const qr = computed(() => (locale.value === 'en' ? '/card/qr-en.svg' : '/card/qr.svg'))
const links = computed(() => [
  { label: 'Email', href: `mailto:${contact.email}`, icon: Mail },
  { label: 'LinkedIn', href: contact.linkedin, icon: Linkedin, ext: true },
  { label: 'GitHub', href: contact.github, icon: Github, ext: true },
  { label: 'Instagram', href: contact.instagram, icon: Instagram, ext: true },
  { label: t.value.site, href: t.value.home, icon: Globe },
  { label: t.value.cv, href: locale.value === 'en' ? '/en/resume/' : '/resume/', icon: FileText },
])

// Flip, and a tilt that follows the mouse (or the phone, where the browser
// hands out its orientation without asking). The foil moves with it.
const back = ref(false)
const mx = ref(30)
const my = ref(20)
const tx = ref(0)
const ty = ref(0)
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches
function tilt(e) {
  if (e.pointerType !== 'mouse' || still()) return
  const r = e.currentTarget.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  mx.value = px * 100
  my.value = py * 100
  ty.value = (px - 0.5) * 14
  tx.value = (0.5 - py) * 10
}
function untilt() {
  tx.value = ty.value = 0
  mx.value = 30
  my.value = 20
}
function orient(e) {
  if (e.beta == null || e.gamma == null || still()) return
  // Held upright in the hand is about 50° of pitch; tilt around that.
  const g = Math.max(-25, Math.min(25, e.gamma))
  const b = Math.max(-25, Math.min(25, e.beta - 50))
  ty.value = g * 0.4
  tx.value = -b * 0.3
  mx.value = 50 + g * 2
  my.value = 50 + b * 2
}

// The big code for someone to scan: the screen stays on while it is up.
const qrDlg = ref(null)
let lock = null
async function openQr() {
  const d = qrDlg.value ?? document.querySelector('.cd-qrdlg')
  if (!d || d.open) return
  d.showModal()
  try { lock = await navigator.wakeLock?.request('screen') } catch {}
}
function releaseLock() {
  lock?.release?.().catch(() => {})
  lock = null
}
function onQrClose() {
  releaseLock()
  // Drop ?show=qr, so a reload shows the card, not the code again.
  if (route.query.show) router.replace({ query: {} })
}
// A tap on the dim edge closes it, as on any sheet.
function onDlgClick(e) {
  if (e.target === qrDlg.value) qrDlg.value.close()
}

const shared = ref(false)
async function share() {
  const url = `${SITE}${t.value.path}`
  try {
    if (navigator.share) return await navigator.share({ title: `${person.nameZh} ${person.nameEn}`, text: t.value.shareText, url })
  } catch (e) {
    if (e?.name === 'AbortError') return
  }
  try {
    await navigator.clipboard.writeText(url)
    shared.value = true
    setTimeout(() => (shared.value = false), 2400)
  } catch {}
}

// Handing their details back: the same worker as the contact form.
const name = ref('')
const reach = ref('')
const note = ref('')
const website = ref('')
const busy = ref(false)
const sent = ref(false)
const err = ref('')
const status = ref('')
const failed = ref(false)
const doneEl = ref(null)
const statusEl = ref(null)
let loadedAt = 0

async function send() {
  status.value = ''
  failed.value = false
  if (reach.value.trim().length < 3) {
    err.value = 'empty'
    document.getElementById('cd-reach')?.focus()
    return
  }
  busy.value = true
  const endpoint = location.hostname.endsWith('ogmatcha.com') ? '/api/contact' : 'https://www.ogmatcha.com/api/contact'
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        site: 'ogmatcha',
        topic: 'card',
        name: name.value,
        contact: reach.value,
        message: note.value,
        // Where the card was opened from: ?src=qr, ?src=nfc.
        page: location.pathname + location.search,
        elapsed: Date.now() - loadedAt,
        website: website.value,
      }),
    })
    if (r.status === 429) status.value = t.value.slow
    else if (!r.ok) throw new Error(String(r.status))
    else {
      sent.value = true
      await nextTick()
      doneEl.value?.focus()
    }
  } catch {
    failed.value = true
    status.value = 'failed'
  } finally {
    busy.value = false
  }
  if (status.value) {
    await nextTick()
    statusEl.value?.focus()
  }
}

onMounted(() => {
  loadedAt = Date.now()
  // iOS and recent Chrome ask before they share orientation; there the card
  // just flips (no prompt for a tilt).
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    addEventListener('deviceorientation', orient)
  }
})

// The home-screen icon opens straight onto the code. Watched, not read at
// mount: a prerendered page hydrates on its bare path (/card/) and Nuxt puts
// the real query back only afterwards (measured: empty at mount).
watch(() => route.query.show, (v) => { if (v === 'qr' && import.meta.client) requestAnimationFrame(() => openQr()) }, { immediate: true })
onBeforeUnmount(() => {
  removeEventListener('deviceorientation', orient)
  releaseLock()
})
</script>

<style scoped>
.cd {
  --card-ink: #f3efe7;
  --card-bg: #16201b;
  --paper: #f6f1e8;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(60rem 36rem at 50% -8rem, color-mix(in oklab, var(--pop) 22%, transparent), transparent 70%),
    var(--bg);
  color: var(--ink);
}

.cd-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: min(100%, 30rem);
  margin-inline: auto;
  padding: var(--sp-3) var(--sp-4) 0;
  font-size: var(--step--1);
}

.cd-top a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-inline: var(--sp-2);
  color: var(--ink-2);
  text-decoration: none;
}

.cd-top a:hover {
  color: var(--ink);
  text-decoration: underline;
}

.cd-site {
  margin-left: calc(-1 * var(--sp-2));
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.cd-lang {
  margin-right: calc(-1 * var(--sp-2));
  font-weight: 700;
}

.cd-main {
  flex: 1;
  width: min(100%, 30rem);
  margin-inline: auto;
  padding: var(--sp-2) var(--sp-4) var(--sp-8);
  display: grid;
  align-content: start;
  gap: var(--sp-5);
}

.cd-main:focus {
  outline: none;
}

/* ---- the card ---- */
.cd-stage {
  perspective: 1200px;
  display: grid;
  justify-items: center;
  gap: var(--sp-2);
}

.cd-card {
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  display: block;
  aspect-ratio: 54 / 80;
  /* Short screens (a small Android, a phone held sideways): the card gives
     way, by width so it keeps its shape, and the save button stays in the
     first screen. */
  width: min(100%, 21rem, max(13rem, (100svh - 15rem) * 0.675));
  cursor: pointer;
  border-radius: 20px;
  transform-style: preserve-3d;
  transform: rotateX(var(--tx)) rotateY(var(--ty));
  transition: transform 0.35s var(--ease-inout);
  -webkit-tap-highlight-color: transparent;
}

.cd-card:focus-visible {
  outline: 3px solid var(--pop-ink);
  outline-offset: 5px;
}

.cd-flip {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.3, 1.35, 0.5, 1);
  /* backwards, not both: a fill that never ends keeps the animation live,
     and Chrome then flattens the 3D (the far face never turned round). The
     fade is on the stage: opacity inside the 3D would flatten it too. */
  animation: cd-in 0.9s cubic-bezier(0.2, 0.9, 0.25, 1) backwards;
}

.is-back .cd-flip {
  transform: rotateY(180deg);
}

@keyframes cd-in {
  from {
    transform: translateY(2.5rem) rotateX(18deg) rotateY(-28deg) scale(0.92);
  }
}

.cd-stage {
  animation: cd-fade 0.5s ease-out backwards;
}

@keyframes cd-fade {
  from {
    opacity: 0;
  }
}

.cd-face {
  container-type: inline-size;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.1),
    0 2px 6px rgb(0 0 0 / 0.2),
    0 40px 70px -30px rgb(0 0 0 / 0.6);
}

.cd-front {
  /* Percentages, not cqi: a container cannot size its own padding by itself. */
  padding: 7% 7% 6%;
  color: var(--card-ink);
  background:
    radial-gradient(110% 70% at 100% 0%, #2c5a44 0%, transparent 60%),
    radial-gradient(90% 60% at 0% 100%, #1d2f3d 0%, transparent 65%),
    var(--card-bg);
}

.cd-brand {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: var(--font-mono);
  font-size: 4cqi;
  letter-spacing: 0.08em;
  color: rgb(243 239 231 / 0.75);
}

.cd-dot {
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  background: #8fd3a8;
  box-shadow: 0 0 0.8em #8fd3a8;
}

.cd-photo {
  width: 40cqi;
  height: 40cqi;
  margin-top: auto;
  border-radius: 50%;
  object-fit: cover;
  box-shadow:
    0 0 0 1.2cqi rgb(255 255 255 / 0.08),
    0 1.6cqi 5cqi rgb(0 0 0 / 0.45);
}

.cd-who {
  display: grid;
  margin-top: 6cqi;
}

.cd-name {
  font-family: var(--font-display);
  font-size: 12.5cqi;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.02em;
}

.cd-name2 {
  margin-top: 1.5cqi;
  font-size: 4.6cqi;
  letter-spacing: 0.06em;
  color: rgb(243 239 231 / 0.7);
}

.cd-roles {
  display: grid;
  gap: 2cqi;
  margin-top: 6cqi;
  padding-top: 4cqi;
  border-top: 1px solid rgb(143 211 168 / 0.3);
  font-size: 3.9cqi;
  line-height: 1.35;
  color: rgb(243 239 231 / 0.85);
}

.cd-role b {
  display: block;
  font-weight: 700;
  color: #a6e0bb;
}

/* Foil: a band of colour that runs across the card with the tilt. */
.cd-foil {
  position: absolute;
  inset: -30%;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 38%,
    rgb(255 120 200 / 0.14) 44%,
    rgb(120 220 255 / 0.2) 49%,
    rgb(170 255 170 / 0.16) 54%,
    transparent 60%
  );
  transform: translate(calc((var(--mx) - 50) * 0.5%), calc((var(--my) - 50) * 0.3%));
  transition: transform 0.35s var(--ease-inout);
  animation: cd-sweep 1.6s 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.cd-foil--paper {
  opacity: 0.35;
}

/* A blend mode or filter anywhere inside flattens the 3D in some engines and
   the turned-away face shows through, mirrored. Hide it outright once the
   card is edge-on, half way through the turn. */
.cd-front,
.cd-back {
  transition: visibility 0s 0.18s;
}

.is-back .cd-front,
.cd-card:not(.is-back) .cd-back {
  visibility: hidden;
}

@keyframes cd-sweep {
  from {
    transform: translate(-45%, 0);
  }
}

.cd-back {
  transform: rotateY(180deg);
  align-items: center;
  justify-content: center;
  gap: 4cqi;
  padding: 8%;
  color: #14161d;
  background: var(--paper);
}

.cd-qr {
  width: 72cqi;
  height: 72cqi;
}

.cd-scan {
  font-size: 4.8cqi;
  font-weight: 700;
}

.cd-url {
  font-family: var(--font-mono);
  font-size: 3.6cqi;
  color: #4c4f57;
}

.cd-hint {
  margin: 0;
  font-size: var(--step--1);
  color: var(--ink-3);
}

/* ---- actions ---- */
.cd-acts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
}

.cd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  min-height: 48px;
  padding: 0 var(--sp-4);
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-full);
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--dur-1), background var(--dur-1);
}

.cd-btn:hover {
  background: var(--surface-2);
}

.cd-btn:active {
  transform: scale(0.97);
}

.cd-btn:focus-visible {
  outline: 3px solid var(--pop-ink);
  outline-offset: 2px;
}

.cd-btn--main {
  grid-column: 1 / -1;
  min-height: 56px;
  border-color: transparent;
  background: var(--pop);
  color: var(--on-pop);
  font-size: var(--step-1);
}

.cd-btn--main:hover {
  background: color-mix(in oklab, var(--pop) 88%, var(--ink));
}

.cd-btn[disabled] {
  opacity: 0.6;
  cursor: progress;
}

.cd-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cd-links a {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  min-height: 64px;
  border-radius: var(--r-2);
  background: color-mix(in oklab, var(--surface) 70%, transparent);
  color: var(--ink-2);
  font-size: var(--step--1);
  text-decoration: none;
}

.cd-links a:hover {
  color: var(--ink);
  background: var(--surface);
}

.cd-links a:focus-visible {
  outline: 3px solid var(--pop-ink);
  outline-offset: 2px;
}

/* ---- about ---- */
.cd-about {
  display: grid;
  gap: var(--sp-3);
  margin-top: var(--sp-3);
}

.cd-kicker {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pop-ink);
}

.cd-thesis {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 800;
  line-height: 1.25;
  text-wrap: balance;
}

.cd-thesis-sub {
  margin: 0;
  color: var(--ink-2);
  text-wrap: pretty;
}

.cd-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-2);
  margin: var(--sp-2) 0 0;
  padding: 0;
  list-style: none;
}

.cd-stats li {
  display: grid;
  align-content: start;
  gap: 0.15em;
  padding: var(--sp-3) var(--sp-2);
  border-radius: var(--r-2);
  background: var(--surface);
  text-align: center;
}

.cd-stats b {
  font-family: var(--font-display);
  font-size: var(--step-3);
  font-weight: 800;
  line-height: 1;
  color: var(--pop-ink);
}

.cd-stats span {
  font-size: var(--step--1);
  line-height: 1.3;
  color: var(--ink-2);
  text-wrap: balance;
}

.cd-sub {
  margin-top: var(--sp-3);
  font-size: var(--step-0);
  font-weight: 800;
}

.cd-now {
  display: grid;
  gap: var(--sp-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cd-now li {
  display: grid;
  gap: 0.1em;
  padding-left: var(--sp-3);
  border-left: 3px solid var(--pop);
}

.cd-now-org {
  font-weight: 800;
}

.cd-now-role {
  font-weight: 700;
  color: var(--ink-2);
}

.cd-now-scope {
  font-size: var(--step--1);
  color: var(--ink-3);
  text-wrap: pretty;
}

.cd-open {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cd-open li {
  padding: 0.35em 0.9em;
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-full);
  font-size: var(--step--1);
  font-weight: 700;
}

.cd-where {
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin: var(--sp-2) 0 0;
  color: var(--ink-2);
}

/* ---- swap ---- */
.cd-swap {
  margin-top: var(--sp-3);
  padding: var(--sp-5);
  border-radius: var(--r-3);
  background: var(--surface);
  box-shadow: var(--shadow-1);
}

.cd-swap-h {
  font-family: var(--font-display);
  font-size: var(--step-2);
  font-weight: 800;
  line-height: 1.2;
}

.cd-swap-lede {
  margin: 0;
  color: var(--ink-2);
  text-wrap: balance;
}

.cd-form {
  display: grid;
  gap: var(--sp-4);
  margin-top: var(--sp-2);
}

.cd-noscript {
  margin: 0;
  color: var(--ink-2);
}

:root[data-js] .cd-noscript {
  display: none;
}

.cd-field {
  display: grid;
  gap: var(--sp-1);
  font-weight: 700;
}

.cd-field small {
  font-weight: 400;
  color: var(--ink-3);
}

.cd-field input,
.cd-field textarea {
  width: 100%;
  min-height: 48px;
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-2);
  background: var(--bg);
  color: var(--ink);
  /* 16px or more: iOS zooms into anything smaller. */
  font: inherit;
  font-size: max(1rem, var(--step-0));
  font-weight: 400;
  resize: vertical;
}

.cd-field input:focus-visible,
.cd-field textarea:focus-visible {
  outline: 3px solid var(--pop-ink);
  outline-offset: 1px;
}

.cd-field .cd-err {
  color: var(--pop-ink);
  font-weight: 700;
}

.cd-hp {
  position: absolute;
  left: -9999px;
}

.cd-send {
  width: 100%;
  font-size: var(--step-0);
}

.cd-status {
  margin: 0;
  font-weight: 700;
}

.cd-status:focus {
  outline: none;
}

.cd-done {
  display: flex;
  gap: var(--sp-2);
  align-items: flex-start;
  margin-top: var(--sp-3);
  color: var(--ink);
  font-weight: 700;
}

.cd-done:focus {
  outline: none;
}

.cd-done svg {
  flex: none;
  color: var(--pop-ink);
  margin-top: 0.15em;
}

.cd-done p {
  margin: 0;
}

/* ---- the code, full screen ---- */
.cd-qrdlg {
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: var(--sp-4);
  border: 0;
  background: transparent;
}

.cd-qrdlg[open] {
  display: grid;
  place-items: center;
}

.cd-qrdlg::backdrop {
  background: rgb(10 12 16 / 0.86);
  backdrop-filter: blur(6px);
}

.cd-qrbox {
  display: grid;
  justify-items: center;
  gap: var(--sp-3);
  width: min(100%, 24rem);
  padding: var(--sp-6) var(--sp-5) var(--sp-5);
  border-radius: 24px;
  /* Always paper: a code on a dark screen scans worse. */
  background: #fff;
  color: #14161d;
  animation: cd-pop 0.35s cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

@keyframes cd-pop {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
}

.cd-qrbox img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.cd-qrname {
  margin: 0;
  font-size: var(--step-1);
  font-weight: 800;
  text-align: center;
}

.cd-qrhint {
  margin: 0;
  color: #4c4f57;
}

.cd-qrclose {
  width: 100%;
  border-color: #c9c4bb;
  background: #f3efe8;
  color: #14161d;
}

.cd-qrclose:hover {
  background: #e9e4db;
}

@media (prefers-reduced-motion: reduce) {
  .cd-stage,
  .cd-flip,
  .cd-foil,
  .cd-qrbox {
    animation: none;
  }

  .cd-flip {
    transition-duration: 0.01s;
  }
}
</style>
