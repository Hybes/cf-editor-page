import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
    const bodyToSend = {
      content: body.dns.content,
      name: body.dns.name,
      proxied: body.dns.proxied,
      type: body.dns.type,
      comment: body.dns.comment || '',
      ttl: Number.isInteger(body.dns.ttl) ? body.dns.ttl : Number(body.dns.ttl) || 1,
    };
    if (body.dns.data) {
      bodyToSend.data = body.dns.data;
    }
    if (body.dns.priority !== undefined) {
      bodyToSend.priority = Number(body.dns.priority) || 0;
    }
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/${body.currDnsRecord}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${body.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyToSend),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DNS Editor: Error Making PUT request to update record', error);
    throw error;
  }
});
