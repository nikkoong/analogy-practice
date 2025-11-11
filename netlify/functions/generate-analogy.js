exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  let requestData;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' })
    };
  }

  const { concept1, concept2 } = requestData;

  if (!concept1 || !concept2) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Both concepts are required' })
    };
  }

  try {
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
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
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
