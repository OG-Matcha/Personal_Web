<template>
  <section id="work" class="shell">
    <h2 class="font-display text-3xl">交付紀錄</h2>
    <p class="mt-3 max-w-measure-han text-base text-ink-2">
      四件寫成案例研究的東西。每一件都有它當時的決策、沒選的選項，以及那個選擇的代價。
    </p>

    <!-- Lead project runs full width with the largest image on the page. The
         two that follow sit side by side, so the section has rhythm rather
         than three identical rows. -->
    <NuxtLink v-if="lead" :to="`/work/${lead.slug}/`" class="lead group mt-7">
      <img
        :src="lead.cover"
        :alt="lead.title"
        width="1600"
        height="800"
        loading="lazy"
        class="aspect-[16/9] w-full rounded-sm object-cover object-top md:aspect-[21/9]"
      />
      <div class="mt-5 grid gap-4 md:grid-cols-12">
        <div class="md:col-span-7">
          <h3 class="font-display text-2xl group-hover:underline">{{ lead.title }}</h3>
          <p class="mt-2 max-w-measure-han text-base text-ink-2">{{ lead.summary }}</p>
        </div>
        <dl class="grid grid-cols-2 gap-4 md:col-span-5">
          <div v-for="r in facts(lead)" :key="r.metric">
            <dt class="mono text-2xs text-ink-2">{{ r.metric }}</dt>
            <dd class="mt-1 font-display text-lg">{{ r.value }}</dd>
          </div>
        </dl>
      </div>
    </NuxtLink>

    <div class="mt-8 grid gap-7 md:grid-cols-3">
      <NuxtLink v-for="w in others" :key="w.slug" :to="`/work/${w.slug}/`" class="group">
        <img
          v-if="w.cover"
          :src="w.cover"
          :alt="w.title"
          width="1200"
          height="675"
          loading="lazy"
          class="aspect-[16/9] w-full rounded-sm object-cover object-top"
        />
        <!-- A case study with no cover leads with its hardest number instead
             of a grey box. Finctory is a company, not a screen. -->
        <div v-else class="no-cover flex aspect-[16/9] w-full flex-col justify-end rounded-sm p-5">
          <p class="font-display text-2xl" :style="{ color: 'var(--on-pop)' }">
            {{ facts(w)[0]?.value }}
          </p>
          <p class="mono text-2xs" :style="{ color: 'var(--on-pop)', opacity: 0.72 }">
            {{ facts(w)[0]?.metric }}
          </p>
        </div>

        <h3 class="mt-4 font-display text-xl group-hover:underline">{{ w.title }}</h3>
        <p class="mt-2 text-2xs text-ink-2">{{ w.summary }}</p>
        <ul class="mt-3 flex flex-wrap gap-2">
          <li v-for="t in stack(w).slice(0, 4)" :key="t" class="chip">{{ t }}</li>
        </ul>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
/**
 * The four case studies, as cards.
 *
 * These used to live only on /portfolio, and nothing on the site linked to
 * that page - the header's 作品 tab pointed at a beat inside the film. So the
 * only way to reach a case study was to scroll nine screens of film, then the
 * whole timeline, and notice that one of the ledger rows was a link. This
 * section is the entry point that was missing; /portfolio now renders it too.
 */
const { works } = useContent()

const lead = works.find((w) => w.cover) ?? works[0]
const others = works.filter((w) => w.slug !== lead?.slug)

function stack(w) {
  return Object.values(w.stack ?? {}).flat()
}

/** Only filled-in, short values reach a card. */
function facts(w) {
  return (w.results ?? [])
    .filter((r) => r.value && !String(r.value).startsWith('TODO') && String(r.value).length <= 20)
    .slice(0, 2)
}
</script>

<style scoped>
.lead {
  display: block;
  text-decoration: none;
}

.no-cover {
  background: var(--pop);
}
</style>
