import { createError } from 'h3'
import { readJsonBody } from '../utils/readJsonBody'
import { cfFetch } from '../utils/cfFetch'
export default defineEventHandler(async (event) => {
	try {
		const body = await readJsonBody(event)

		if (!body.apiKey) {
			throw createError({ statusCode: 400, statusMessage: 'API key is required' })
		}

		if (!body.currZone) {
			throw createError({ statusCode: 400, statusMessage: 'Zone ID is required' })
		}

		if (!body.currDnsRecord) {
			throw createError({ statusCode: 400, statusMessage: 'DNS record ID is required' })
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'GET',
			path: `/zones/${body.currZone}/dns_records/${body.currDnsRecord}`
		})
	} catch (error) {
		if (error?.statusCode) throw error
		throw createError({
			statusCode: 500,
			statusMessage: `Error fetching DNS record: ${error?.message || 'Unknown error'}`
		})
	}
})
