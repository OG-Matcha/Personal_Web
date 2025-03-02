// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
  ],

  plugins: [
    '~/plugins/animations.client.js',
  ],

  image: {
    dir: 'public',
    domains: ['localhost'],
    format: ['webp', 'png', 'jpg', 'svg'],
    provider: 'ipx',
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    buildAssetsDir: '/static/',
    head: {
      title: 'Portfolio | Ju-Shen Huang - OG_Matcha | Finctory CTO',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'OG_Matcha 的個人網站，展示作品集與專業經歷' },
        { name: 'keywords', content: '黃鉅燊, Ju-Shen Huang, OG_Matcha, Finctory, 作品集, 網頁開發, 前端開發' },
        { name: 'author', content: 'Ju-Shen Huang (OG_Matcha)' },
        { property: 'og:title', content: 'Portfolio | Ju-Shen Huang - OG_Matcha | Finctory CTO' },
        { property: 'og:description', content: 'OG_Matcha 的個人網站，展示作品集與專業經歷' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://og-matcha.github.io/Personal_Web/' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/Personal_Web/images/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/Personal_Web/images/favicon.png' },
      ],
    },
  },

  nitro: {
    publicAssets: [
      {
        dir: 'public',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      },
    ],
    prerender: {
      crawlLinks: true
    }
  },

  compatibilityDate: '2025-02-22',

  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    }
  }
})