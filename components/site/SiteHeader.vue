<template>
  <!-- A bar floating over the room: name, three places to go, and the
       controls for the room itself (language, day/night). -->
  <header class="hd">
    <div class="hd-bar">
      <NuxtLink :to="t.home" class="hd-mark" :aria-label="t.name">
        <span class="hd-dot" aria-hidden="true" />
        <span class="hd-name">{{ t.name }}</span>
        <span v-if="t.short" class="hd-name-short" aria-hidden="true">{{ t.short }}</span>
      </NuxtLink>

      <nav :aria-label="t.navLabel" class="scroll-x hd-nav">
        <NuxtLink v-for="l in t.links" :key="l.href" :to="l.href" class="hd-link" :aria-label="l.short ? l.label : undefined" :class="{ 'is-here': here(l), 'hd-link--wide': l.wide }" v-bind="l.href.includes('#') ? { 'aria-current': current(l) } : {}">
          <template v-if="l.short"><span class="hd-link-full">{{ l.label }}</span><span class="hd-link-short" aria-hidden="true">{{ l.short }}</span></template>
          <template v-else>{{ l.label }}</template>
        </NuxtLink>
      </nav>

      <div class="hd-tools">
        <NuxtLink :to="t.altHref" class="hd-lang" :hreflang="t.altLang" :lang="t.altLang" @click="rememberLangScroll(t.altHref)">{{ t.altLabel }}</NuxtLink>
        <ThemeToggle />
        <NuxtLink :to="t.contact" class="hd-mail" :aria-label="t.mailLabel">
          <Mail :size="16" :stroke-width="2.2" aria-hidden="true" />
          <span class="hd-mail-text">{{ t.mail }}</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Mail } from 'lucide-vue-next'
import ThemeToggle from '~/components/site/ThemeToggle.vue'
import { rememberLangScroll } from '~/utils/langScroll'

const { locale, altPath } = useLocale()
// On an error page the same path in the other language is just another
// dead URL: the switch goes to that language's home instead.
const error = useError()
const alt = computed(() => (error.value ? (locale.value === 'en' ? '/' : '/en/') : altPath.value))
// The router's own route, not useRoute(): in this always-mounted header
// useRoute() hydrated /portfolio/ as some other path and dropped the mark.
const router = useRouter()
// Two ways a link is "where you are": on a sub-page of its section (作品 on
// /portfolio/ and /work/*), shown but not announced as the current page, since
// the link itself goes to the homepage list; or, on the homepage, the section
// now crossing the middle of the window.
const spy = ref('')
const isHome = () => /^\/(en\/)?$/.test(router.currentRoute.value.path)
// Not on an error page: a dead /en/work/… address is not the work section.
const sub = (l) => !error.value && !!l.section?.test(router.currentRoute.value.path)
const here = (l) => sub(l) || (isHome() && !!spy.value && l.href.endsWith('#' + spy.value))
const current = (l) => (isHome() && spy.value && l.href.endsWith('#' + spy.value) ? 'location' : undefined)
let io = null
const watchSections = () => {
  io?.disconnect(); io = null; spy.value = ''
  if (!isHome() || typeof IntersectionObserver === 'undefined') return
  const els = ['work', 'record'].map((id) => document.getElementById(id)).filter(Boolean)
  if (!els.length) return
  const seen = new Set()
  io = new IntersectionObserver((es) => {
    for (const e of es) e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)
    spy.value = ['record', 'work'].find((id) => seen.has(id)) ?? ''
  }, { rootMargin: '-50% 0px -50% 0px' })
  els.forEach((el) => io.observe(el))
}
onMounted(() => nextTick(watchSections))
watch(() => router.currentRoute.value.path, () => setTimeout(watchSections, 300))
onBeforeUnmount(() => io?.disconnect())

const t = computed(() =>
  locale.value === 'en'
    ? {
        home: '/en/',
        name: 'Ju-Shen Huang',
        short: 'J. Huang',
        navLabel: 'Main',
        links: [
          { href: '/en/#work', label: 'Work', section: /^\/en\/(portfolio|work)(\/|$)/ },
          { href: '/en/#record', label: 'Story', wide: true },
          { href: '/en/resume/', label: 'Résumé', short: 'CV' },
        ],
        altHref: alt.value,
        altLang: 'zh-Hant-TW',
        altLabel: '中文',
        mail: 'Contact',
        mailLabel: 'Contact: leave a message or email',
        contact: '/en/contact/',
      }
    : {
        home: '/',
        name: '黃鉅燊',
        navLabel: '主要導覽',
        links: [
          { href: '/#work', label: '作品', section: /^\/(portfolio|work)(\/|$)/ },
          { href: '/#record', label: '經歷', wide: true },
          { href: '/resume/', label: '履歷' },
        ],
        altHref: alt.value,
        altLang: 'en',
        altLabel: 'EN',
        mail: '聯絡',
        mailLabel: '聯絡我：留言或寫信',
        contact: '/contact/',
      }
)
</script>

<style scoped>
.hd {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: var(--sp-3) var(--sp-3) 0;
  pointer-events: none;
}

/* Text scrolling up fades out before it reaches the bar, instead of
   showing in the gap above it. */
.hd::before {
  content: '';
  position: absolute;
  inset: 0 0 -0.75rem;
  z-index: -1;
  background: linear-gradient(var(--bg) 55%, transparent);
}

.hd-bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  max-width: 72rem;
  height: calc(var(--header-h) - var(--sp-3));
  margin-inline: auto;
  padding-inline: var(--sp-5) 6px;
  border-radius: var(--r-full);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  transition: background-color var(--dur-3) var(--ease-inout);
}

.hd-mark {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-0);
  text-decoration: none;
  white-space: nowrap;
  min-height: 44px;
}

/* A lump of terracotta: the studio's one signature colour. */
.hd-dot {
  flex: none;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: var(--pop);
  box-shadow: inset -2px -2px 3px rgb(0 0 0 / 0.18), inset 2px 2px 3px rgb(255 255 255 / 0.35);
  transition: transform var(--dur-3) var(--ease-entrance);
}

.hd-name-short,
.hd-link-short {
  display: none;
}

.hd-mark:hover .hd-dot {
  transform: scale(1.25);
}

.hd-nav {
  display: flex;
  gap: var(--sp-5);
  margin-left: auto;
}

.hd-link,
.hd-lang {
  font-size: var(--step--1);
  font-weight: 600;
  text-decoration: none;
  color: var(--ink-2);
  white-space: nowrap;
  /* 44px tall hit area: thumbs miss 18px-tall text links. */
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}

.hd-lang {
  justify-content: center;
  min-width: 44px;
}

.hd-link:hover,
.hd-lang:hover,
.hd-link.router-link-exact-active:not([href*='#']),
/* 作品 links to the homepage's list; on the portfolio and the case pages it is where you are. */
.hd-link.is-here {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
  text-decoration-thickness: 2px;
}

.hd-tools {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.hd-mail {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding-inline: var(--sp-4);
  border-radius: var(--r-full);
  background: var(--pop);
  color: var(--on-pop);
  font-size: var(--step--1);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--dur-1), color var(--dur-1), transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}

.hd-mail:hover {
  background: var(--ink);
  color: var(--bg);
}

.hd-mail:active {
  transform: scale(0.97);
}

/* On the contact page itself the pill is where you are: outlined, like the
   other links' underline, instead of still asking to be pressed. */
.hd-mail.router-link-active {
  background: transparent;
  color: var(--pop-ink);
  box-shadow: inset 0 0 0 2px var(--pop);
}

/* Breakpoints in em, not px: they follow the reader's default text size, so at
   a 24 or 32px default the bar takes its compact form early instead of laying
   "Résumé" over "Contact". */
/* English between phone and desk (600-720px, or a 1280px window zoomed to
   200%): its three links need 53px more than the bar has, and "Résumé" was
   cut to "Résun". The contact pill keeps its envelope and its label. */
@media (min-width: 35.0625em) and (max-width: 47.5em) {
  :root[lang|='en'] .hd-mail-text {
    display: none;
  }
}

/* And below 620px "Résumé" takes its phone form, "CV". */
@media (min-width: 35.0625em) and (max-width: 38.75em) {
  :root[lang|='en'] .hd-link-full {
    display: none;
  }
  :root[lang|='en'] .hd-link-short {
    display: inline;
  }
}

@media (max-width: 35em) {
  .hd {
    padding-inline: var(--sp-2);
  }
  .hd-bar {
    gap: var(--sp-3);
    padding-left: var(--sp-4);
  }
  /* 16px between words: each link's hit area takes 6px of it, 4px is gap. */
  .hd-nav {
    gap: 4px;
  }
  /* The bar is 30-40px short of three links on a phone. The record is a
     section of the homepage and the whole of the résumé page, so it is the
     one to go; the work and the résumé stay. */
  .hd-link--wide {
    display: none;
  }
  /* Never squeezed below its word: the nav shrank each link to its 44px
     minimum, two pixels short of 「履歷」 with its padding, and clipped the
     last character (and left "CV" as "C"). */
  .hd-link {
    flex: none;
    justify-content: center;
    min-width: 44px;
    padding-inline: 5px;
  }
  .hd-tools {
    gap: var(--sp-1);
  }
  /* The Chinese name is three characters and fits; the English one is
     shortened rather than dropped, so the bar still says whose site this is. */
  .hd-mark:has(.hd-name-short) .hd-name,
  .hd-mail-text {
    display: none;
  }
  .hd-mark .hd-name-short {
    display: inline;
  }
  /* "J. Huang" a size smaller below 380px, so it fits beside the links at 360. */
  @media (max-width: 23.75em) {
    .hd-mark .hd-name-short {
      font-size: 0.76em;
    }
  }
  /* "Résumé" is the widest word in the bar; a phone gets the short form. */
  .hd-link-full {
    display: none;
  }
  .hd-link-short {
    display: inline;
  }
  .hd-mark {
    min-width: 44px;
    justify-content: center;
  }
  .hd-lang {
    min-width: 44px;
    justify-content: center;
  }
  .hd-mail {
    width: 44px;
    padding: 0;
    justify-content: center;
  }
}

/* The name (黃鉅燊, or "J. Huang") shows at every width: at 320px, with the
   day/night switch moved to the footer, it still clears the links by ~20px. */
/* 360-370px: the name costs the nav 3px, given back by tighter gaps. */
@media (max-width: 23.125em) {
  .hd-bar {
    gap: var(--sp-2);
    padding-left: var(--sp-3);
  }
}

/* A 320px phone cannot fit every control. Contact is what the site is for,
   and the name says whose site it is, so both stay; the day/night switch
   moves to the footer (SiteFooter). */
@media (max-width: 22.4375em) {
  .hd-tools :deep(.tg) {
    display: none;
  }
}

/* When the links run past the edge (narrow phones, large text), the cut end
   fades out instead of stopping on half a word (「履」 of 履歷 at 200% text):
   it reads as more to scroll to. The fade is driven by the nav's own scroll,
   so it is gone at the end, and without overflow there is none. */
@property --hd-fade {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}

@keyframes hd-fade {
  from {
    --hd-fade: 32px;
  }

  to {
    --hd-fade: 0px;
  }
}

@supports (animation-timeline: scroll()) {
  .hd-nav {
    mask-image: linear-gradient(to right, #000 calc(100% - var(--hd-fade)), transparent);
    animation: hd-fade linear both;
    animation-timeline: scroll(self inline);
  }

  /* The global reduced-motion rule shortens every animation; this one
     follows the scroll, not the clock. */
  @media (prefers-reduced-motion: reduce) {
    .hd-nav {
      animation-duration: auto !important;
    }
  }
}

/* Touch: each 40px control answers taps 2px further out on every side, 44px
   in all, without moving anything. The nav's 4px gaps are split between
   neighbours, so no two areas overlap. */
@media (pointer: coarse) {
  /* The nav scrolls sideways on the narrowest phones, which clips at its
     padding box: 2px of padding gives the links' outer edge room, and the
     negative margins keep every word where it was. */
  .hd-nav {
    padding: 2px;
    margin-block: -2px;
    margin-right: -2px;
  }
  .hd-mark,
  .hd-link,
  .hd-lang,
  .hd-mail,
  .hd-tools :deep(.tg) {
    position: relative;
  }
  .hd-mark::after,
  .hd-link::after,
  .hd-lang::after,
  .hd-mail::after,
  .hd-tools :deep(.tg)::after {
    content: '';
    position: absolute;
    inset: -2px;
  }
}
</style>
