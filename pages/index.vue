<template>
  <div>
    <!-- The page shipped with no h1 at all: its first heading was a beat's
         rhetorical question, so the only machine-readable statement of whose
         site this is lived in a meta tag. Outside FilmGate on purpose - that
         component is removed from the DOM once the gate lifts. -->
    <h1 class="sr-only">{{ about.intro }}</h1>

    <!-- Held over everything until the film can actually run. Lifts on the
         first drawn frame, and on a hard cap regardless. -->
    <FilmGate />

    <CinemaStage />

    <!-- Five beats, five convergence points in the real timeline. Everything
         about them - id, dates, scroll height, which side the copy sits on -
         comes from composables/useFilm.ts, which reads content/timeline.yml.
         Adding an entry to the YAML changes the film. -->
    <BeatSection
      v-for="(b, i) in beats"
      :id="b.id"
      :key="b.id"
      :index="i"
      :span="spans[i]"
    >
      <BeatEvents
        :id="b.id"
        :index="i"
        :total="beats.length"
        :from="b.from"
        :to="b.to"
      />
    </BeatSection>

    <!-- After the film ends, the record. Ordinary page, ordinary scrolling. -->
    <div class="ledger">
      <NowSection />
      <!-- Straight after "who was that": what he shipped. This is the entry
           point to the case studies; before it existed the only way in was a
           link buried in a timeline row. -->
      <div class="pt-section">
        <CaseStudies />
      </div>
      <div class="pt-section">
        <SkillsSection />
      </div>
      <div class="pt-section">
        <AlsoBuilt />
      </div>
      <div class="pt-section">
        <LedgerSection heading="完整年表" :fold-years="2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import FilmGate from '~/components/cinema/FilmGate.vue'
import CinemaStage from '~/components/cinema/CinemaStage.vue'
import BeatSection from '~/components/cinema/BeatSection.vue'
import BeatEvents from '~/components/cinema/BeatEvents.vue'
import NowSection from '~/components/sections/NowSection.vue'
import CaseStudies from '~/components/sections/CaseStudies.vue'
import SkillsSection from '~/components/sections/SkillsSection.vue'
import AlsoBuilt from '~/components/sections/AlsoBuilt.vue'
import LedgerSection from '~/components/sections/LedgerSection.vue'
import { beatSpans, beatWindows } from '~/composables/useFilm'

const { about, site } = useContent()

const beats = beatWindows()
// Scroll distance per beat is derived from the same windows, so the copy and
// the camera can never disagree about where a beat starts.
const spans = beatSpans()

// The homepage used to fall through to nuxt.config's DESCRIPTION, which meant
// the award counts lived in a string nobody checks against the timeline.
const DESC = `${about.intro}把 LLM 放進會出貨的系統裡：財伴 oSave、PhishForge、診所營運系統。${site.counts.awards} 項競賽獎項含 ${site.counts.topPrizes} 座全國首獎，${site.counts.researchGrants} 個國科會研究計畫。`

useSeoMeta({
  description: DESC,
  ogDescription: DESC,
  twitterDescription: DESC,
})
useHead({
  link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com/' }],
  // Names the person as this page's subject rather than merely a topic of it,
  // which is the question an answer engine asks first.
  script: [
    jsonLdScript(
      pageNode({
        type: 'ProfilePage',
        url: 'https://www.ogmatcha.com/',
        name: `${site.person.nameZh} ${site.person.nameEn}`,
        dateModified: site.asOf,
        primary: true,
      })
    ),
  ],
})
</script>

<style scoped>
/* The ledger is read, not flown through, so it gets a solid ground to sit on
   rather than floating over the world. */
.ledger {
  position: relative;
  z-index: 1;
  background: var(--bg);
  padding-top: var(--sp-8);
}
</style>
