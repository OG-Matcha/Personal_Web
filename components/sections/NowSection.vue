<template>
  <section id="now-section" class="shell">
    <!-- The film has just spent nine screens on four years. This is the first
         thing after it, and it answers the two questions the film leaves open:
         who was that, and what is he doing right now. -->
    <div class="intro">
      <div class="intro-copy">
        <p class="thesis font-display">{{ about.thesis }}</p>
        <p v-if="about.thesisSub" class="mt-4 max-w-measure-han font-display text-xl text-ink-2">
          {{ about.thesisSub }}
        </p>

        <p v-if="about.lede" class="mt-7 max-w-measure-han text-base text-ink-2">
          {{ about.lede }}
        </p>

        <ul class="socials mt-7">
          <li v-for="l in socials" :key="l.href">
            <a :href="l.href" class="social" rel="me noopener">
              <component :is="l.icon" :size="16" :stroke-width="1.75" aria-hidden="true" />
              {{ l.label }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Edges dissolved into the page rather than cropped to a hard box: the
           source has a near-white studio background, and a bright rectangle on
           this ground reads as a sticker rather than as part of the page. -->
      <figure class="portrait">
        <!-- The mask lives on the wrapper, not on the <img>. A filter on an
             element establishes a containing block that the element's own mask
             is composited inside, so the two cancel out and the crop comes
             back as a hard rectangle. -->
        <span class="portrait-frame">
          <img
            src="/images/portrait.jpg"
            alt="黃鉅燊"
            width="880"
            height="1100"
            loading="lazy"
            decoding="async"
          />
        </span>
        <figcaption class="mono">
          {{ site.person.nameZh }} <span class="text-ink-3">{{ site.person.nameEn }}</span>
        </figcaption>
      </figure>
    </div>

    <h2 class="mt-10 font-display text-2xl">{{ about.postsHeading }}</h2>

    <ol class="posts mt-6">
      <li v-for="p in about.posts" :key="p.org" class="post">
        <header>
          <p class="mono text-2xs tracking-[0.16em] text-ink-3">
            {{ formatDate(p.since) }} —
            <span v-if="p.ongoing">現在</span>
          </p>
          <h3 class="mt-2 font-display text-xl">
            <a v-if="p.url" :href="p.url" rel="noopener" class="org-link">{{ p.org }}</a>
            <span v-else>{{ p.org }}</span>
          </h3>
          <p class="mt-1 text-sm text-ink-2">{{ p.role }}</p>
        </header>

        <p class="mt-4 text-sm text-ink-2">{{ p.scope }}</p>

        <ul class="mt-4 flex flex-col gap-1">
          <li v-for="f in p.facts" :key="f" class="fact mono">{{ f }}</li>
        </ul>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { Github, Linkedin, Instagram, Mail } from 'lucide-vue-next'

const { about, site } = useContent()

const socials = [
  { label: 'GitHub', href: site.contact.github, icon: Github },
  { label: 'LinkedIn', href: site.contact.linkedin, icon: Linkedin },
  { label: 'Instagram', href: site.contact.instagram, icon: Instagram },
  { label: site.contact.email, href: `mailto:${site.contact.email}`, icon: Mail },
].filter((l) => l.href)
</script>

<style scoped>
/* Capped below the display scale's top step: at 5xl this line breaks into
   three and the portrait ends up floating beside a wall of type. */
.thesis {
  font-size: clamp(2.25rem, 3.4vw, 3.25rem);
  line-height: 1.12;
}

.intro {
  display: grid;
  gap: var(--sp-7);
}

@media (min-width: 60rem) {
  .intro {
    grid-template-columns: minmax(0, 1fr) 15rem;
    gap: var(--sp-8);
    align-items: start;
  }
}

.portrait {
  position: relative;
  max-width: 15rem;
}

.portrait-frame {
  display: block;
  /* The studio background is near-white; on this ground a hard-edged bright
     rectangle reads as a sticker. Dissolve it instead. */
  -webkit-mask-image: radial-gradient(
    82% 66% at 50% 40%,
    #000 30%,
    rgb(0 0 0 / 0.45) 62%,
    transparent 85%
  );
  mask-image: radial-gradient(
    82% 66% at 50% 40%,
    #000 30%,
    rgb(0 0 0 / 0.45) 62%,
    transparent 85%
  );
}

.portrait img {
  width: 100%;
  height: auto;
  display: block;
  /* Cool monochrome so the portrait sits in the same palette as the rest of
     the page, and dark enough that the paper does not out-shout the type. */
  filter: grayscale(1) contrast(1.08) brightness(0.62);
}

.portrait figcaption {
  margin-top: calc(var(--sp-6) * -1);
  font-size: var(--step--2);
  letter-spacing: 0.1em;
  color: var(--ink-2);
}

.socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3) var(--sp-5);
}

.social {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 32px;
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--ink-2);
  text-decoration: none;
}

.social:hover {
  color: var(--ink);
}

.posts {
  display: grid;
  gap: var(--sp-7);
}

@media (min-width: 52rem) {
  /* Capped below the display scale's top step: at 5xl this line breaks into
   three and the portrait ends up floating beside a wall of type. */
.thesis {
  font-size: clamp(2.25rem, 3.4vw, 3.25rem);
  line-height: 1.12;
}

.intro {
  display: grid;
  gap: var(--sp-7);
}

@media (min-width: 60rem) {
  .intro {
    grid-template-columns: minmax(0, 1fr) 15rem;
    gap: var(--sp-8);
    align-items: start;
  }
}

.portrait {
  position: relative;
  max-width: 15rem;
}

.portrait-frame {
  display: block;
  /* The studio background is near-white; on this ground a hard-edged bright
     rectangle reads as a sticker. Dissolve it instead. */
  -webkit-mask-image: radial-gradient(
    82% 66% at 50% 40%,
    #000 30%,
    rgb(0 0 0 / 0.45) 62%,
    transparent 85%
  );
  mask-image: radial-gradient(
    82% 66% at 50% 40%,
    #000 30%,
    rgb(0 0 0 / 0.45) 62%,
    transparent 85%
  );
}

.portrait img {
  width: 100%;
  height: auto;
  display: block;
  /* Cool monochrome so the portrait sits in the same palette as the rest of
     the page, and dark enough that the paper does not out-shout the type. */
  filter: grayscale(1) contrast(1.08) brightness(0.62);
}

.portrait figcaption {
  margin-top: calc(var(--sp-6) * -1);
  font-size: var(--step--2);
  letter-spacing: 0.1em;
  color: var(--ink-2);
}

.socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3) var(--sp-5);
}

.social {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: 32px;
  font-family: var(--font-mono);
  font-size: var(--step--2);
  color: var(--ink-2);
  text-decoration: none;
}

.social:hover {
  color: var(--ink);
}

.posts {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--sp-6);
  }
}

.post {
  padding-top: var(--sp-5);
  border-top: 2px solid var(--ink);
}

.org-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--rule);
}

.org-link:hover {
  border-bottom-color: currentColor;
}

.fact {
  font-size: var(--step--2);
  color: var(--ink-2);
  /* The numbers are the point of this block, so they get figures that line up
     between the three columns rather than drifting. */
  font-variant-numeric: tabular-nums;
}

.fact::before {
  content: '';
  display: inline-block;
  width: 0.6em;
  height: 1px;
  margin-right: 0.7em;
  vertical-align: middle;
  background: var(--pop);
}
</style>
