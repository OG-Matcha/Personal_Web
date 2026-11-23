// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import yaml from '@rollup/plugin-yaml'
import { assetVersions, versionCss } from './scripts/asset-v.mjs'

const SITE_URL = 'https://www.ogmatcha.com'
// The last commit's date stands as every page's <lastmod>: the content all
// lives in one repo and a build ships every page together. (CI checks out one
// commit, which is all `git log -1` needs.)
let LASTMOD: string | undefined
try {
  LASTMOD = execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim() || undefined
} catch {}
// Content hashes of public/desk, fonts, images and media, so their URLs change only
// when the file does and can be cached for a year (scripts/asset-v.mjs).
const ASSET_V = assetVersions(process.cwd())
const v = (u: string) => (ASSET_V[u] ? `${u}?v=${ASSET_V[u]}` : u)
// Just the name. A tab strip full of open pages shows about 20 characters,
// and a job title spends all of them saying something the page says better.
const TITLE = '黃鉅燊 Ju-Shen Huang'
// Fallback only - every real page sets its own description now, from the
// counts useContent() derives from the timeline. This file is loaded outside
// Vite and cannot import the YAML, so these three numbers are the one copy
// that has to be kept in step by hand.
const DESCRIPTION =
  '黃鉅燊（Ju-Shen Huang / OG_Matcha），斐闊 Finctory 共同創辦人暨技術長、醫數行銷 MedaLink 共同創辦人暨前線部署工程師，中央大學資訊管理學系碩士班。把 LLM 放進會出貨的系統裡：財伴 oSave、PhishForge、診所營運系統，16 項競賽獎項含 5 座全國首獎，3 個國科會研究計畫。'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  // Page changes run as view transitions: a product's cover carries over
  // from the card you clicked into the page it opens (view-transition-name).
  experimental: {
    viewTransition: true,
    // Links fetch the next page's code and data when pointed at or focused,
    // not when they scroll into view: on the homepage a dozen visible links
    // were pulling other pages' chunks while the desk was still loading.
    defaults: { nuxtLink: { prefetchOn: { visibility: false, interaction: true } } },
  },

  // No image module: every file in public/images is already resized and
  // compressed to under 200 kB at build time, so an on-the-fly resizer would
  // add a provider, a dev/prod behaviour split, and no bytes saved.
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/sitemap'],

  css: ['~/assets/css/tailwind.css'],

  // YAML content is resolved at build time — no runtime dependency, no CMS.
  vite: {
    plugins: [yaml()],
    // utils/asset.ts
    define: { __ASSET_V__: JSON.stringify(ASSET_V) },
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
    // The font stylesheets are copied as they are; point their url()s at the
    // versioned fonts in the copy that ships.
    'nitro:build:public-assets': (nitro) => {
      const dir = path.join(nitro.options.output.publicDir, 'fonts')
      for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.css'))) {
        const file = path.join(dir, f)
        fs.writeFileSync(file, versionCss(fs.readFileSync(file, 'utf8'), ASSET_V))
      }
    },
    // The 3D layer is desktop-only and behind a dynamic import, but Nuxt still
    // emits a prefetch link for its chunk - which hands every phone a 137 kB
    // download it will never execute. Load it only when the film asks for it.
    'build:manifest': (manifest) => {
      /*
       * No <link rel="prefetch"> at all.
       *
       * Cloudflare sits in front of this site and answers every prefetch
       * request with 503 - measured, not guessed: four prefetch links in the
       * document, four 503s in the network log, and the set changes to match
       * whenever the emitted chunks change. So the prefetches never warm
       * anything; they only cost four failed requests and four console errors
       * on every page load.
       *
       * The chunks are still fetched normally on navigation. This was already
       * being done for the three.js chunk for a different reason (it is 131 kB
       * that a phone never executes); the reason now applies to all of them.
       */
      for (const entry of Object.values(manifest)) {
        entry.prefetch = false
      }
    },
  },

  site: {
    url: SITE_URL,
    name: TITLE,
    // The build emits directory indexes (portfolio/index.html), and GitHub
    // Pages 301s a slashless request to the slashed form. Every canonical and
    // every sitemap <loc> used to point at the redirect rather than at the
    // page, so each one cost an extra crawl hop and Search Console filed them
    // as "Page with redirect".
    trailingSlash: true,
  },

  sitemap: {
    defaults: LASTMOD ? { lastmod: LASTMOD } : {},
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
    '/news': { redirect: { to: '/#record', statusCode: 301 } },
  },

  /**
   * `nuxt dev` and `nuxt generate` used to share this directory, so a generate
   * run replaced the dev server's server bundle underneath it and every
   * request after that died with:
   *
   *   Package import specifier "#internal/nuxt/paths" is not defined
   *
   * `npm run generate` sets NUXT_BUILD_DIR so the two builds never touch the
   * same files, and a generate can be run while dev is still up.
   */
  buildDir: process.env.NUXT_BUILD_DIR || '.nuxt',

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
        // Proof and film: the browser chrome follows whichever the system is on.
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#efe9e0' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#12141c' },
        { name: 'color-scheme', content: 'light dark' },

        { property: 'og:title', content: TITLE },
        { property: 'og:description', content: DESCRIPTION },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: `${SITE_URL}/` },
        { property: 'og:image', content: `${SITE_URL}/images/og/site.jpg` },
        { name: 'twitter:image', content: `${SITE_URL}/images/og/site.jpg` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: '黃鉅燊 Ju-Shen Huang · OG_Matcha' },
        { property: 'og:site_name', content: '黃鉅燊 Ju-Shen Huang' },
        { property: 'og:locale', content: 'zh_TW' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/images/favicon-48.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/apple-touch-icon.png' },
        { rel: 'canonical', href: SITE_URL },

        // Latin faces are 0.8 kB gzipped — cheap enough to block on.
        { rel: 'stylesheet', href: v('/fonts/latin.css') },
        // The basic-Latin slice is needed on every page; fetch it with the
        // HTML instead of after the stylesheet, so headings don't reflow.
        { rel: 'preload', as: 'font', type: 'font/woff2', href: v('/fonts/archivo-var-002.woff2'), crossorigin: '' },
        // The Chinese font (two subset faces, scripts/subset-cjk.py), in two copies
        // picked by media query. With a mouse it swaps in when it arrives (one
        // re-layout, quick on a desktop CPU). On touch devices a late swap re-laid
        // every Chinese line, three seconds on a mid-range phone, so there it is
        // font-display: optional: used if ready by first paint or cached, from the
        // next page load on. Plain links, not a script: a script-inserted sheet
        // held the page's largest paint back by three seconds on a slow phone.
        { rel: 'stylesheet', href: v('/fonts/cjk.css'), media: '(hover: hover) and (pointer: fine)' },
        { rel: 'stylesheet', href: v('/fonts/cjk-touch.css'), media: 'not all and (hover: hover) and (pointer: fine)' },
        // The small face is needed on every page; fetch it with the HTML.
        { rel: 'preload', as: 'font', type: 'font/woff2', href: v('/fonts/notosanstc-0.woff2'), crossorigin: '' },
      ],
      script: [
        {
          // Runs before first paint: applies the reader's stored day/night
          // choice so it never flashes.
          innerHTML:
            // data-js: lets a page hide its no-JavaScript note without a <noscript>,
            // which Vue cannot hydrate. The lang line: there is one 404.html, in
            // Chinese; an /en/ address that misses gets the right lang at once.
            "var d=document.documentElement;d.setAttribute('data-js','');" +
            "if(/^\\/en(\\/|$)/.test(location.pathname))d.lang='en';" +
            "try{var t=localStorage.getItem('theme');" +
            "if(t==='dark'||t==='light')d.dataset.theme=t}catch(e){}",
          tagPosition: 'head',
        },
        // The JSON-LD used to live here as a hand-written literal. It moved
        // to composables/useJsonLd.ts: this file is loaded by jiti, outside
        // Vite, so @rollup/plugin-yaml never applied here and every fact in
        // the block was a hand-copy of content/*.yml that had already drifted.
      ],
    },
  },

  nitro: {
    publicAssets: [{ dir: 'public', maxAge: 60 * 60 * 24 * 365 }],
    prerender: {
      crawlLinks: true,
      // Every page is served at its slashed URL, but the crawler also queues the
      // slashless form (/portfolio and /portfolio/). Both write
      // portfolio/index.html at the same time, and when the longer render
      // finished first the file kept its last byte: CI shipped
      // "</html>>", a stray ">" at the bottom of /portfolio/. Render each page
      // once. /news stays: it is the redirect page for the old URL.
      ignore: [(p: string) => p !== '/news' && /^\/[^?]*[^/]$/.test(p) && !/\.[a-z0-9]+$/i.test(p.split('?')[0].split('/').pop() ?? '')],
    },
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
