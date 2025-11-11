# Deployment Guide - Analogy Maker

## Prerequisites
- A Netlify account (free tier works)
- Your Google Gemini API key
- Git installed (optional but recommended)

## Option 1: Deploy via Netlify UI (Easiest)

### Step 1: Prepare Your Files
1. Make sure all files are in the `analogy-maker` folder
2. The folder should contain:
   - `index.html`
   - `style.css`
   - `script.js`
   - `netlify.toml`
   - `netlify/functions/generate-analogy.js`

### Step 2: Deploy to Netlify
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your entire `analogy-maker` folder
4. Wait for deployment to complete

### Step 3: Add Your API Key (IMPORTANT!)
1. In Netlify dashboard, go to your site
2. Click "Site configuration" → "Environment variables"
3. Click "Add a variable"
4. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `key_here` (replace with your actual API key)
5. Click "Save"
6. Go to "Deploys" and click "Trigger deploy" → "Deploy site"

### Step 4: Test
1. Visit your site URL (e.g., `your-site-name.netlify.app`)
2. Try generating an analogy
3. Check that it works!

## Option 2: Deploy via Git/GitHub (Recommended for updates)

### Step 1: Initialize Git Repository
```bash
cd analogy-maker
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/yourusername/analogy-maker.git
git branch -M main
git push -u origin main
```

### Step 3: Connect to Netlify
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Build settings are already configured in `netlify.toml`
5. Click "Deploy site"

### Step 4: Add Environment Variable
1. In Netlify dashboard, go to "Site configuration" → "Environment variables"
2. Add `GEMINI_API_KEY` with your API key value
3. Redeploy the site

## Updating Your Site

### Via Netlify UI:
- Just drag and drop your folder again to deploy updates

### Via Git:
```bash
git add .
git commit -m "Update description"
git push
```
Netlify will automatically redeploy!

## Important Notes

✅ **Your API key is now secure** - It's stored as an environment variable on Netlify's servers and never exposed to the browser

✅ **No one can steal your key** - Even if they inspect your code in the browser

✅ **Usage tracking still works** - The client-side counter continues to track your local usage

⚠️ **Environment variables** - Make sure you set `GEMINI_API_KEY` in Netlify dashboard

⚠️ **Local development** - The Netlify Function won't work locally unless you use Netlify CLI (see below)

## Testing Locally with Netlify Functions (Optional)

If you want to test the Netlify Function on your local machine:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to your project
cd analogy-maker

# Create a .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start local dev server
netlify dev
```

Then open http://localhost:8888 in your browser.

## Troubleshooting

**Function not working?**
- Make sure `GEMINI_API_KEY` is set in Netlify environment variables
- Check Netlify function logs: Site → Functions → generate-analogy → Logs

**Site not updating?**
- Clear deploy cache: Deploys → Trigger deploy → Clear cache and deploy site

**Need help?**
- Check Netlify function logs for errors
- Verify your API key is valid at https://aistudio.google.com/app/apikey
