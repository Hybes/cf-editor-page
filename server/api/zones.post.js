import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${body.apiKey}`,
			'Content-Type': 'application/json',
		},
	});
	const data = await response.json();
	return data;
});
