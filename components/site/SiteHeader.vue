<template>
  <!-- A bar floating over the room: name, three places to go, and the
       controls for the room itself (language, day/night). -->
  <header class="hd">
    <div class="hd-bar">
      <NuxtLink :to="t.home" class="hd-mark" :aria-label="t.name">
        <span class="hd-dot" aria-hidden="true" />
        <span>{{ t.name }}</span>
      </NuxtLink>

      <nav :aria-label="t.navLabel" class="scroll-x hd-nav">
        <NuxtLink v-for="l in t.links" :key="l.href" :to="l.href" class="hd-link">{{ l.label }}</NuxtLink>
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

const t = computed(() =>
  locale.value === 'en'
    ? {
        home: '/en/',
        name: 'Ju-Shen Huang',
        navLabel: 'Main',
        links: [
          { href: '/en/#work', label: 'Work' },
          { href: '/en/#record', label: 'Record' },
          { href: '/en/resume/', label: 'Résumé' },
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
          { href: '/#work', label: '作品' },
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
  min-height: 40px;
}

/* A lump of terracotta: the studio's one signature colour. */
.hd-dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: var(--pop);
  box-shadow: inset -2px -2px 3px rgb(0 0 0 / 0.18), inset 2px 2px 3px rgb(255 255 255 / 0.35);
  transition: transform var(--dur-3) var(--ease-entrance);
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
  /* 40px tall hit area: thumbs miss 18px-tall text links. */
  display: inline-flex;
  align-items: center;
  min-height: 40px;
}

.hd-link:hover,
.hd-lang:hover,
.hd-link.router-link-exact-active:not([href*='#']) {
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
  height: 40px;
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
  .hd-nav {
    gap: var(--sp-3);
  }
  .hd-tools {
    gap: var(--sp-1);
  }
  /* The Chinese name is three characters and fits; the English one does
     not, and leaves the dot standing in for it. */
  .hd-mark span:last-child:lang(en),
  .hd-mail-text {
    display: none;
  }
  .hd-mark {
    min-width: 40px;
    justify-content: center;
  }
  .hd-lang {
    min-width: 40px;
    justify-content: center;
  }
  .hd-mail {
    width: 40px;
    padding: 0;
    justify-content: center;
  }
}

@media (max-width: 370px) {
  .hd-mark span:last-child {
    display: none;
  }
}
</style>
