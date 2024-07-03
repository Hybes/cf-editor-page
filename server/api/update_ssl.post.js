import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
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
  } catch (error) {
    console.error('DNS Editor: Error Making PATCH request to update SSL', error);
    throw error;
  }
});
