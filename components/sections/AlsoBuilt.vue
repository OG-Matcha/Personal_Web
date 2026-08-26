<template>
  <section class="shell pt-section">
    <h2 class="font-display text-3xl">也做過</h2>

    <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <component
        :is="p.repo ? 'a' : 'div'"
        v-for="p in ordered"
        :key="p.name"
        :href="p.repo || undefined"
        v-bind="linkAttrs(p.repo)"
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
/**
 * Newest first, same direction the timeline runs.
 *
 * The YAML is grouped by how the entries were written rather than by date, so
 * the 2026 one sat at the bottom under four 2024s. Sorting here rather than
 * reordering the file keeps display order a display decision - adding an entry
 * should not mean finding the right line to put it on.
 *
 * `sort` mutates, so this copies first; entries sharing a year keep the order
 * they have in the file, which is the author's.
 */
const { alsoBuilt } = useContent()

const ordered = computed(() => [...alsoBuilt].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)))
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
