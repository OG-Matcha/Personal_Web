<template>
  <!--
    Evidence, not proficiency. Each tier prints as an ink density - solid,
    75 %, 50 %, outline - the same ramp as the colour bar in the slug, so the
    legend is something a printer would read without being told.
  -->
  <div class="sk">
    <ul class="legend">
      <li v-for="t in tiers" :key="t.id" class="legend-item" :data-tier="t.id">
        <span class="dot" />
        {{ tierLabel(t) }}
      </li>
    </ul>

    <div class="layers">
      <section v-for="l in grouped" :key="l.id" class="layer">
        <h3 class="layer-label">{{ en ? l.label : l.labelZh }}</h3>
        <ul class="layer-nodes">
          <li v-for="n in l.nodes" :key="n.name">
            <a
              v-if="isLink(n.evidence)"
              :href="href(n.evidence)"
              v-bind="linkAttrs(n.evidence)"
              class="node"
              :data-tier="n.tier"
            >
              <span class="dot" /><span class="sr-only">{{ tierLabel({ id: n.tier, label: labelOf[n.tier] }) }}{{ en ? ': ' : '：' }}</span>{{ (en && n.name_en) || n.name }}
            </a>
            <span v-else class="node" :data-tier="n.tier">
              <span class="dot" /><span class="sr-only">{{ tierLabel({ id: n.tier, label: labelOf[n.tier] }) }}{{ en ? ': ' : '：' }}</span>{{ (en && n.name_en) || n.name }}
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
const { skills } = useContent()
const { locale } = useLocale()
const en = computed(() => locale.value === 'en')
const TIER_EN = {
  'shipped-prod': 'In production',
  'shipped-competition': 'Shipped for competition',
  'research-prototype': 'Research prototype',
  studied: 'Studied',
}
function tierLabel(t) {
  return en.value ? TIER_EN[t.id] ?? t.label : t.label
}

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

// Only the tiers something is in: the legend listed 研究原型 with nothing marked so.
const used = new Set(skills.nodes.filter((n) => n.evidence).map((n) => n.tier))
const tiers = computed(() => [...skills.tiers].filter((t) => used.has(t.id)).sort((a, b) => b.rank - a.rank))

const rankOf = Object.fromEntries(skills.tiers.map((t) => [t.id, t.rank]))

/**
 * The section's whole claim is 量尺不是熟練度，是證據層級 - and the tier was
 * carried only by `data-tier` and the colour of an empty <span class="dot" />.
 * Extracted as text the list was 51 undifferentiated technology names, and for
 * a sighted reader it was colour-only, which is a WCAG 1.4.1 failure.
 */
const labelOf = Object.fromEntries(skills.tiers.map((t) => [t.id, t.label]))

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

// Site-internal evidence follows the reader's language.
function href(e) {
  return en.value && e.startsWith('/') && !e.startsWith('/en/') ? `/en${e}` : e
}

function isLink(e) {
  return typeof e === 'string' && e.length > 0
}

</script>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-6);
  margin-top: var(--sp-6);
  font-size: var(--step--1);
  color: var(--ink-2);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.layers {
  display: grid;
  margin-top: var(--sp-6);
  border-top: 1px solid var(--rule);
}

.layer {
  display: grid;
  gap: var(--sp-2) var(--sp-6);
  padding-block: var(--sp-4);
  border-bottom: 1px solid var(--rule);
}

@media (min-width: 46rem) {
  .layer {
    grid-template-columns: 8rem minmax(0, 1fr);
    align-items: start;
  }
}

.layer-label {
  padding-top: 5px;
  font-size: var(--step--1);
  font-weight: 700;
}

.layer-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.node {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 3px 10px;
  border: 1px solid var(--rule);
  font-size: var(--step--1);
  color: var(--ink-2);
  text-decoration: none;
  transition: border-color var(--dur-1), color var(--dur-1);
}

a.node:hover {
  color: var(--ink);
  border-color: var(--ink);
}

/* Four densities of one ink. */
.dot {
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid var(--ink);
  flex: none;
}

[data-tier='shipped-prod'] .dot {
  background: var(--ink);
}

/* Half filled, not 70% ink: at 10px the two filled squares read as one. */
[data-tier='shipped-competition'] .dot {
  background: linear-gradient(135deg, var(--ink) 50%, transparent 50%);
}

[data-tier='research-prototype'] .dot {
  background: repeating-linear-gradient(45deg, var(--ink) 0 1.5px, transparent 1.5px 3.5px);
}

[data-tier='studied'] .dot {
  background: transparent;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
