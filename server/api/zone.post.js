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

		const [data, sslData] = await Promise.all([
			cfFetch({ apiKey: body.apiKey, method: 'GET', path: `/zones/${body.currZone}` }),
			cfFetch({ apiKey: body.apiKey, method: 'GET', path: `/zones/${body.currZone}/settings/ssl` })
		])
		if (!data.success) return data
		data.result.ssl = sslData && sslData.success ? sslData.result : { value: 'unknown' }

		return data
	} catch (error) {
		console.error('DNS Editor: Error Making GET request for zone', error)
		return {
			success: false,
			errors: [{ message: `Error fetching zone: ${error.message}` }]
		}
	}
})
