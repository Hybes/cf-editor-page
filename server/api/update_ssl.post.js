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

		if (!body.ssl) {
			return { success: false, errors: [{ message: 'SSL value is required' }] }
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'PATCH',
			path: `/zones/${body.currZone}/settings/ssl`,
			body: { value: body.ssl }
		})
	} catch (error) {
		console.error('DNS Editor: Error Making PATCH request to update SSL', error)
		return { success: false, errors: [{ message: error.message || 'Unknown error occurred' }] }
	}
})
