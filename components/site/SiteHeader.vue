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
        <NuxtLink v-for="l in t.links" :key="l.href" :to="l.href" class="hd-link" :aria-label="l.short ? l.label : undefined" :class="{ 'is-here': here(l) }" v-bind="l.href.includes('#') ? { 'aria-current': here(l) ? 'page' : false } : {}">
          <template v-if="l.short"><span class="hd-link-full">{{ l.label }}</span><span class="hd-link-short" aria-hidden="true">{{ l.short }}</span></template>
          <template v-else>{{ l.label }}</template>
        </NuxtLink>
      </nav>

      <div class="hd-tools">
        <NuxtLink :to="t.altHref" class="hd-lang" :hreflang="t.altLang" :lang="t.altLang">{{ t.altLabel }}</NuxtLink>
        <ThemeToggle />
        <a :href="`mailto:${site.contact.email}`" class="hd-mail" :aria-label="`${t.mail} ${site.contact.email}`">
          <Mail :size="16" :stroke-width="2.2" aria-hidden="true" />
          <span class="hd-mail-text">{{ t.mail }}</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Mail } from 'lucide-vue-next'
import ThemeToggle from '~/components/site/ThemeToggle.vue'

const { locale, altPath } = useLocale()
const { site } = useContent()
// The router's own route, not useRoute(): in this always-mounted header
// useRoute() hydrated /portfolio/ as some other path and dropped the mark.
const router = useRouter()
const here = (l) => !!l.section?.test(router.currentRoute.value.path)

const t = computed(() =>
  locale.value === 'en'
    ? {
        home: '/en/',
        name: 'Ju-Shen Huang',
        short: 'J. Huang',
        navLabel: 'Main',
        links: [
          { href: '/en/#work', label: 'Work', section: /^\/en\/(portfolio|work)\// },
          { href: '/en/#record', label: 'Record' },
          { href: '/en/resume/', label: 'Résumé', short: 'CV' },
        ],
        altHref: altPath.value,
        altLang: 'zh-Hant-TW',
        altLabel: '中文',
        mail: 'Email',
      }
    : {
        home: '/',
        name: '黃鉅燊',
        navLabel: '主要導覽',
        links: [
          { href: '/#work', label: '作品', section: /^\/(portfolio|work)\// },
          { href: '/#record', label: '年表' },
          { href: '/resume/', label: '履歷' },
        ],
        altHref: altPath.value,
        altLang: 'en',
        altLabel: 'EN',
        mail: '寫信',
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
  transition: background-color var(--dur-1), color var(--dur-1);
}

.hd-mail:hover {
  background: var(--ink);
  color: var(--bg);
}

@media (max-width: 560px) {
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
  .hd-link {
    justify-content: center;
    min-width: 44px;
    padding-inline: 6px;
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

@media (max-width: 370px) {
  .hd-mark .hd-name {
    display: none;
  }
}

/* A 320px phone cannot fit every control: the address stays in the footer
   and on the résumé, so the mail button goes before the links are clipped. */
@media (max-width: 359px) {
  .hd-mail {
    display: none;
  }
}

/* Below this the shortened English name crowds the links; the dot stays. */
@media (max-width: 380px) {
  .hd-mark .hd-name-short {
    display: none;
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
