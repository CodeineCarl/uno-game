# Quick Deployment Guide for Render

## Pre-Deployment Checklist

- [x] Server configured with HTTP + WebSocket support
- [x] Health check endpoint added (`/health`)
- [x] Environment variables properly handled (`PORT`)
- [x] Static file serving configured
- [x] `render.yaml` configuration file created
- [x] Dependencies listed in `package.json`

## Step-by-Step Deployment on Render

### 1. Push to GitHub (If not already done)

```bash
cd /mnt/c/Users/carlethanjustinev/Desktop/uno-game
git init
git add .
git commit -m "Initial commit: UNO multiplayer game ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### 2. Deploy on Render

**Option A: Blueprint (Recommended)**
1. Visit https://render.com
2. Sign in with GitHub
3. Click "New +" → "Blueprint"
4. Select your `uno-game` repository
5. Render will detect `render.yaml` automatically
6. Click "Apply"
7. Wait 5-10 minutes for deployment

**Option B: Manual Setup**
1. Visit https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Fill in:
   - **Name**: uno-game
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
6. Click "Create Web Service"

### 3. Verify Deployment

Once deployed, you'll get a URL like: `https://uno-game-xxxx.onrender.com`

**Test your deployment:**
1. Open the URL in your browser
2. Create a new room
3. Open the same URL in another browser/tab
4. Join the room with the code
5. Start playing!

### 4. Share with Friends

Share your deployed URL with friends to play together from anywhere!

## Important Notes

### Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for continuous use)

### Troubleshooting

**Problem: "Service Unavailable"**
- Solution: Wait 30-60 seconds, the service is waking up from sleep

**Problem: WebSocket connection fails**
- Solution: Check browser console for errors. The app automatically uses `wss://` in production

**Problem: Can't connect to room**
- Solution: Ensure both players are using the same deployed URL (not localhost)

**Problem: Page not loading**
- Solution: Check Render dashboard logs for errors

### Monitoring Your Service

- Visit Render dashboard to see:
  - Real-time logs
  - Deployment status
  - Service health
  - Resource usage

### Updating Your Deployment

When you make changes:
```bash
git add .
git commit -m "Your update message"
git push
```

Render will automatically redeploy your changes!

## Alternative Platforms

If you prefer other platforms, see the main README.md for:
- Railway
- Cyclic
- Glitch

## Support

For issues:
- Check Render docs: https://render.com/docs
- Review server logs in Render dashboard
- Test locally first with `npm start`

---

Have fun playing UNO!
