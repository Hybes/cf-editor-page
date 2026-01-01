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

		let data = await cfFetch({
			apiKey: body.apiKey,
			method: 'GET',
			path: `/zones/${body.currZone}/dns_records?per_page=100`
		})
		if (!data.result) data.result = []
		if (!data.success) return data

		const totalPages = data?.result_info?.total_pages || 1
		if (totalPages > 1) {
			const pages = Array.from({ length: totalPages - 1 }, (_, idx) => idx + 2)
			const results = await Promise.all(
				pages.map((page) =>
					cfFetch({
						apiKey: body.apiKey,
						method: 'GET',
						path: `/zones/${body.currZone}/dns_records?per_page=100&page=${page}`
					})
				)
			)
			for (const pageData of results) {
				if (pageData.success && pageData.result) data.result = data.result.concat(pageData.result)
			}
		}

		return data
	} catch (error) {
		console.error('DNS Editor: Error Making GET request for records', error)
		return {
			success: false,
			errors: [{ message: `Error fetching DNS records: ${error.message}` }]
		}
	}
})
