// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "DNS Manager",
      htmlAttrs: {
        lang: 'en-GB',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
        { name: 'theme-color', content: '#121212' },
        { name: 'msapplication-TileColor', content: '#121212' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'cloudflare editor, cloudflare api, cloudflare api editor, dns api, cloudflare edit dns, cloudflare api dns edit',
        },
        {
          hid: 'description',
          name: 'description',
          content:
            'API Key editor for Cloudflare DNS records',
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: 'DNS Manager',
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content:
            'API Key editor for Cloudflare DNS records',
        },
        { hid: 'og:image', name: 'og:image', content: 'og-image.png' },
        { hid: 'og:url', name: 'og:url', content: 'https://dns.brth.uk' },
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: 'DNS Manager',
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content:
            'API Key editor for Cloudflare DNS records',
        },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: '/twitter.png',
        },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      script: [
        {
          hid: 'umami-script',
          src: 'https://view.cnnct.uk/script.js',
          async: true,
          'data-website-id': '7911a836-2f1b-431a-903d-1d898a030724',
        },
      ],
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
  },

  site: {
    name: 'DNS Manager',
    description: 'API Key editor for Cloudflare DNS records',
    url: 'https://dns.brth.uk',
    image: '/og-image.png',
    twitter: '@hybes',
    lang: 'en-GB',
    twitterImage: '/twitter.png',
    themeColor: '#121212',
    backgroundColor: '#121212',
  },

  modules: [
    '@nuxtjs/device',
    '@nuxtjs/robots',
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-icon',
    '@nuxtjs/seo',
    '@nuxtjs/sitemap',
    'nuxt-simple-robots',
    'nuxt-og-image',
    'nuxt-schema-org'
  ],

  ui: {
    global: true,
    icons: [
      'clarity'
    ]
  },

  robots: {
    rules: {
      UserAgent: '*',
      Disallow: ''
    }
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2024-07-03',
})