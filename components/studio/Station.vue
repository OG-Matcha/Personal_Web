<template>
  <!--
    A section card: a titled panel on the room. Used below the device stage
    on the homepage and as the body of /portfolio and /resume.
  -->
  <section
    :id="id"
    class="st"
    :class="[`st--${side}`, { 'st--wide': wide }]"
    :aria-labelledby="title ? `${id}-title` : undefined"
  >
    <div class="shell st-row">
      <div class="st-card">
        <header v-if="title || $slots.meta" class="st-head">
          <component :is="headingTag" v-if="title" :id="`${id}-title`" class="st-title">{{ title }}</component>
          <p v-if="lede" class="st-lede">{{ lede }}</p>
          <div v-if="$slots.meta" class="st-meta">
            <slot name="meta" />
          </div>
        </header>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  lede: { type: String, default: '' },
  headingTag: { type: String, default: 'h2' },
  /** Which side of the room the card stands on; the plinth shows on the other. */
  side: { type: String, default: 'left' },
  /** Long content (the record, the index): the card takes the full width. */
  wide: { type: Boolean, default: false },
})
</script>

<style scoped>
.st {
  position: relative;
  z-index: 1;
  padding-block: var(--sp-6);
}

.st-row {
  display: flex;
}

.st-card {
  width: 100%;
  margin-inline: auto;
  padding: clamp(var(--sp-5), 3.5vw, var(--sp-8));
  background: var(--surface);
  border-radius: var(--r-3);
  box-shadow: var(--shadow-2);
  transition: background-color var(--dur-3) var(--ease-inout);
}

.st-head {
  margin-bottom: var(--sp-6);
}

.st-title {
  font-size: var(--step-4);
  font-weight: 800;
}

.st-lede {
  margin-top: var(--sp-4);
  max-width: var(--measure-han);
  color: var(--ink-2);
  font-size: var(--step-1);
}

.st-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-3) var(--sp-6);
  margin-top: var(--sp-5);
  font-size: var(--step--1);
  color: var(--ink-3);
}

</style>
