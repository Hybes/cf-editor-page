import { readJsonBody } from '../utils/readJsonBody'
import { cfFetch } from '../utils/cfFetch'
export default defineEventHandler(async (event) => {
	try {
		const body = await readJsonBody(event)

		if (!body.dns || !body.dns.type) {
			return {
				success: false,
				errors: [{ message: "Invalid DNS data: 'type' is required" }]
			}
		}

		if (!body.apiKey) {
			return { success: false, errors: [{ message: 'API key is required' }] }
		}

		if (!body.currZone) {
			return { success: false, errors: [{ message: 'Zone ID is required' }] }
		}

		if (!body.currDnsRecord) {
			return { success: false, errors: [{ message: 'DNS record ID is required' }] }
		}

		const bodyToSend = {
			type: body.dns.type,
			comment: body.dns.comment || '',
			ttl: Number.isInteger(body.dns.ttl) ? body.dns.ttl : Number(body.dns.ttl) || 1
		}

		if (body.dns.type === 'SRV') {
			if (!body.dns.data) {
				return {
					success: false,
					errors: [{ message: 'Missing SRV data' }]
				}
			}

			bodyToSend.data = body.dns.data
			bodyToSend.name = body.dns.name

			if (body.dns.data.port) bodyToSend.data.port = Number(body.dns.data.port)
			if (body.dns.data.priority) bodyToSend.data.priority = Number(body.dns.data.priority)
			if (body.dns.data.weight) bodyToSend.data.weight = Number(body.dns.data.weight)

			if (body.dns.priority !== undefined) {
				bodyToSend.priority = Number(body.dns.priority) || 0
			}
		} else {
			bodyToSend.content = body.dns.content
			bodyToSend.name = body.dns.name
			bodyToSend.proxied = body.dns.proxied

			if (body.dns.priority !== undefined) {
				bodyToSend.priority = Number(body.dns.priority) || 0
			}
		}

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'PUT',
			path: `/zones/${body.currZone}/dns_records/${body.currDnsRecord}`,
			body: bodyToSend
		})
	} catch (error) {
		console.error('DNS Editor: Error Making PUT request to update record', error)
		return {
			success: false,
			errors: [{ message: error.message || 'Unknown error occurred' }]
		}
	}
})
