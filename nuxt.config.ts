// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,

  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', '@nuxtjs/sitemap'],

  site: {
    url: 'https://www.ogmatcha.com',
    name: 'Portfolio | Ju-Shen Huang - OG_Matcha | Finctory CTO',
  },

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
        { 
          name: 'description', 
          content: '黃鉅燊，國立中央大學資管系，擁有全端開發、DevOps 與 AI 應用實戰經驗。目前擔任 Finctory CTO，專注於 SaaS 創業與技術創新。' 
        },
        { 
          name: 'keywords', 
          content: '黃鉅燊, Ju-Shen Huang, OG_Matcha, Finctory, 全端開發, AI 應用, SaaS 創業, DevOps, 中央大學' 
        },
        { name: 'author', content: '黃鉅燊 (Ju-Shen Huang)' },
        
        // Open Graph
        { property: 'og:title', content: 'Portfolio | Ju-Shen Huang - OG_Matcha | Finctory CTO' },
        { 
          property: 'og:description', 
          content: '黃鉅燊，國立中央大學資管系，擁有全端開發、DevOps 與 AI 應用實戰經驗。目前擔任 Finctory CTO，專注於 SaaS 創業與技術創新。' 
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://www.ogmatcha.com' },
        { property: 'og:image', content: 'https://www.ogmatcha.com/assets/profile-cover.jpg' },
        { property: 'og:site_name', content: '黃鉅燊的個人網站' },
        
        // 其他重要 meta 標記
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/favicon.png' },
        { rel: 'canonical', href: 'https://www.ogmatcha.com' },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
          crossorigin: 'anonymous',
          integrity: 'sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=='
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
          crossorigin: 'anonymous'
        },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "黃鉅燊",
            "alternateName": "Ju-Shen Huang",
            "url": "https://www.ogmatcha.com",
            "image": "https://www.ogmatcha.com//images/my-avatar.jpg",
            "sameAs": [
              "https://github.com/ogmatcha",
              "https://linkedin.com/in/ogmatcha",
            ],
            "jobTitle": "CTO / 全端開發者 / AI 應用專家",
            "worksFor": {
              "@type": "Organization",
              "name": "Finctory",
              "url": "https://www.finctory.com"
            },
            "alumniOf": {
              "@type": "CollegeOrUniversity",
              "name": "國立中央大學",
              "department": "資訊管理學系"
            },
            "knowsAbout": [
              "全端開發",
              "DevOps",
              "AI 應用",
              "SaaS",
              "創業"
            ]
          })
        }
      ]
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