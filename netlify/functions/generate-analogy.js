// Netlify serverless function to proxy Gemini API requests
// This keeps your API key secure on the server side

// Import Netlify Blobs for server-side rate limiting
const { getStore } = require('@netlify/blobs');

// Rate limit configuration
const DAILY_LIMIT = 1000;

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get API key from environment variable
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  // STEP 1: Initialize Netlify Blobs store
  // This creates/accesses a "database" called 'rate-limit'
  const store = getStore('rate-limit');
  
  // STEP 2: Get current usage data
  // We store it as JSON with count and date
  const usageData = await store.get('daily-usage', { type: 'json' });
  const today = new Date().toISOString().split('T')[0]; // Format: "2025-11-11"
  
  // STEP 3: Check if we need to reset the counter (new day)
  let currentCount = 0;
  if (usageData && usageData.date === today) {
    // Same day, use existing count
    currentCount = usageData.count;
  }
  // If different day or no data, currentCount stays 0 (fresh start)
  
  // STEP 4: Check if we've hit the limit
  if (currentCount >= DAILY_LIMIT) {
    return {
      statusCode: 429, // 429 = Too Many Requests
      body: JSON.stringify({ 
        error: `Daily limit of ${DAILY_LIMIT} requests reached. Resets at midnight PT.`,
        usage: {
          current: currentCount,
          limit: DAILY_LIMIT,
          resetDate: today
        }
      })
    };
  }

  try {
    // Parse request body
    const { concept1, concept2 } = JSON.parse(event.body);
    
    // Validate inputs
    if (!concept1 || !concept2) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Both concepts are required' })
      };
    }

    // Create the prompt
    const prompt = `You are a creative linguist and etymologist. Compare these two concepts and draw an analogy between them. 

Begin with exactly this format:
**Summary:** [one concise sentence capturing the core similarity]

Only if both concepts are a single word, start immediately with etymology, then move directly into the conceptual comparison. Focus 80% of the text on the analogy itself—the actual comparison and parallels. Be concise and direct. Write exactly 350 words total (including the summary sentence) in a sharp, declarative tone. Write like a human with something interesting to say.

CRITICAL RULES:
• Use "X, Y, and Z" list format MAXIMUM once in the entire text
• NO AI-sounding words: delve, embark, facilitate, maximize, leverage, utilize, robust, seamless, innovative, dynamic, transformative, realm, landscape, tapestry, testament, underscores
• NO transitional phrases: moreover, furthermore, additionally, however, nevertheless, nonetheless, indeed, certainly, accordingly, thus, hence, consequently, arguably, undoubtedly
• NO setup phrases: "at first glance", "it's worth noting", "in conclusion", "in summary", "ultimately", "let's", "now", "this is not exhaustive"
• NO connector words: "similarly", "just as", "in both cases", "on the contrary"
• NO vague filler: "exciting", "valuable", "important", "significant", "various", "numerous", "several"
• NO meta-commentary about the analogy itself
• Do not use em dashes (—)

Concept 1: ${concept1}
Concept 2: ${concept2}

Create your analogy:`;

    // Call Gemini API
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate analogy');
    }

    const data = await response.json();
    
    // STEP 5: Increment the counter AFTER successful API call
    // This ensures we only count successful requests
    const newCount = currentCount + 1;
    await store.set('daily-usage', JSON.stringify({
      count: newCount,
      date: today
    }));
    
    // Return the response with usage info
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        usage: {
          current: newCount,
          limit: DAILY_LIMIT,
          remaining: DAILY_LIMIT - newCount
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error'
      })
    };
  }
};
