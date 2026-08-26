<template>
  <section id="skills" class="shell">
    <h2 class="font-display text-2xl">能力斷面</h2>
    <p class="mt-3 max-w-measure-han text-sm text-ink-2">
      量尺不是熟練度，是證據層級。每一項都連得到一個可以點開的東西——
      連不到的，這一頁就不列。
    </p>

    <!-- The tier legend is the credibility mechanism, so it is stated up front
         rather than buried in a tooltip. -->
    <ul class="legend mt-6">
      <li v-for="t in tiers" :key="t.id" class="legend-item" :data-tier="t.id">
        <span class="dot" />
        {{ t.label }}
      </li>
    </ul>

    <div class="layers mt-8">
      <section v-for="l in grouped" :key="l.id" class="layer">
        <h3 class="layer-label mono text-2xs tracking-[0.16em] text-ink-3">
          {{ l.labelZh }} <span class="text-ink-3/60">{{ l.label }}</span>
        </h3>
        <ul class="layer-nodes flex flex-wrap gap-2">
          <li v-for="n in l.nodes" :key="n.name">
            <a
              v-if="isLink(n.evidence)"
              :href="n.evidence"
              :rel="external(n.evidence)"
              class="node"
              :data-tier="n.tier"
            >
              <span class="dot" />{{ n.name }}
            </a>
            <span v-else class="node" :data-tier="n.tier"><span class="dot" />{{ n.name }}</span>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script setup>
const { skills } = useContent()

/**
 * The five layers, in the order data actually travels through them. Kept here
 * rather than in a second YAML file: the old `layers.yml` duplicated this list
 * and the two drifted the moment a stack changed.
 */
const LAYERS = [
  { id: 'client', label: 'Client', labelZh: '前端' },
  { id: 'edge-api', label: 'API', labelZh: '後端' },
  { id: 'agents', label: 'AI', labelZh: '模型層' },
  { id: 'data', label: 'Data', labelZh: '資料' },
  { id: 'infra', label: 'Infra', labelZh: '基礎設施' },
]

const tiers = computed(() => [...skills.tiers].sort((a, b) => b.rank - a.rank))

const rankOf = Object.fromEntries(skills.tiers.map((t) => [t.id, t.rank]))

const grouped = computed(() =>
  LAYERS.map((l) => ({
    ...l,
    // The hard rule from the YAML header: no evidence, no render. It is what
    // makes the rest of the list worth reading.
    nodes: skills.nodes
      .filter((n) => n.layer === l.id && n.evidence)
      .sort((a, b) => (rankOf[b.tier] ?? 0) - (rankOf[a.tier] ?? 0)),
  })).filter((l) => l.nodes.length)
)

function isLink(e) {
  return typeof e === 'string' && e.length > 0
}

function external(e) {
  return e.startsWith('http') ? 'noopener' : undefined
}
</script>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-5);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--ink-2);
}

/* One row per layer: the label in a fixed column, the chips filling the rest.
   This was two columns of stacked blocks, which cannot be balanced - five
   groups of 189/189/189/141/189px split 2:3 any way you like and the shorter
   column still ends ~140px early, so a third of the right-hand side was
   empty. Rows have no such problem, they are denser, and the label column
   gives the section the same vertical rhythm the timeline has. */
.layers {
  display: grid;
  gap: 0;
}

.layer {
  display: grid;
  gap: var(--sp-2) var(--sp-6);
  padding-block: var(--sp-4);
  border-top: 1px solid var(--rule);
}

.layer:last-child {
  border-bottom: 1px solid var(--rule);
}

@media (min-width: 46rem) {
  .layer {
    /* Wide enough for 基礎設施 Infra, the longest label, on one line. */
    grid-template-columns: 9.5rem minmax(0, 1fr);
    align-items: start;
  }
}

.layer-label {
  /* Optically aligns the label with the first row of chips, which sit inside
     their own padding. */
  padding-top: 5px;
}

.node {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 4px 10px;
  border: 1px solid var(--rule);
  border-radius: var(--r-full);
  font-size: var(--step--2);
  color: var(--ink-2);
  text-decoration: none;
}

a.node:hover {
  color: var(--ink);
  border-color: var(--ink-2);
}

/* One shape, four fills. The tier is legible at a glance without a second
   colour system fighting the accent. */
.dot {
  width: 7px;
  height: 7px;
  border-radius: var(--r-full);
  border: 1px solid var(--ink-2);
  flex: none;
}

[data-tier='shipped-prod'] .dot {
  background: var(--pop);
  border-color: var(--pop);
}

[data-tier='shipped-competition'] .dot {
  background: var(--ink-2);
}

[data-tier='research-prototype'] .dot {
  background: linear-gradient(to right, var(--ink-2) 50%, transparent 50%);
}

[data-tier='studied'] .dot {
  background: transparent;
}
</style>
