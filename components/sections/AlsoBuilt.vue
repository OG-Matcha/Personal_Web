<template>
  <!-- Contact sheet: the smaller jobs, printed small, many to a sheet. -->
  <ol class="ab">
    <li v-for="p in ordered" :key="p.name" class="ab-item">
      <component :is="p.repo ? 'a' : 'div'" :href="p.repo || undefined" v-bind="linkAttrs(p.repo)" class="ab-link">
        <div class="ab-media">
          <SiteShot v-if="p.thumbnail" :src="p.thumbnail" :fit="p.thumbFit ?? 'cover'" :focus="p.thumbFocus ?? 'center'" sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw" width="600" height="375" />
          <span v-else class="ab-blank">{{ p.stack?.[0] }}</span>
        </div>
        <div class="ab-head">
          <span class="ab-year figures">{{ p.year }}</span>
          <h3 class="ab-name">{{ p.name }}</h3>
        </div>
        <p v-if="p.award" class="ab-award">{{ p.award }}</p>
        <p class="ab-line">{{ p.line }}</p>
      </component>
    </li>
  </ol>
</template>

<script setup>
const { alsoBuilt, en } = useContent()
const { locale } = useLocale()

// Newest first, the same direction the record runs. Ties keep file order.
const ordered = computed(() =>
  [...alsoBuilt]
    .map((p) => (locale.value === 'en' ? { ...p, ...(en.alsoBuilt?.[p.name] ?? {}) } : p))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
)
</script>

<style scoped>
.ab {
  display: grid;
  gap: var(--sp-7) var(--sp-6);
  margin-top: var(--sp-7);
}

@media (min-width: 640px) {
  .ab {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .ab {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.ab-link {
  display: block;
  text-decoration: none;
}

.ab-media {
  aspect-ratio: 16 / 10;
  border: 1px solid var(--rule);
  overflow: hidden;
  background: var(--surface);
}

.ab-media .shot {
  transition:
    transform var(--dur-3) var(--ease-entrance),
    filter var(--dur-3) var(--ease-entrance);
}

a.ab-link:hover .ab-media .shot {
  transform: scale(1.03);
}

/* White screenshots glare on the night page; turn them down until pointed at. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .ab-media .shot {
    filter: brightness(0.86);
  }
}
:root[data-theme='dark'] .ab-media .shot {
  filter: brightness(0.86);
}
:root .ab-link:hover .ab-media .shot,
:root .ab-link:focus-visible .ab-media .shot {
  filter: none;
}

.ab-blank {
  display: grid;
  place-items: center;
  height: 100%;
  font-weight: 700;
  color: var(--ink-3);
}

.ab-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: var(--sp-3);
}

.ab-name {
  min-width: 0;
  font-size: var(--step-1);
  font-weight: 700;
}

a.ab-link:hover .ab-name {
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
}

.ab-year {
  flex: none;
  font-size: var(--step--1);
  color: var(--ink-3);
}

.ab-award {
  margin-top: var(--sp-1);
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--pop-ink);
}

.ab-line {
  margin-top: var(--sp-1);
  font-size: var(--step-0);
  color: var(--ink-2);
}
</style>
