import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  if (data.result_info.total_pages > 1) {
    for (let i = 2; i <= data.result_info.total_pages; i++) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/?page=${i}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${body.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data2 = await response.json();
      data.result = data.result.concat(data2.result);
    }
  }
  return data;
});
