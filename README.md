# Analogy Maker

A minimal webapp that creates creative analogies between two seemingly unrelated concepts using etymology and linguistic connections.

## 🚀 Live Demo
[View on Netlify](https://your-site-name.netlify.app) _(replace with your URL)_

## ✨ Features
- Dark minimalist design with elegant serif typography
- 350-word analogies focusing on etymology and creative connections
- Natural, human-sounding output (no AI-speak)
- Usage tracking panel (local browser storage)
- Copy to clipboard functionality
- Fully responsive design

## 🛠 Tech Stack
- Pure HTML/CSS/JavaScript (no frameworks)
- Google Gemini 2.5 Flash-Lite API
- Netlify Functions (serverless backend)
- Deployed on Netlify

## 📦 Project Structure

```
analogy-maker/
├── index.html                          # Main HTML structure
├── style.css                           # All styling
├── script.js                           # Frontend logic and API calls
├── netlify.toml                        # Netlify configuration
├── netlify/functions/
│   └── generate-analogy.js            # Serverless function (keeps API key secure)
└── .gitignore                         # Git ignore file
```

## 🚀 Deployment to Netlify

### Prerequisites
- [Netlify account](https://app.netlify.com/) (free tier)
- [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier: 1000 requests/day)
- GitHub account

### Step 1: Push to GitHub

### Step 2: Deploy on Netlify
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Build settings are auto-configured via `netlify.toml`
5. Click "Deploy site"

### Step 3: Add Environment Variable
1. In Netlify dashboard → "Site configuration" → "Environment variables"
2. Add variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key
3. Go to "Deploys" → "Trigger deploy" → "Deploy site"

### Step 4: Done!
Visit your site at `https://analogy.netlify.app/`

## 🔧 Local Development

Open `index.html` in your browser. Note: Netlify Functions won't work locally unless you use Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run local dev server
netlify dev
```

Then visit `http://localhost:8888`

## 🔑 Security Note

Your API key is **securely stored** in Netlify's environment variables and never exposed to the browser. The Netlify Function acts as a proxy between your frontend and Google's API.

## 📝 Rate Limits

- **Free tier**: 1000 requests per day (resets at midnight PT)
- **Local tracking**: Browser-based counter to monitor your usage
- Click the white circle in bottom-right to view usage stats

## 🎨 Customization

Edit these files to customize:
- `style.css` - Colors, fonts, layout
- `script.js` - Daily limit, behavior
- `netlify/functions/generate-analogy.js` - System prompt, API settings

## 📄 License

MIT License - feel free to use and modify!
