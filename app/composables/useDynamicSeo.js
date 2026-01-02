import { computed, unref } from 'vue'

export function useDynamicSeo({ title, description }) {
	const site = useSiteConfig()

	const siteName = computed(() => site?.name || 'DNS Manager')
	const siteDescription = computed(() => site?.description || '')

	const resolvedTitle = computed(() => {
		const t = (unref(title) || '').trim()
		const n = (unref(siteName) || '').trim()
		if (!t) return n
		if (!n) return t
		if (t.includes(n)) return t
		return `${t} | ${n}`
	})

	const resolvedDescription = computed(() => {
		const d = (unref(description) || '').trim()
		if (d) return d
		return (unref(siteDescription) || '').trim()
	})

	useSeoMeta({
		title: resolvedTitle,
		description: resolvedDescription,
		ogTitle: resolvedTitle,
		ogDescription: resolvedDescription,
		twitterTitle: resolvedTitle,
		twitterDescription: resolvedDescription
	})
}
