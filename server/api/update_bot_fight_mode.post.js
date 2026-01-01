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

    if (typeof body.fight_mode !== 'boolean') {
      return { success: false, errors: [{ message: 'fight_mode must be a boolean' }] };
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}/bot_management`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fight_mode: body.fight_mode }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DNS Editor: Error updating bot fight mode', error);
    return {
      success: false,
      errors: [{ message: error.message || 'Unknown error occurred' }],
    };
  }
});


