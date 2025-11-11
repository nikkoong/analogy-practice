// Simple function to check current usage without consuming quota
const { getStore } = require('@netlify/blobs');

const DAILY_LIMIT = 1000;

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the rate limit store
    const store = getStore('rate-limit');
    
    // Get current usage data
    const usageData = await store.get('daily-usage', { type: 'json' });
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we need to reset (new day)
    let currentCount = 0;
    if (usageData && usageData.date === today) {
      currentCount = usageData.count;
    }
    
    // Return current usage
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usage: {
          current: currentCount,
          limit: DAILY_LIMIT,
          remaining: DAILY_LIMIT - currentCount,
          resetDate: today
        }
      })
    };

  } catch (error) {
    console.error('Error fetching usage:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch usage data'
      })
    };
  }
};
