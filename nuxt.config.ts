// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "Ben's Site",
      htmlAttrs: {
        lang: 'en-GB',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
        { name: 'theme-color', content: '#586276' },
        { name: 'msapplication-TileColor', content: '#586276' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'tags, go, here',
        },
        {
          hid: 'description',
          name: 'description',
          content:
            'DESCRIPTION HERE',
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: 'TITLE HERE',
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content:
            'DESCRIPTION HERE',
        },
        { hid: 'og:image', name: 'og:image', content: 'og-image.png' },
        { hid: 'og:url', name: 'og:url', content: 'https://test.brth.uk' },
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: 'TITLE HERE',
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content:
            'DESCRIPTION HERE',
        },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: '/twitter.png',
        },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image', href: '/favicon.ico' },
        // { rel: 'stylesheet', href: 'https://use.typekit.net/nyk3qjw.css' },
      ],
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
  },
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://test.brth.uk',
      siteName: "Ben's Site",
      siteDescription: "Welcome to Ben's Site!",
      language: 'en-GB'
    }
  },

  modules: [
    '@nuxtjs/device',
    '@nuxtjs/robots',
    '@nuxtjs/google-fonts',
    '@nuxtjs/plausible',
    '@nuxt/image',
    '@nuxt/content',
    'nuxt-icon'
  ],
  extends: [
    'nuxt-seo-kit'
  ],
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
})
