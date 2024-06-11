import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${body.apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();

  const sslResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${body.currZone}/settings/ssl`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const sslData = await sslResponse.json();
  data.result.ssl = sslData.result;

  return data;
});
