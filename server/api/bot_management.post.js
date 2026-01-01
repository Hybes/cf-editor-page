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

		return await cfFetch({ apiKey: body.apiKey, method: 'GET', path: `/zones/${body.currZone}/bot_management` })
	} catch (error) {
		console.error('DNS Editor: Error fetching bot management config', error)
		return {
			success: false,
			errors: [{ message: error.message || 'Unknown error occurred' }]
		}
	}
})
