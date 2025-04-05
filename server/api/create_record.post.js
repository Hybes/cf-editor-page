import fetch from 'node-fetch';
export default defineEventHandler(async (event) => {
  try {
    const body = JSON.parse(await readBody(event));
    const bodyToSend = {};

    // Handle SRV records
    if (body.data) {
      // Validate required SRV fields
      if (!body.data.service || !body.data.proto || !body.data.name || !body.data.target) {
        return {
          success: false,
          errors: [{ message: "Missing required SRV fields (service, proto, name, target)" }]
        };
      }

      bodyToSend.data = body.data;
      
      // Ensure numeric values are numbers
      if (body.data.port) bodyToSend.data.port = Number(body.data.port);
      if (body.data.priority) bodyToSend.data.priority = Number(body.data.priority);
      if (body.data.weight) bodyToSend.data.weight = Number(body.data.weight);
      
      // Construct the SRV name
      const dnsName = body.data.service + '.' + body.data.proto + '.' + body.data.name;
      bodyToSend.name = dnsName;
      bodyToSend.type = 'SRV';
      bodyToSend.ttl = 1; // Default to auto
    }
    // Handle other record types
    else if (body.dns) {
      if (!body.dns.type) {
        return {
          success: false,
          errors: [{ message: "Record type is required" }]
        };
      }

      if (body.dns.type !== 'SRV') {
        if (!body.dns.name || !body.dns.content) {
          return {
            success: false,
            errors: [{ message: "Name and content are required" }]
          };
        }
        
        bodyToSend.content = body.dns.content;
        bodyToSend.name = body.dns.name;
        bodyToSend.proxied = body.dns.proxied || false;
        bodyToSend.type = body.dns.type;
        bodyToSend.comment = body.dns.comment || '';
        bodyToSend.ttl = Number.isInteger(body.dns.ttl) ? body.dns.ttl : Number(body.dns.ttl) || 1;
      }

      if (body.dns.priority !== undefined) {
        bodyToSend.priority = Number(body.dns.priority) || 0;
      }
    } else {
      return {
        success: false,
        errors: [{ message: "Invalid request: missing DNS data" }]
      };
    }

    if (!body.currZone) {
      return {
        success: false,
        errors: [{ message: "Zone ID is required" }]
      };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${body.currZone}/dns_records/`,
      {
        method: 'POST',
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
    console.error('DNS Editor: Error Making POST request to create record', error);
    return {
      success: false,
      errors: [{ message: error.message || 'Unknown error occurred' }]
    };
  }
});
