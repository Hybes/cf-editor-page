import fetch from 'node-fetch'
export default defineEventHandler(async (event) => {
    try {
        const body = JSON.parse(await readBody(event));
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/${body.currDnsRecord}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${body.apiKey}`,
                'Content-Type': 'application/json'
            },
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.error('DNS Editor: Error Making DELETE request for record', error);
        throw error;
    }
})
