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

      <!-- A photo card with a hard edge, in colour. The earlier version was
           greyscale, darkened and dissolved into the page with a radial mask,
           which is exactly how a memorial portrait is presented.

           The plate around it borrows the film's own grammar - registration
           ticks, a scanline grade, one accent rule - so the one photograph on
           the site does not read as a stock headshot dropped into a dark
           page. All of it retracts on hover and hands over the clean frame. -->
      <figure class="portrait">
        <div class="plate">
          <span class="portrait-frame">
            <img
              src="/images/portrait.jpg"
              alt="黃鉅燊"
              width="880"
              height="1100"
              loading="lazy"
              decoding="async"
            />
            <span class="scan" aria-hidden="true" />
            <span class="tick tl" aria-hidden="true" />
            <span class="tick br" aria-hidden="true" />
          </span>
        </div>

        <figcaption>
          <span class="cap-name mono">
            {{ site.person.nameZh }} <span class="text-ink-3">{{ site.person.nameEn }}</span>
          </span>
          <span class="cap-meta mono">{{ site.person.handle }}</span>
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

/* The plate is what the treatment is attached to. The figure is taller than
   it - it carries the caption too - so hanging the accent rule off the figure
   put it under the type instead of under the photograph. */
.plate {
  position: relative;
}

/* The accent rule sits behind the plate and offset from it, the way a second
   pass is offset on a misregistered print. It is the only saturated thing in
   this column, so it stays a hairline. */
.plate::before {
  content: '';
  position: absolute;
  inset: auto auto -7px -7px;
  width: 42%;
  height: 1px;
  background: var(--pop);
  transition: width var(--dur-3) var(--ease-entrance);
}

/* This used to be greyscale, darkened, and dissolved into the page with a
   radial mask. Those three together are the visual grammar of a funeral
   portrait, which is not what you want on a CV. A hard edge and the colour
   left alone reads as a photo card instead: the studio white becomes a
   deliberate bright plate rather than an oval fading into black. */
.portrait-frame {
  position: relative;
  display: block;
  overflow: hidden;
  border: 1px solid var(--rule-strong);
  border-radius: var(--r-1);
}

/* Signal grade, same choice the film makes: scanlines rather than film grain.
   A one-device-pixel line needs two device pixels of pitch, which only exists
   on a 2x screen. On a 1x one the same rule lands a full CSS pixel of black
   every other row and the portrait comes back as heavy banding - it reads as
   a broken image, not as a treatment. So 1x gets no scanlines; the ticks, the
   accent rule and the grade still carry it. */
.scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity var(--dur-3) var(--ease-inout);
}

@media (min-resolution: 2dppx) {
  .scan {
    background: repeating-linear-gradient(
      to bottom,
      rgb(0 0 0 / 0.22) 0 1px,
      transparent 1px 2px
    );
  }
}

/* Registration ticks, on two opposite corners only. Four corners reads as a
   viewfinder, which is a different and much more used idea. */
.tick {
  position: absolute;
  width: 13px;
  height: 13px;
  pointer-events: none;
  border: 0 solid var(--pop);
  transition: opacity var(--dur-2) var(--ease-inout);
}

.tick.tl {
  top: 7px;
  left: 7px;
  border-top-width: 1px;
  border-left-width: 1px;
}

.tick.br {
  right: 7px;
  bottom: 7px;
  border-right-width: 1px;
  border-bottom-width: 1px;
}

.portrait img {
  width: 100%;
  height: auto;
  display: block;
  /* Crop off the empty jacket at the bottom so the face carries the frame. */
  aspect-ratio: 1 / 1.12;
  object-fit: cover;
  object-position: 50% 14%;
  /* Pulled a touch toward the page's cool monochrome, but still a person. */
  filter: saturate(0.82) contrast(1.05) brightness(0.94);
  transition:
    filter var(--dur-3) var(--ease-inout),
    transform var(--dur-3) var(--ease-entrance);
}

/* Hover clears the grade instead of adding to it: the plate is the treatment,
   and getting close to it takes the treatment off. */
.portrait:hover img,
.portrait:focus-within img {
  filter: saturate(1) contrast(1.02) brightness(1);
  transform: scale(1.035);
}

.portrait:hover .scan,
.portrait:focus-within .scan {
  opacity: 0;
}

.portrait:hover .tick,
.portrait:focus-within .tick {
  opacity: 0;
}

.portrait:hover .plate::before,
.portrait:focus-within .plate::before {
  width: calc(100% + 7px);
}

@media (prefers-reduced-motion: reduce) {
  .portrait img,
  .plate::before,
  .scan,
  .tick {
    transition: none;
  }

  .portrait:hover img,
  .portrait:focus-within img {
    transform: none;
  }
}

.portrait figcaption {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: var(--sp-4);
  color: var(--ink-2);
}

/* Latin tracking on 漢字 opens the em box and forced this onto three lines in
   a 15rem column. The Latin half keeps it; the whole line does not. */
.cap-name {
  font-size: var(--step--2);
  letter-spacing: 0;
}

.cap-meta {
  font-size: var(--step--2);
  letter-spacing: 0.18em;
  color: var(--ink-3, var(--ink-2));
  opacity: 0.7;
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
