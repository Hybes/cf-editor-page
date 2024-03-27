// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: 'DNS Manager',
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
					content:
						'cloudflare editor, cloudflare api, cloudflare api editor, dns api, cloudflare edit dns, cloudflare api dns edit',
				},
				{
					hid: 'description',
					name: 'description',
					content: 'API Key editor for Cloudflare DNS records',
				},
				{
					hid: 'og:title',
					name: 'og:title',
					content: 'DNS Manager',
				},
				{
					hid: 'og:description',
					name: 'og:description',
					content: 'API Key editor for Cloudflare DNS records',
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
					content: 'API Key editor for Cloudflare DNS records',
				},
				{
					hid: 'twitter:image',
					name: 'twitter:image',
					content: '/twitter.png',
				},
				{ hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
			],
			link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
		},
		pageTransition: { name: 'fade', mode: 'out-in' },
	},
	devtools: { enabled: true },
	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://dns.brth.uk',
			siteName: 'DNS Manager',
			siteDescription: 'API Key editor for Cloudflare DNS records',
			language: 'en-GB',
		},
	},

	modules: [
		'@nuxtjs/device',
		'@nuxtjs/robots',
		'@nuxtjs/google-fonts',
		'@nuxt/image',
		'@nuxt/content',
		'@nuxt/ui',
		'@nuxtjs/plausible',
		'nuxt-icon',
	],
	extends: ['nuxt-seo-kit'],
	ui: {
		global: true,
		icons: ['clarity'],
	},
	robots: {
		rules: {
			UserAgent: '*',
			Disallow: '',
		},
	},
	plausible: {
		apiHost: 'https://views.cnnct.uk',
	},
	css: ['~/assets/css/main.css'],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
});
