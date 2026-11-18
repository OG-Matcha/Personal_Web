<template>
  <!-- Who made the room and when it was last rearranged. The contact ask
       lives at the last stop, not here. -->
  <footer class="ft">
    <div class="shell ft-row">
      <p class="ft-line figures">
        © 2026 {{ en ? 'Ju-Shen Huang 黃鉅燊' : '黃鉅燊 Ju-Shen Huang' }} · {{ en ? 'Updated' : '資料更新於' }}
        {{ formatDate(site.asOf) }}
      </p>
      <ul class="ft-links">
        <li>
          <NuxtLink :to="en ? '/en/portfolio/' : '/portfolio/'">{{ en ? 'All work' : '作品集' }}</NuxtLink>
        </li>
        <li>
          <NuxtLink :to="en ? '/en/resume/' : '/resume/'">{{ en ? 'Résumé' : '履歷' }}</NuxtLink>
        </li>
        <li v-for="l in links" :key="l.label">
          <a :href="l.href" v-bind="l.attrs">{{ l.label }}</a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup>
const { site } = useContent()
const { locale } = useLocale()
const en = computed(() => locale.value === 'en')

const links = [
  { label: 'Email', href: `mailto:${site.contact.email}` },
  { label: 'GitHub', href: site.contact.github, attrs: linkAttrs(site.contact.github, { me: true }) },
  { label: 'LinkedIn', href: site.contact.linkedin, attrs: linkAttrs(site.contact.linkedin, { me: true }) },
]
</script>

<style scoped>
.ft {
  position: relative;
  z-index: 1;
  background: var(--bg);
  border-top: 1px solid var(--rule);
}

.ft-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-4) var(--sp-7);
  padding-block: var(--sp-6);
  font-size: var(--step--1);
  color: var(--ink-3);
}

.ft-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-5);
  margin-left: auto;
}

.ft-links a {
  color: var(--ink-2);
  text-decoration: none;
  /* A 40px-tall target around 14px of text, without moving the text. */
  display: inline-block;
  padding-block: 13px;
  margin-block: -13px;
}

.ft-links a:hover {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--pop-ink);
}
</style>
