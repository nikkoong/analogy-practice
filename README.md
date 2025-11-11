# Analogy Maker - Development Requirements

## Project Overview
A minimal webapp that creates creative analogies between two seemingly unrelated concepts using etymology and linguistic connections. Built with pure HTML/CSS/JS for maximum simplicity and minimal dependencies.

## Technical Stack
- **Frontend**: Pure HTML, CSS, and vanilla JavaScript (no frameworks, no build tools)
- **LLM API**: Google Gemini Flash 1.5 (generous free tier, fast, affordable)
- **Hosting**: Local development first, Netlify deployment later
- **Total Files**: 3 files maximum (index.html, style.css, script.js)

## Features

### User Interface
- **Dark theme** with modern minimalist design
- **Serif fonts** in white for elegant typography
- Two text input fields for entering concepts to compare
- Single submit button to generate analogy
- Output text area displaying the generated analogy
- Copy button to copy the result to clipboard

### Functionality
1. User enters two different concepts (e.g., "miso" and "misogyny")
2. On submit, send both terms to Google Gemini API with system prompt
3. Display generated analogy in output area
4. Allow user to copy the result

### LLM Integration
- **API**: Google Gemini Flash 1.5 (free tier: 15 RPM, 1 million TPM, 1500 RPD)
- **API Key**: Client-side implementation (exposed in code - acceptable for local/personal use)
- **System Prompt**: Designed to generate natural-sounding analogies

## System Prompt Design

```
You are a creative linguist and etymologist. Compare the following two concepts and create an analogy between them. Focus primarily on etymology if relevant, but also explore phonetic similarities, cultural connections, or conceptual parallels. Write exactly 350 words in a natural, conversational tone. Do not use em dashes (—), avoid overly formal or AI-typical phrases like "delve into," "it's worth noting," "in conclusion," or "ultimately." Write as a human would: direct, engaging, and insightful.

Concept 1: {input1}
Concept 2: {input2}

Create your analogy:
```

## Design Specifications

### Color Scheme (Dark Theme)
- Background: Deep dark gray/black (#0a0a0a or similar)
- Text: White (#ffffff) or off-white (#f5f5f5)
- Accent: Subtle gray for borders/inputs (#2a2a2a)
- Hover states: Slightly lighter variants
- Button: Elegant contrast (white text on dark accent)

### Typography
- Primary font: Serif font (e.g., Georgia, Crimson Text, or Lora from Google Fonts)
- Font sizes: Large enough for readability, generous spacing
- Line height: 1.6-1.8 for comfortable reading

### Layout
- Centered design with max-width container (600-800px)
- Generous whitespace and padding
- Responsive design (mobile-friendly)
- Clean, uncluttered interface

### Components
1. **Header**: Simple title "Analogy Maker"
2. **Input Fields**: Two elegant text inputs with subtle borders, labeled clearly
3. **Submit Button**: Prominent, centered, with hover effect
4. **Output Area**: Text display with subtle border, good contrast
5. **Copy Button**: Small, positioned near output, provides feedback on click

## File Structure
```
analogy-maker/
├── index.html          # Main HTML structure
├── style.css           # All styling
├── script.js           # API calls and interaction logic
└── development.md      # This file
```

## Implementation Notes

### API Setup
1. Get free API key from Google AI Studio (https://makersuite.google.com/app/apikey)
2. Store API key in script.js as constant (will move to backend for production)
3. Use fetch API to call Gemini REST endpoint

### API Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}
```

### Error Handling
- Display friendly error messages if API fails
- Handle network errors gracefully
- Validate that both inputs are filled before submitting
- Show loading state during API call

### Output Processing
- Remove em dashes (—) if present in response
- Filter out common AI phrases if detected
- Ensure exactly 350 words (handled by prompt)

## Development Workflow
1. Create basic HTML structure
2. Style with CSS (dark theme, serif fonts)
3. Implement JavaScript API integration
4. Test with various concept pairs
5. Refine prompt based on output quality
6. Add polish (animations, transitions, micro-interactions)

## Future Enhancements (Post-MVP)
- Netlify Functions for API key security
- Local storage to save favorite analogies
- Share functionality
- Multiple comparison modes (optional)
- Rate limiting and caching

## Success Criteria
- ✅ Minimal codebase (3 files, no dependencies except Google Fonts)
- ✅ Beautiful, dark, minimalist interface
- ✅ Fast load times (<1s)
- ✅ Natural-sounding analogies (no AI-speak)
- ✅ Smooth user experience with proper feedback
- ✅ Works on all modern browsers
- ✅ Responsive design for mobile and desktop

## Testing Checklist
- [ ] Both inputs accept text correctly
- [ ] Submit button triggers API call
- [ ] Loading state displays during API call
- [ ] Output displays formatted analogy
- [ ] Copy button successfully copies to clipboard
- [ ] Error states handled gracefully
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile responsive
- [ ] Analogies sound human and natural
- [ ] Etymology focus when applicable

## Example Use Case
**Input 1**: miso  
**Input 2**: misogyny  

**Expected Output**: A 350-word analogy exploring the etymological roots of both terms, phonetic similarities, and creative connections between a fermented soybean paste and hatred toward women, written in natural, human-sounding prose.
