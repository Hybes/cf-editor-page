import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${body.currZone}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    
    // Handle non-successful response for zone fetch
    if (!data.success) {
      console.error('DNS Editor: Error fetching zone:', data.errors);
      return { 
          success: false, 
          errors: data.errors || [{ message: 'Unknown error fetching zone' }]
      };
    }

    try {
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
      
      if (sslData.success) {
        data.result.ssl = sslData.result;
      } else {
        console.error('DNS Editor: Error fetching SSL settings:', sslData.errors);
        // Don't fail the whole request if SSL settings can't be fetched, just log the error
        data.result.ssl = { value: 'unknown' };
      }
    } catch (sslError) {
      console.error('DNS Editor: Error Making GET request for SSL settings', sslError);
      // Don't fail the whole request if SSL settings can't be fetched
      data.result.ssl = { value: 'unknown' };
    }

    return data;
  } catch (error) {
    console.error('DNS Editor: Error Making GET request for zone', error);
    return {
      success: false,
      errors: [{ message: `Error fetching zone: ${error.message}` }]
    };
  }
});
