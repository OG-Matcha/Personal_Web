<template>
  <!-- The last stop: the address, set big enough to copy from across a room. -->
  <div class="ct">
    <p class="ct-lede">{{ c.lede }}</p>
    <p class="ct-mail">
      <a :href="`mailto:${site.contact.email}`">
        {{ site.contact.email }}
      </a>
    </p>
    <ul class="ct-links">
      <li v-for="l in links" :key="l.label">
        <a :href="l.href" class="btn" v-bind="l.attrs">{{ l.label }}</a>
      </li>
    </ul>
    <p class="ct-cv">
      <a :href="locale === 'en' ? site.contact.cv.hrefEn : site.contact.cv.href" download>{{ c.cv }}</a>
    </p>
  </div>
</template>

<script setup>
const { site } = useContent()
const { locale } = useLocale()

const c = computed(() =>
  locale.value === 'en'
    ? {
        lede: 'Generative-AI and agent architecture, early-stage technical partnerships, talks and workshops. Email reaches me fastest.',
        cv: `CV (PDF), updated ${formatDate(site.contact.cv.updated)}`,
      }
    : {
        lede: `${site.open.join('、')}。寫信最快。`,
        cv: `履歷 PDF · ${formatDate(site.contact.cv.updated)} 更新`,
      }
)

const links = [
  { label: 'GitHub', href: site.contact.github, attrs: linkAttrs(site.contact.github, { me: true }) },
  { label: 'LinkedIn', href: site.contact.linkedin, attrs: linkAttrs(site.contact.linkedin, { me: true }) },
  { label: 'Instagram', href: site.contact.instagram, attrs: linkAttrs(site.contact.instagram, { me: true }) },
]
</script>

<style scoped>
.ct-lede {
  margin-top: var(--sp-5);
  max-width: var(--measure-han);
  color: var(--ink-2);
  font-size: var(--step-1);
}

.ct-mail {
  margin-top: var(--sp-7);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 0.6rem + 4.2vw, 4.5rem);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.ct-mail a {
  text-decoration: none;
}

.ct-mail a:hover {
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
  text-decoration-thickness: 3px;
}

.ct-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-top: var(--sp-7);
}

.ct-cv {
  margin-top: var(--sp-5);
  font-size: var(--step--1);
  font-weight: 600;
}
</style>
