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

		if (!body.currDnsRecord) {
			return { success: false, errors: [{ message: 'DNS record ID is required' }] }
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'GET',
			path: `/zones/${body.currZone}/dns_records/${body.currDnsRecord}`
		})
	} catch (error) {
		console.error('DNS Editor: Error Making GET request for individual record', error)
		return {
			success: false,
			errors: [{ message: `Error fetching DNS record: ${error.message}` }]
		}
	}
})
