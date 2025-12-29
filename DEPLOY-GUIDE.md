# 🎮 UNO Game - Deployment Guide

Your UNO game is ready to deploy! Follow these simple steps.

---

## 🚀 Quick Deployment (Choose ONE option)

### ✅ Option 1: Glitch (EASIEST - Recommended!)

**Why Glitch?**
- 100% FREE with WebSocket support
- No credit card needed
- Works immediately - no configuration needed!

**Steps:**

1. **Push to GitHub first** (if you haven't already):
   ```bash
   cd /mnt/c/Users/carlethanjustinev/Desktop/uno-game
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

   If you don't have a GitHub repo yet:
   ```bash
   # Create a new repo on github.com first, then:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

2. **Deploy to Glitch**:
   - Go to [glitch.com](https://glitch.com)
   - Sign up with your GitHub account
   - Click **"New Project"** → **"Import from GitHub"**
   - Paste your repository URL: `https://github.com/YOUR-USERNAME/YOUR-REPO-NAME`
   - Wait 30-60 seconds for Glitch to import and start your app
   - Click **"Show"** → **"In a New Window"**

3. **Share with friends!**
   - Your game URL: `https://YOUR-PROJECT-NAME.glitch.me`
   - Copy the URL and send to your friends
   - They can join and play from anywhere!

**That's it! Your game is now live! 🎉**

---

### ✅ Option 2: Railway (Also Free!)

**Why Railway?**
- Free $5 monthly credit (enough for small games)
- WebSocket support included
- Auto-deploys when you push to GitHub

**Steps:**

1. **Push to GitHub** (same as above if you haven't)

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click **"Login with GitHub"**
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select your `uno-game` repository
   - Railway will automatically detect Node.js and start deploying
   - Wait 2-3 minutes for deployment

3. **Get your URL**:
   - Click on your project
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Your game URL: `https://uno-game-production-xxxx.up.railway.app`

4. **Share with friends!**
   - Copy the URL and send to your friends

**Done! Your game is live! 🎉**

---

## 🎮 How to Play Online with Friends

1. **Open your deployed game URL** (from Glitch or Railway)
2. **Create a room**:
   - Enter your name
   - Click "Create Private Room"
   - You'll get a **6-character room code** (e.g., "ABC123")
3. **Share the room code** with your friends via:
   - Discord, WhatsApp, SMS, etc.
4. **Friends join**:
   - They open the same URL
   - Enter their name
   - Enter your room code
   - Click "Join Game"
5. **Start playing!**
   - Once everyone is in, click "Start Game"
   - Play UNO in real-time! 🎴

---

## 📱 Works On

- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Tablets
- ✅ Any device with a modern web browser!

---

## 🔧 Troubleshooting

**"Connection error" when opening the game:**
- Wait 30 seconds and refresh (servers may be waking up)
- Check that you're using the correct URL

**Friends can't join my room:**
- Make sure they're using the exact room code
- Check that you haven't started the game yet
- Maximum 15 players per room

**Game is slow/laggy:**
- Try a different deployment platform
- Check your internet connection
- Close other browser tabs

---

## 🔄 Updating Your Game

If you make changes to your code:

**For Glitch:**
- Just push to GitHub: `git push`
- Go to your Glitch project
- Click "Tools" → "Import from GitHub"
- Glitch will pull the latest changes

**For Railway:**
- Just push to GitHub: `git push`
- Railway automatically redeploys! (no action needed)

---

## 💡 Tips

- **Share the room code**, not just the URL - each room is private!
- **Bookmark your deployed URL** for easy access
- **Test with a friend** before sharing with a big group
- **Use the "Copy Code" button** in the waiting room to share the code easily

---

## ❓ Need Help?

- Check the main README.md for game rules and features
- Create an issue on GitHub if something isn't working
- Make sure all players have a stable internet connection

---

**Have fun playing UNO with your friends online! 🎉🎴**
