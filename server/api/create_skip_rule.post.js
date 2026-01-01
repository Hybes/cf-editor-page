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

		if (!body.rulesetId) {
			return { success: false, errors: [{ message: 'Ruleset ID is required' }] }
		}

		if (!body.bypassToken) {
			return { success: false, errors: [{ message: 'Bypass token is required' }] }
		}

		const actionParameters =
			body.actionParameters && typeof body.actionParameters === 'object' ? body.actionParameters : {}

		const cleaned = {}
		if (actionParameters.ruleset) cleaned.ruleset = actionParameters.ruleset
		if (Array.isArray(actionParameters.phases) && actionParameters.phases.length)
			cleaned.phases = actionParameters.phases
		if (Array.isArray(actionParameters.products) && actionParameters.products.length)
			cleaned.products = actionParameters.products

		if (!cleaned.ruleset && !cleaned.phases && !cleaned.products) {
			cleaned.ruleset = 'current'
		}

		const expression = `(any(http.request.headers["x-cf-bypass-token"][*] eq "${body.bypassToken}"))`

		const payload = {
			action: 'skip',
			action_parameters: cleaned,
			expression,
			description: body.description || ''
		}

		if (typeof body.enabled === 'boolean') payload.enabled = body.enabled
		if (typeof body.loggingEnabled === 'boolean') payload.logging = { enabled: body.loggingEnabled }

		return await cfFetch({
			apiKey: body.apiKey,
			method: 'POST',
			path: `/zones/${body.currZone}/rulesets/${body.rulesetId}/rules`,
			body: payload
		})
	} catch (error) {
		console.error('DNS Editor: Error creating skip rule', error)
		return {
			success: false,
			errors: [{ message: error.message || 'Unknown error occurred' }]
		}
	}
})
