// Use Netlify Function instead of direct API call (keeps API key secure)
const API_URL = '/.netlify/functions/generate-analogy';

// Rate limit configuration (Gemini 2.5 Flash-Lite free tier)
const DAILY_LIMIT = 1000; // Free tier RPD limit
const STORAGE_KEY = 'gemini_usage_data';

// DOM elements
const concept1Input = document.getElementById('concept1');
const concept2Input = document.getElementById('concept2');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const errorMessage = document.getElementById('errorMessage');
const usageTrigger = document.getElementById('usageTrigger');
const usagePanel = document.getElementById('usagePanel');
const closePanel = document.getElementById('closePanel');
const requestCount = document.getElementById('requestCount');
const dailyLimit = document.getElementById('dailyLimit');
const usageProgress = document.getElementById('usageProgress');
const usagePercent = document.getElementById('usagePercent');

// Clean output text
const cleanOutput = (text) => {
    // Remove em dashes
    let cleaned = text.replace(/—/g, '-');
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*/g, ''); // Bold
    cleaned = cleaned.replace(/\*/g, ''); // Italics/bullets
    cleaned = cleaned.replace(/^#+\s+/gm, ''); // Headers
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links [text](url) -> text
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Inline code
    
    // Remove common AI phrases (case insensitive)
    const aiPhrases = [
        /it'?s worth noting that?\s*/gi,
        /in conclusion,?\s*/gi,
        /ultimately,?\s*/gi,
        /let'?s delve into\s*/gi,
        /delve into\s*/gi,
    ];
    
    aiPhrases.forEach(phrase => {
        cleaned = cleaned.replace(phrase, '');
    });
    
    return cleaned.trim();
};

// Show error
const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    outputSection.classList.add('hidden');
};

// Hide error
const hideError = () => {
    errorMessage.classList.add('hidden');
};

// Generate analogy
const generateAnalogy = async () => {
    const concept1 = concept1Input.value.trim();
    const concept2 = concept2Input.value.trim();
    
    // Validate inputs
    if (!concept1 || !concept2) {
        showError('Please enter both concepts to compare.');
        return;
    }
    
    // Check rate limit
    if (!checkRateLimit()) {
        showError(`Daily limit of ${DAILY_LIMIT} requests reached. Resets at midnight PT.`);
        return;
    }
    
    hideError();
    
    // Show loading state
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    outputSection.classList.add('hidden');
    
    try {
        // Call Netlify Function instead of direct API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                concept1: concept1,
                concept2: concept2
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle rate limit error specifically
            if (response.status === 429) {
                generateBtn.disabled = true; // Disable button
                showError(errorData.error || 'Daily limit reached');
                
                // Update usage display to show we're at limit
                if (errorData.usage) {
                    requestCount.textContent = errorData.usage.current;
                    usageProgress.style.width = '100%';
                    usagePercent.textContent = '100%';
                }
                return;
            }
            
            throw new Error(errorData.error || 'Failed to generate analogy');
        }
        
        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        const cleanedText = cleanOutput(generatedText);
        
        // Display output
        output.textContent = cleanedText;
        outputSection.classList.remove('hidden');
        
        // Update usage count (client-side tracking)
        incrementUsage();
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Error: ${error.message}. Please check your API key and try again.`);
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
    }
};

// Copy to clipboard
const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(output.textContent);
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
    }
};

// Event listeners
generateBtn.addEventListener('click', generateAnalogy);

// Allow Enter key to submit
concept1Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateAnalogy();
    }
});

concept2Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateAnalogy();
    }
});

copyBtn.addEventListener('click', copyToClipboard);

// Usage tracking functions
const getUsageData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return { count: 0, date: new Date().toDateString() };
    }
    
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // Reset count if it's a new day
    if (data.date !== today) {
        return { count: 0, date: today };
    }
    
    return data;
};

const saveUsageData = (count) => {
    const data = {
        count: count,
        date: new Date().toDateString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const updateUsageDisplay = () => {
    const usage = getUsageData();
    const percentage = Math.min((usage.count / DAILY_LIMIT) * 100, 100);
    
    requestCount.textContent = usage.count;
    dailyLimit.textContent = DAILY_LIMIT;
    usageProgress.style.width = `${percentage}%`;
    usagePercent.textContent = `${Math.round(percentage)}%`;
    
    // Disable generate button if at limit
    if (usage.count >= DAILY_LIMIT) {
        generateBtn.disabled = true;
        showError(`Daily limit of ${DAILY_LIMIT} requests reached. Resets at midnight PT.`);
    }
};

const incrementUsage = () => {
    const usage = getUsageData();
    usage.count += 1;
    saveUsageData(usage.count);
    updateUsageDisplay();
};

const checkRateLimit = () => {
    const usage = getUsageData();
    return usage.count < DAILY_LIMIT;
};

// Panel toggle
usageTrigger.addEventListener('click', () => {
    usagePanel.classList.toggle('hidden');
    updateUsageDisplay();
});

closePanel.addEventListener('click', () => {
    usagePanel.classList.add('hidden');
});

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    if (!usagePanel.contains(e.target) && !usageTrigger.contains(e.target)) {
        usagePanel.classList.add('hidden');
    }
});

// Initialize usage display on page load
updateUsageDisplay();
