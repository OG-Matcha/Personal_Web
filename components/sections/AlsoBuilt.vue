<template>
  <section class="shell pt-section">
    <h2 class="font-display text-3xl">也做過</h2>

    <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <component
        :is="p.repo ? 'a' : 'div'"
        v-for="p in alsoBuilt"
        :key="p.name"
        :href="p.repo || undefined"
        :rel="p.repo ? 'noopener' : undefined"
        class="tile"
      >
        <div v-if="p.thumbnail" class="tile-media">
          <img :src="p.thumbnail" :alt="p.name" width="600" height="338" loading="lazy" />
        </div>
        <div v-else class="tile-media tile-media--blank">
          <span class="mono text-2xs">{{ p.stack[0] }}</span>
        </div>

        <div class="tile-body">
          <!-- The year must never be the thing that gives way. Without
               shrink-0 a long title squeezed it until "2024" wrapped to
               "202" / "4", which reads as corrupt data rather than a layout
               that ran out of room. -->
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="min-w-0 font-display text-lg">{{ p.name }}</h3>
            <span class="mono shrink-0 text-2xs tabular-nums text-ink-2">{{ p.year }}</span>
          </div>
          <p v-if="p.award" class="mt-1 mono text-2xs text-pop-ink">{{ p.award }}</p>
          <p class="mt-2 text-2xs text-ink-2">{{ p.line }}</p>
        </div>
      </component>
    </div>
  </section>
</template>

<script setup>
const { alsoBuilt } = useContent()
</script>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--rule);
  border-radius: var(--r-1);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color var(--dur-1), transform var(--dur-1) var(--ease-entrance);
}

a.tile:hover {
  border-color: var(--ink);
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  a.tile:hover {
    transform: none;
  }
}

.tile-media {
  aspect-ratio: 16 / 9;
  border-bottom: 1px solid var(--rule);
  overflow: hidden;
}

.tile-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.tile-media--blank {
  display: grid;
  place-items: center;
  background: var(--surface);
  color: var(--ink-2);
}

.tile-body {
  padding: var(--sp-4);
}
</style>
