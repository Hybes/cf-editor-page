import fetch from 'node-fetch'
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/${body.currDnsRecord}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${body.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: body.dns.content,
            name: body.dns.name,
            proxied: body.dns.proxied,
            type: body.dns.type,
            comment: body.dns.comment,
            ttl: body.dns.ttl
        })
    })
    const data = await response.json()
    return data
})