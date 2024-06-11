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
  let data = await response.json();
  if (data.result_info.total_pages > 1) {
    for (let i = 2; i <= data.result_info.total_pages; i++) {
      const response = await fetch(`https://api.cloudflare.com/client/v4/zones?page=${i}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${body.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      const data2 = await response.json();
      data.result = data.result.concat(data2.result);
    }
  }

  // Loop over each returned record ID and fetch SSL recommendations
  for (const zone of data.result) {
    const sslResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zone.id}/ssl/recommendation`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${body.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const sslData = await sslResponse.json();
    zone.ssl_recommendation = sslData;
  }
  return data;
});
