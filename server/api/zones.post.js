import { readJsonBody } from '../utils/readJsonBody'
import { cfFetch } from '../utils/cfFetch'
export default defineEventHandler(async (event) => {
	try {
		const body = await readJsonBody(event)

		if (!body.apiKey) {
			return { success: false, errors: [{ message: 'API key is required' }], result: [] }
		}

		let data = await cfFetch({ apiKey: body.apiKey, method: 'GET', path: '/zones' })
		if (!data.result) data.result = []

		const totalPages = data?.result_info?.total_pages || 1
		if (data && totalPages > 1) {
			const pages = Array.from({ length: totalPages - 1 }, (_, idx) => idx + 2)
			const results = await Promise.all(
				pages.map((page) => cfFetch({ apiKey: body.apiKey, method: 'GET', path: `/zones?page=${page}` }))
			)
			for (const pageData of results) {
				if (pageData && pageData.success && pageData.result) data.result = data.result.concat(pageData.result)
			}
		}

		if (body.getSsl && data && data.result) {
			const concurrency = 8
			const queue = data.result.filter((z) => z && z.id)
			let i = 0

			const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
				while (i < queue.length) {
					const idx = i++
					const zone = queue[idx]
					const sslData = await cfFetch({
						apiKey: body.apiKey,
						method: 'GET',
						path: `/zones/${zone.id}/settings/ssl`
					})
					if (sslData && sslData.success) zone.ssl = sslData
				}
			})

			await Promise.all(workers)
		}

		return data
	} catch (error) {
		console.error('DNS Editor: Error Making initial zones request', error)
		return {
			success: false,
			errors: [{ message: error.message || 'Unknown error' }],
			result: []
		}
	}
})
