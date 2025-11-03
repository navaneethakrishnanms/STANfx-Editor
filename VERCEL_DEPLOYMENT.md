# 🚀 Vercel Deployment Guide for STANfx Editor

## ✅ Prerequisites Completed
- ✓ Code pushed to GitHub: https://github.com/navaneethakrishnanms/STANfx-Editor.git
- ✓ Git repository initialized and synced
- ✓ **Stable Diffusion API key already configured in code** - No env variables needed!

---

## 📋 Step-by-Step Deployment Instructions

### 1️⃣ Sign Up / Log In to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

### 2️⃣ Import Your Project
1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"STANfx-Editor"** repository
4. Click **"Import"** next to it

### 3️⃣ Configure Project Settings
Vercel will auto-detect your Vite project. Configure as follows:

#### **Framework Preset**
- Should auto-detect as **"Vite"** ✅
- If not, select **"Vite"** from dropdown

#### **Build Settings**
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)
- **Install Command**: `npm install` (default)

#### **Environment Variables** (IMPORTANT!)

✅ **Good News**: Your Stability AI API key is already hardcoded in the app, so **NO environment variables are required** for basic deployment!

**Optional Environment Variables** (if needed):
Click **"Environment Variables"** and add only if you want to:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `VITE_STABILITY_API_KEY` | Your Stability AI API Key | Optional - already hardcoded in code |

⚠️ **Note**: 
- Your app uses **Stable Diffusion only** for image generation
- The API key is already in your code, so the app will work immediately after deployment
- You can skip the environment variables section unless you want to override the hardcoded key

### 4️⃣ Deploy
1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-3 minutes)
3. You'll see a success screen with your live URL!

### 5️⃣ Get Your Live URL
Your app will be live at:
```
https://stanfx-editor.vercel.app
```
or a similar URL provided by Vercel.

---

## 🔧 Post-Deployment Configuration

### Setting Up Custom Domain (Optional)
1. Go to your project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### Update Environment Variables
If you need to update API keys:
1. Go to **"Settings"** → **"Environment Variables"**
2. Edit or add new variables
3. **Important**: Redeploy for changes to take effect

---

## 📱 Vercel CLI (Alternative Method)

You can also deploy using Vercel CLI:

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Navigate to your project
cd "c:\Users\nk\stanfx-final (3)"

# Login to Vercel
vercel login

# Deploy (first time - follow prompts)
vercel

# Deploy to production
vercel --prod
```

---

## 🔍 Troubleshooting

### Build Fails?
- **Check Dependencies**: Ensure `package.json` has all required dependencies
- **Build Logs**: Check Vercel build logs for specific errors
- **Node Version**: Vercel uses Node 18+ by default (should work fine)

### App Loads but Image Generation Doesn't Work?
- **API Key**: Your Stability AI key is hardcoded (already configured ✅)
- **Browser Console**: Check for any API errors or rate limits
- **API Status**: Verify Stability AI service is operational

### Blank Page?
- Check browser console for errors
- Verify `index.html` is in the root directory
- Check Vercel logs for runtime errors

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard Features
- **Analytics**: Track visitor metrics
- **Logs**: Real-time function logs
- **Deployments**: History of all deployments
- **Speed Insights**: Performance monitoring

---

## 🔄 Updating Your App

Every time you push to GitHub:
```powershell
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will **automatically rebuild and deploy** your changes! 🎉

---

## 🎯 Quick Checklist

- [ ] GitHub repository created and pushed ✅
- [ ] Vercel account created/logged in
- [ ] Project imported from GitHub
- [ ] ~~Environment variables added~~ (Not needed - API key hardcoded! ✅)
- [ ] Initial deployment successful
- [ ] App tested and working
- [ ] Custom domain configured (optional)

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **Vercel Discord**: https://vercel.com/discord

---

## 🎉 Success!

Once deployed, share your app:
- **Production URL**: Your Vercel domain
- **GitHub Repo**: https://github.com/navaneethakrishnanms/STANfx-Editor.git

Happy Deploying! 🚀
