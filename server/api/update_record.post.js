import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));

    if (!body.dns || !body.dns.type) {
      return {
        success: false,
        errors: [{ message: "Invalid DNS data: 'type' is required" }]
      };
    }

    const bodyToSend = {
      type: body.dns.type,
      comment: body.dns.comment || '',
      ttl: Number.isInteger(body.dns.ttl) ? body.dns.ttl : Number(body.dns.ttl) || 1,
    };

    // Handle different record types appropriately
    if (body.dns.type === 'SRV') {
      if (!body.dns.data) {
        return {
          success: false,
          errors: [{ message: "Missing SRV data" }]
        };
      }
      
      bodyToSend.data = body.dns.data;
      bodyToSend.name = body.dns.name;
      
      // Ensure all numeric SRV fields are numbers
      if (body.dns.data.port) bodyToSend.data.port = Number(body.dns.data.port);
      if (body.dns.data.priority) bodyToSend.data.priority = Number(body.dns.data.priority);
      if (body.dns.data.weight) bodyToSend.data.weight = Number(body.dns.data.weight);
      
      if (body.dns.priority !== undefined) {
        bodyToSend.priority = Number(body.dns.priority) || 0;
      }
    } else {
      // For non-SRV records
      bodyToSend.content = body.dns.content;
      bodyToSend.name = body.dns.name;
      bodyToSend.proxied = body.dns.proxied;
      
      if (body.dns.priority !== undefined) {
        bodyToSend.priority = Number(body.dns.priority) || 0;
      }
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/${body.currDnsRecord}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${body.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyToSend),
      }
    );
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      const errorData = await response.json();
      return {
        success: false,
        errors: errorData.errors || [{ message: `HTTP Error: ${response.status}` }]
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DNS Editor: Error Making PUT request to update record', error);
    return {
      success: false,
      errors: [{ message: error.message || 'Unknown error occurred' }]
    };
  }
});
