import { readJsonBody } from '../utils/readJsonBody'
import { cfFetch } from '../utils/cfFetch'

export default defineEventHandler(async (event) => {
	try {
		const body = await readJsonBody(event)

		if (!body.apiKey) return { success: false, errors: [{ message: 'API key is required' }] }
		if (!body.currZone) return { success: false, errors: [{ message: 'Zone ID is required' }] }

		const zoneData = await cfFetch({ apiKey: body.apiKey, method: 'GET', path: `/zones/${body.currZone}` })
		if (!zoneData.success) return zoneData

		const accountId = zoneData.result?.account?.id
		if (!accountId) return { success: false, errors: [{ message: 'Account ID is required' }] }

		const action = body.action || 'list'
		if (action === 'create') {
			const widget = body.widget || {}
			return await cfFetch({
				apiKey: body.apiKey,
				method: 'POST',
				path: `/accounts/${accountId}/challenges/widgets`,
				body: widget
			})
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'GET',
			path: `/accounts/${accountId}/challenges/widgets`
		})
	} catch (error) {
		console.error('DNS Editor: Error with Turnstile widgets', error)
		return { success: false, errors: [{ message: error.message || 'Unknown error' }] }
	}
})
