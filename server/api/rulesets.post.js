import fetch from 'node-fetch';

export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));

    if (!body.apiKey) {
      return { success: false, errors: [{ message: 'API key is required' }] };
    }

    if (!body.currZone) {
      return { success: false, errors: [{ message: 'Zone ID is required' }] };
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}/rulesets`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DNS Editor: Error fetching rulesets', error);
    return {
      success: false,
      errors: [{ message: error.message || 'Unknown error occurred' }],
    };
  }
});


