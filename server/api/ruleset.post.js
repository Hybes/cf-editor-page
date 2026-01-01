import { readJsonBody } from '../utils/readJsonBody'
import { cfFetch } from '../utils/cfFetch'

export default defineEventHandler(async (event) => {
	try {
		const body = await readJsonBody(event)

		if (!body.apiKey) {
			return { success: false, errors: [{ message: 'API key is required' }] }
		}

		if (!body.currZone) {
			return { success: false, errors: [{ message: 'Zone ID is required' }] }
		}

		if (!body.rulesetId) {
			return { success: false, errors: [{ message: 'Ruleset ID is required' }] }
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'GET',
			path: `/zones/${body.currZone}/rulesets/${body.rulesetId}`
		})
	} catch (error) {
		console.error('DNS Editor: Error fetching ruleset', error)
		return {
			success: false,
			errors: [{ message: error.message || 'Unknown error occurred' }]
		}
	}
})
