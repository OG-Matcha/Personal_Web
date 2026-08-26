<template>
  <header class="site-header" :data-live="inFilm ? 'on' : 'off'">
    <div class="shell flex items-center gap-4 py-3">
      <NuxtLink to="/" class="font-display text-lg no-underline">黃鉅燊</NuxtLink>

      <!-- On the homepage the nav stops being a list of pages and becomes a
           status line: where the film is, what year that is, how far in. The
           numbers move because the reader is moving them. -->
      <p v-if="inFilm" class="hud mono ml-auto" aria-hidden="true">
        <span class="hud-id">SYS//{{ pad(beat + 1) }}</span>
        <span class="hud-name">{{ current.hud ?? current.title }}</span>
        <span class="hud-year">{{ year }}</span>
        <span class="hud-bar"><span class="hud-fill" :style="{ width: `${pct}%` }" /></span>
        <span class="hud-pct">{{ pct }}%</span>
      </p>

      <nav v-else aria-label="主要導覽" class="ml-auto hidden items-center gap-6 md:flex">
        <a v-for="l in links" :key="l.href" :href="l.href" class="nav-link">{{ l.label }}</a>
      </nav>

    </div>
  </header>
</template>

<script setup>
import { useCinema } from '~/composables/useCinema'
import { beatWindows } from '~/composables/useFilm'

const { progress, beat, live, onscreen } = useCinema()

/**
 * The status line belongs to the film. Past it the reader is in the written
 * record, and a bar still reading "SYS//05 100%" is annotating a section it
 * has nothing to do with - so the ordinary nav comes back.
 */
const inFilm = computed(() => live.value && onscreen.value)
const { beatCopy } = useContent()

const windows = beatWindows()

/**
 * Every one of these points at an element that exists. The first version had a
 * tab labelled "2025" pointing at a beat id, which read as a stray year in a
 * row of nouns and landed somewhere the reader had no reason to expect.
 */
const links = [
  { href: '/#work', label: '作品' },
  { href: '/#now-section', label: '現在' },
  { href: '/#skills', label: '能力' },
  { href: '/#ledger', label: '年表' },
]

const current = computed(() => {
  const w = windows[Math.min(windows.length - 1, Math.max(0, beat.value))]
  return beatCopy.find((b) => b.id === w.id) ?? { title: w.id }
})

/** The year under the lens, interpolated across the beat rather than snapped. */
const year = computed(() => {
  const w = windows[Math.min(windows.length - 1, Math.max(0, beat.value))]
  const t = Math.min(1, Math.max(0, (progress.value - w.spanStart) / 0.2))
  return t < 0.5 ? w.from.slice(0, 4) : w.to.slice(0, 4)
})

const pct = computed(() => Math.round(progress.value * 100))

function pad(n) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--rule);
  background: color-mix(in oklab, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px);
}

/* Live, the bar is over a moving field, so it needs to be more opaque than a
   header over paper does. */
.site-header[data-live='on'] {
  background: color-mix(in oklab, var(--bg) 94%, transparent);
}

.hud {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin-left: auto;
  font-size: var(--step--2);
  letter-spacing: 0.14em;
  color: var(--ink-3);
  /* Tabular figures: the percentage counts up while the reader scrolls, and
     proportional digits make the whole line jitter. */
  font-variant-numeric: tabular-nums;
}

.hud-id {
  color: var(--pop-ink);
}

.hud-name {
  color: var(--ink);
  letter-spacing: 0.08em;
}

.hud-bar {
  position: relative;
  display: block;
  width: 7rem;
  height: 2px;
  background: var(--rule);
}

.hud-fill {
  position: absolute;
  inset: 0 auto 0 0;
  display: block;
  background: var(--pop);
}

.hud-pct {
  min-width: 2.6em;
  text-align: right;
}

/* Below the point where the HUD would crowd the name, drop the ornamental
   halves and keep the two that carry information. */
@media (max-width: 60rem) {
  .hud-name,
  .hud-bar {
    display: none;
  }
}

.nav-link {
  font-size: var(--step--1);
  color: var(--ink-2);
  text-decoration: none;
  transition: color var(--dur-1);
}

.nav-link:hover {
  color: var(--ink);
}
</style>
