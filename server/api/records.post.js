import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
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
    let data = await response.json();
    
    // Handle non-successful responses
    if (!data.success) {
      console.error('DNS Editor: Error fetching records:', data.errors);
      return { success: false, errors: data.errors || [{ message: 'Unknown error fetching records' }] };
    }
    
    // Ensure result exists
    if (!data.result) {
      data.result = [];
    }
    
    // Check for pagination
    if (data.result_info && data.result_info.total_pages > 1) {
      try {
        for (let i = 2; i <= data.result_info.total_pages; i++) {
          const pageResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/?page=${i}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${body.apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
          const pageData = await pageResponse.json();
          
          if (pageData.success && pageData.result) {
            data.result = data.result.concat(pageData.result);
          } else {
            console.error(`DNS Editor: Error fetching page ${i} of records:`, pageData.errors);
          }
        }
      } catch (paginationError) {
        console.error('DNS Editor: Error during pagination of records', paginationError);
        // Continue with partial results rather than failing completely
      }
    }
    
    return data;
  } catch (error) {
    console.error('DNS Editor: Error Making GET request for records', error);
    return {
      success: false,
      errors: [{ message: `Error fetching DNS records: ${error.message}` }]
    };
  }
});
