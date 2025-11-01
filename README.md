# 💊 MedTracker - Medication Reminder & Tracker

A comprehensive medication management Progressive Web App (PWA) designed for chronic illness warriors.

## ✨ Features

### Core Functionality
- ✅ **Add Medications** - Single entry or bulk paste from a list
- ✅ **Daily Schedule** - See all medications organized by time
- ✅ **Reminders** - Browser notifications at medication times
- ✅ **Track Adherence** - Mark medications as taken or missed
- ✅ **History** - View complete medication tracking history
- ✅ **Statistics** - Track daily adherence, 7-day percentage, and streaks

### Export & Sharing
- 📋 **Copy to Clipboard** - Quick text format for forms
- 🖨️ **Print** - Clean, professional medication list for doctor visits
- 📄 **PDF Export** - Save medication list as PDF

### Advanced Features
- 📱 **Mobile-Friendly** - Works perfectly on phones and tablets
- 🔔 **Smart Notifications** - Reminds you at medication times
- 💾 **Offline Storage** - Works without internet (localStorage)
- 📊 **Adherence Tracking** - Visual statistics and streak tracking
- ⏰ **Auto-Missed Detection** - Automatically marks missed doses

## 📁 Files Included

- `index.html` - Main app interface
- `app.js` - Complete functionality
- `manifest.json` - PWA configuration
- `README.md` - This file

## 🚀 Quick Start

### Option 1: Local Testing
1. Open `index.html` in your web browser
2. Start adding medications!

### Option 2: Deploy to Netlify (Recommended)

**Step 1: Prepare Files**
```powershell
# In your MedTracker directory
git init
git add .
git commit -m "Initial MedTracker commit"
```

**Step 2: Create GitHub Repository**
1. Go to GitHub.com
2. Create new repository "MedTracker"
3. Follow instructions to push code:
```powershell
git remote add origin https://github.com/YOUR-USERNAME/MedTracker.git
git branch -M main
git push -u origin main
```

**Step 3: Deploy to Netlify**
1. Go to [Netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your MedTracker repository
4. Click "Deploy site"
5. Your app will be live in minutes!

**Step 4: Custom Domain (Optional)**
- In Netlify, go to Site settings → Domain management
- Add custom domain like `meds.claudeweidner.com`

## 📱 Installation as Mobile App

Once deployed, users can install MedTracker as a mobile app:

**On iPhone/iPad:**
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**On Android:**
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Tap "Install app" or "Add to Home screen"

## 💡 Usage Guide

### Adding Medications

**Single Entry:**
1. Go to "Add Medication" tab
2. Fill in medication details
3. Select frequency (once, twice, etc.)
4. Set specific times
5. Click "Add Medication"

**Bulk Paste:**
1. Go to "Add Medication" tab
2. Click "Bulk Paste" button
3. Paste medication list in format:
   ```
   Medication Name | Dosage | Frequency | Times (comma-separated)
   
   Example:
   Aspirin | 500mg | Once daily | 8:00 AM
   Metformin | 850mg | Twice daily | 8:00 AM, 8:00 PM
   ```
4. Click "Import Medications"

### Daily Use

**Morning Routine:**
1. Open "Today's Schedule" tab
2. View medications due today
3. Mark each as "Taken" when you take it

**Notifications:**
- Enable browser notifications when prompted
- You'll receive reminders at medication times
- Click notification to open app and mark taken

### Tracking Adherence

**View Statistics:**
- Today's count: Number of medications taken
- 7-Day adherence: Percentage over the last week
- Streak: Consecutive days with 100% adherence

**Review History:**
- Go to "History" tab
- See all past medication records
- Grouped by date for easy review

### For Doctor Visits

**Option 1: Print**
1. Go to "Export/Print" tab
2. Review preview
3. Click "Print List"
4. Print or save as PDF

**Option 2: Copy**
1. Go to "Export/Print" tab
2. Click "Copy to Clipboard"
3. Paste into medical forms or emails

## 🎨 Customization

Want to match SpoonSync™ branding? Edit the CSS in `index.html`:

```css
/* Change to SpoonSync purple gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🔧 Technical Details

- **Storage:** localStorage (client-side, private)
- **Framework:** Vanilla JavaScript (no dependencies)
- **Notifications:** Browser Notification API
- **PWA:** Installable with manifest.json
- **Mobile:** Fully responsive design
- **Offline:** Works without internet

## 📊 Data Privacy

- All data stored locally on your device
- No server, no database, no tracking
- Complete privacy and security
- Export your data anytime

## 🔜 Future Enhancements

Potential features for v2:
- Supabase sync across devices
- Medication interaction checker
- Refill reminder based on quantity
- Photo logging for symptoms
- Integration with SpoonSync™

## 🆘 Troubleshooting

**Notifications not working?**
- Check browser notification permissions
- Ensure app is open or installed as PWA
- Try refreshing the page

**Data disappeared?**
- Check if localStorage was cleared
- Make sure you're on the same device/browser
- Consider exporting data regularly as backup

**Bulk paste not working?**
- Verify format with pipe separators: `Name | Dosage | Frequency | Times`
- Check time format: use "8:00 AM" or "20:00"

## 📞 Support

For issues or questions:
- Email: breakthechainswarriors@gmail.com
- Website: breakthechains.life

## 📄 License

© 2025 MedTracker by Claude Weidner
Part of the Break The Chains™ ecosystem

---

**Built for chronic illness warriors** 💜
