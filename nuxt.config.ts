// https://nuxt.com/docs/api/configuration/nuxt-config
import yaml from '@rollup/plugin-yaml'

const SITE_URL = 'https://www.ogmatcha.com'
// Just the name. A tab strip full of open pages shows about 20 characters,
// and a job title spends all of them saying something the page says better.
const TITLE = '黃鉅燊 Ju-Shen Huang'
const DESCRIPTION =
  '黃鉅燊（Ju-Shen Huang / OG_Matcha），斐闊 Finctory 共同創辦人暨技術長、醫數行銷 MedaLink 共同創辦人暨前線部署工程師，中央大學資訊管理學系碩士班。把 LLM 放進會出貨的系統裡：財伴 oSave、PhishForge、診所營運系統，17 項競賽獎項含 4 座全國冠軍，3 個國科會研究計畫。'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,

  // No image module: every file in public/images is already resized and
  // compressed to under 200 kB at build time, so an on-the-fly resizer would
  // add a provider, a dev/prod behaviour split, and no bytes saved.
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],

  css: ['~/assets/css/tailwind.css'],

  // YAML content is resolved at build time — no runtime dependency, no CMS.
  vite: {
    plugins: [yaml()],
    build: {
      rollupOptions: {
        output: {
          // Give three.js its own named chunk so the prefetch hook below can
          // find it. Without a stable name the hash changes every build.
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three'
          },
        },
      },
    },
  },

  hooks: {
    // The 3D layer is desktop-only and behind a dynamic import, but Nuxt still
    // emits a prefetch link for its chunk - which hands every phone a 137 kB
    // download it will never execute. Load it only when the film asks for it.
    'build:manifest': (manifest) => {
      // Match on the chunk name from manualChunks - the emitted filename is a
      // bare hash, so it carries no name to test.
      for (const entry of Object.values(manifest)) {
        if (entry.name === 'three') entry.prefetch = false
      }
    },
  },

  site: {
    url: SITE_URL,
    name: TITLE,
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false,
  },

  routeRules: {
    // /news is gone — its one entry now lives in the timeline. Keep the URL
    // alive so the old inbound links and the previous sitemap don't 404.
    '/news': { redirect: { to: '/#ledger', statusCode: 301 } },
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: '/static/',
    head: {
      htmlAttrs: { lang: 'zh-Hant-TW' },
      title: TITLE,
      meta: [
        { charset: 'utf-8' },
        // No `user-scalable=no` — that fails WCAG 1.4.4 and costs a Lighthouse point.
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: DESCRIPTION },
        { name: 'author', content: '黃鉅燊 (Ju-Shen Huang)' },
        { name: 'robots', content: 'index, follow' },
        // One theme, so one colour - and the UA is told, so form controls,
        // scrollbars and the caret come up dark instead of light-on-dark.
        { name: 'theme-color', content: '#0c0d0f' },
        { name: 'color-scheme', content: 'dark' },

        { property: 'og:title', content: TITLE },
        { property: 'og:description', content: DESCRIPTION },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:image', content: `${SITE_URL}/images/og-cover.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: '黃鉅燊 Ju-Shen Huang' },
        { property: 'og:locale', content: 'zh_TW' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/favicon.png' },
        { rel: 'canonical', href: SITE_URL },

        // Latin faces are 0.8 kB gzipped — cheap enough to block on.
        { rel: 'stylesheet', href: '/fonts/latin.css' },
        // The CJK sheet is ~100 kB gzipped of unicode-range declarations for
        // 213 sliced faces. Loaded async so it never blocks first paint; the
        // fallback stack (PingFang TC / 微軟正黑) carries the text until it lands.
        { rel: 'preload', as: 'style', href: '/fonts/cjk.css', onload: "this.rel='stylesheet'" },
      ],
      noscript: [{ innerHTML: '<link rel="stylesheet" href="/fonts/cjk.css">' }],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: '黃鉅燊',
            alternateName: ['Ju-Shen Huang', 'OG_Matcha'],
            url: SITE_URL,
            image: `${SITE_URL}/images/my-avatar.jpg`,
            email: 'mailto:matchaskill@gmail.com',
            sameAs: [
              'https://github.com/OG-Matcha',
              'https://www.linkedin.com/in/ogmatcha/',
            ],
            jobTitle: ['共同創辦人暨技術長', '共同創辦人暨前線部署工程師'],
            // Two companies, kept separate on purpose: they are unrelated
            // entities and collapsing them into one would misstate both.
            worksFor: [
              {
                '@type': 'Organization',
                name: '斐闊有限公司 Finctory',
                url: 'https://www.finctory.com/',
              },
              {
                '@type': 'Organization',
                name: '醫數行銷科技有限公司 MedaLink',
                url: 'https://medalink.ai/',
              },
            ],
            alumniOf: {
              '@type': 'CollegeOrUniversity',
              name: '國立中央大學',
              department: '資訊管理學系',
            },
            knowsAbout: [
              '生成式 AI 應用',
              'LLM Agent 系統',
              '系統分析與設計',
              '全端開發',
              'DevOps',
            ],
          }),
        },
      ],
    },
  },

  nitro: {
    publicAssets: [{ dir: 'public', maxAge: 60 * 60 * 24 * 365 }],
    prerender: { crawlLinks: true },
  },

  compatibilityDate: '2025-02-22',

  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
