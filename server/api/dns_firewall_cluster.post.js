import { createError } from 'h3'
import { readJsonBody } from '../utils/readJsonBody'
import { cfFetch } from '../utils/cfFetch'

export default defineEventHandler(async (event) => {
	try {
		const body = await readJsonBody(event)

		if (!body.apiKey) throw createError({ statusCode: 400, statusMessage: 'API key is required' })
		if (!body.currZone) throw createError({ statusCode: 400, statusMessage: 'Zone ID is required' })
		if (!body.clusterId) throw createError({ statusCode: 400, statusMessage: 'Cluster ID is required' })

		const zoneData = await cfFetch({ apiKey: body.apiKey, method: 'GET', path: `/zones/${body.currZone}` })
		if (!zoneData.success) return zoneData

		const accountId = zoneData.result?.account?.id
		if (!accountId) throw createError({ statusCode: 400, statusMessage: 'Account ID is required' })

		const action = body.action || 'get'
		const path = `/accounts/${accountId}/dns_firewall/${body.clusterId}`

		if (action === 'update') {
			const cluster = body.cluster || {}
			return await cfFetch({ apiKey: body.apiKey, method: 'PATCH', path, body: cluster })
		}

		if (action === 'delete') {
			return await cfFetch({ apiKey: body.apiKey, method: 'DELETE', path })
		}

		return await cfFetch({ apiKey: body.apiKey, method: 'GET', path })
	} catch (error) {
		if (error?.statusCode) throw error
		throw createError({
			statusCode: 500,
			statusMessage: error?.message || 'Unknown error'
		})
	}
})
