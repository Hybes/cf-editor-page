import fetch from 'node-fetch'
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${body.apiKey}`,
            'Content-Type': 'application/json'
        }
    })
    const data = await response.json()
    return data
})