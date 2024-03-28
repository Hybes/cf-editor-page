import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bodyToSend = {};
  if (body.data) {
    bodyToSend.data = body.data;
    const dnsName = body.data.service + '.' + body.data.proto + '.' + body.data.name;
    bodyToSend.name = dnsName;
    bodyToSend.type = 'SRV';
  }
  if (body.dns) {
    bodyToSend.dns = body.dns;
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
});
