<template>
  <!-- The closing beat already makes the ask, so this is only the colophon
       line: no second heading, no repeated buttons. -->
  <footer class="footer">
    <div class="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6">
      <p class="mono text-2xs text-ink-2">© {{ year }} 黃鉅燊 Ju-Shen Huang</p>

      <!-- /portfolio and /resume were reachable from nowhere: both are
           prerendered and in the sitemap, and no page on the site linked to
           either. The four case-study pages are dead ends without this. -->
      <ul class="flex flex-wrap gap-x-5 gap-y-2">
        <li>
          <NuxtLink to="/portfolio/" class="mono text-2xs text-ink-2 hover:text-ink">作品集</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/resume/" class="mono text-2xs text-ink-2 hover:text-ink">履歷</NuxtLink>
        </li>
      </ul>

      <ul class="flex flex-wrap gap-x-5 gap-y-2">
        <li v-for="l in links" :key="l.label">
          <a :href="l.href" class="mono text-2xs text-ink-2 hover:text-ink" v-bind="l.attrs">
            {{ l.label }}
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script setup>
const { site } = useContent()

// Rendered at build time, so it cannot drift out of date in a static export.
const year = 2026

const links = [
  { label: 'EMAIL', href: `mailto:${site.contact.email}` },
  { label: 'GITHUB', href: site.contact.github, attrs: linkAttrs(site.contact.github, { me: true }) },
  { label: 'LINKEDIN', href: site.contact.linkedin, attrs: linkAttrs(site.contact.linkedin, { me: true }) },
]
</script>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  background: var(--bg);
  border-top: 1px solid var(--rule);
}
</style>
