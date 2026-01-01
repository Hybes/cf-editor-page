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

		if (typeof body.fight_mode !== 'boolean') {
			return { success: false, errors: [{ message: 'fight_mode must be a boolean' }] }
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'PUT',
			path: `/zones/${body.currZone}/bot_management`,
			body: { fight_mode: body.fight_mode }
		})
	} catch (error) {
		console.error('DNS Editor: Error updating bot fight mode', error)
		return {
			success: false,
			errors: [{ message: error.message || 'Unknown error occurred' }]
		}
	}
})
