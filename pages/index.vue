<template>
  <div>
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
      <div class="pt-section">
        <SkillsSection />
      </div>
      <div class="pt-section">
        <AlsoBuilt />
      </div>
      <div class="pt-section">
        <LedgerSection heading="完整年表" />
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
import SkillsSection from '~/components/sections/SkillsSection.vue'
import AlsoBuilt from '~/components/sections/AlsoBuilt.vue'
import LedgerSection from '~/components/sections/LedgerSection.vue'
import { beatSpans, beatWindows } from '~/composables/useFilm'

const beats = beatWindows()
// Scroll distance per beat is derived from the same windows, so the copy and
// the camera can never disagree about where a beat starts.
const spans = beatSpans()

useHead({ link: [{ rel: 'canonical', href: 'https://www.ogmatcha.com' }] })
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
