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
		const path = `/accounts/${accountId}/dns_firewall`

		if (action === 'create') {
			const cluster = body.cluster || {}
			return await cfFetch({ apiKey: body.apiKey, method: 'POST', path, body: cluster })
		}

		return await cfFetch({ apiKey: body.apiKey, method: 'GET', path })
	} catch (error) {
		console.error('DNS Editor: Error with DNS Firewall clusters', error)
		return { success: false, errors: [{ message: error.message || 'Unknown error' }] }
	}
})


