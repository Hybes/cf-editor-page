import fetch from 'node-fetch'

export async function cfFetch({ apiKey, method = 'GET', path, body }) {
	const token = typeof apiKey === 'string' ? apiKey.trim() : ''
	const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: body ? JSON.stringify(body) : undefined
	})

	let data
	try {
		data = await response.json()
	} catch {
		data = null
	}

	if (!data) {
		return {
			success: false,
			errors: [{ message: `HTTP Error: ${response.status}` }]
		}
	}

	if (!response.ok && data && data.success !== false) {
		return {
			success: false,
			errors: [{ message: `HTTP Error: ${response.status}` }]
		}
	}

	return data
}
