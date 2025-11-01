# MedTracker - PowerShell Deployment Guide

## 📂 Setup on Your PC

### Step 1: Move Files to Your Directory
```powershell
# Create MedTracker directory
New-Item -ItemType Directory -Path "C:\Users\claud\OneDrive\Desktop\Claude Companies\Medication Tracker"

# Copy all files there from your downloads
# (or manually move: index.html, app.js, manifest.json, README.md)
```

### Step 2: Test Locally
```powershell
# Navigate to directory
cd "C:\Users\claud\OneDrive\Desktop\Claude Companies\Medication Tracker"

# Open in browser
start index.html
```

## 🚀 Deploy to GitHub & Netlify

### Step 1: Initialize Git
```powershell
cd "C:\Users\claud\OneDrive\Desktop\Claude Companies\Medication Tracker"
git init
git add .
git commit -m "Initial MedTracker commit"
```

### Step 2: Push to GitHub
```powershell
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR-USERNAME/MedTracker.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Netlify
1. Go to netlify.com
2. "Add new site" → "Import existing project"
3. Choose GitHub → Select MedTracker repo
4. Click "Deploy site"
5. Done! ✅

## 🔄 Making Updates Later

After making changes to files:
```powershell
git add .
git commit -m "Updated medication features"
git push origin main
```
Netlify will auto-deploy in ~30 seconds!

## 🌐 Custom Domain Setup

**Option 1: Subdomain (meds.claudeweidner.com)**
1. In Netlify: Site settings → Domain management
2. Add custom domain: `meds.claudeweidner.com`
3. In GoDaddy: Add CNAME record pointing to Netlify

**Option 2: Keep Simple (medtracker.netlify.app)**
- No setup needed, works immediately!

## 💡 Pro Tips

**Local Development:**
```powershell
# Use VS Code for editing
code .

# Or notepad
notepad index.html
```

**Quick Test:**
```powershell
# Just double-click index.html
# Or in PowerShell:
start index.html
```

**Git Shortcuts:**
```powershell
# One-liner for commit & push
git add .; git commit -m "update"; git push origin main
```

## 🎨 Integration with SpoonSync™

Later, you can add this to your SpoonSync app:
1. Copy files to SpoonSync directory
2. Add link in navigation: `<a href="meds.html">Medications</a>`
3. Match the purple gradient theme
4. Deploy together!

---

Questions? You know where to find me! 😊
