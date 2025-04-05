import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
    const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${body.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    let data = await response.json();
    
    // Check if result_info exists before accessing
    if (data && data.result_info && data.result_info.total_pages > 1) {
      for (let i = 2; i <= data.result_info.total_pages; i++) {
        try {
          const response = await fetch(`https://api.cloudflare.com/client/v4/zones?page=${i}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${body.apiKey}`,
              'Content-Type': 'application/json',
            },
          });
          const data2 = await response.json();
          if (data2 && data2.result) {
            data.result = data.result.concat(data2.result);
          }
        } catch (error) {
          console.error('DNS Editor: Error Making paginated request', error);
        }
      }
    }

    // Loop over each returned record ID and fetch SSL recommendations if getSsl is true
    if (body.getSsl && data && data.result) {
      for (const zone of data.result) {
        try {
          if (!zone || !zone.id) continue;
          
          const sslResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zone.id}/settings/ssl`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${body.apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const sslData = await sslResponse.json();
          if (sslData && sslData.success) {
            zone.ssl = sslData;
          }
        } catch (error) {
          console.error('DNS Editor: Error Making SSL request', error);
        }
      }
    }
    
    // If data.result doesn't exist, set it to an empty array
    if (!data.result) {
      data.result = [];
    }
    
    return data;
  } catch (error) {
    console.error('DNS Editor: Error Making initial zones request', error);
    return {
      success: false,
      errors: [{ message: error.message || 'Unknown error' }],
      result: []
    };
  }
});
