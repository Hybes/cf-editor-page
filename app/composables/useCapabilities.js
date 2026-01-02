export function useCapabilities() {
	const state = useState('cf-capabilities', () => ({
		apiKey: null,
		global: null,
		zones: {},
		loading: false
	}))

	const ensureKey = (apiKey) => {
		if (!apiKey) return
		if (state.value.apiKey === apiKey) return
		state.value.apiKey = apiKey
		state.value.global = null
		state.value.zones = {}
	}

	const loadGlobal = async (apiKey) => {
		if (!apiKey) return null
		ensureKey(apiKey)
		if (state.value.global) return state.value.global
		state.value.loading = true
		try {
			const data = await $fetch('/api/capabilities', {
				method: 'POST',
				body: { apiKey }
			})
			state.value.global =
				data && data.success
					? data.result
					: { zones: { available: false, reason: data?.errors?.[0]?.message || 'Unavailable' } }
			return state.value.global
		} finally {
			state.value.loading = false
		}
	}

	const loadZone = async (apiKey, zoneId) => {
		if (!apiKey || !zoneId) return null
		ensureKey(apiKey)
		if (state.value.zones[zoneId]) return state.value.zones[zoneId]
		state.value.loading = true
		try {
			const data = await $fetch('/api/capabilities', {
				method: 'POST',
				body: { apiKey, currZone: zoneId }
			})
			state.value.zones[zoneId] = data && data.success ? data.result : null
			return state.value.zones[zoneId]
		} finally {
			state.value.loading = false
		}
	}

	const missing = (caps) => {
		if (!caps) return []
		return Object.entries(caps)
			.filter(([_, v]) => v && v.available === false)
			.map(([k, v]) => ({ key: k, reason: v.reason || 'Unavailable' }))
	}

	const can = (caps, key) => {
		return Boolean(caps && caps[key] && caps[key].available)
	}

	return {
		state,
		loadGlobal,
		loadZone,
		missing,
		can
	}
}
