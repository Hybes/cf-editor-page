import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
    const bodyToSend = {};

    if (body.data) {
      bodyToSend.data = body.data;
      const dnsName = body.data.service + '.' + body.data.proto + '.' + body.data.name;
      bodyToSend.name = dnsName;
      bodyToSend.type = 'SRV';
    }

    if (body.dns && body.dns.type !== 'SRV') {
      bodyToSend.content = body.dns.content;
      bodyToSend.name = body.dns.name;
      bodyToSend.proxied = body.dns.proxied;
      bodyToSend.type = body.dns.type;
      bodyToSend.comment = body.dns.comment || '';
      bodyToSend.ttl = Number.isInteger(body.dns.ttl) ? body.dns.ttl : Number(body.dns.ttl) || 1;
    }

    if (body.dns && body.dns.priority !== undefined) {
      bodyToSend.priority = Number(body.dns.priority) || 0;
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/`,
      {
        method: 'POST',
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
    console.error('DNS Editor: Error Making POST request to update record', error);
    throw error;
  }
});
