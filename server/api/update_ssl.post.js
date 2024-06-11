import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bodyToSend = {
    value: body.ssl,
  };
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${body.currZone}/settings/ssl`,
    {
      method: 'PATCH',
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
