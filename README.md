# UNO Multiplayer Game

A fully functional web-based UNO card game that supports up to 15 players simultaneously with real-time multiplayer functionality.

## Features

- **Multiplayer Support**: Play with 2-15 players in real-time
- **Private Rooms**: Create private game rooms with unique codes
- **Full UNO Rules**: All standard UNO cards and rules implemented
  - Number cards (0-9) in 4 colors
  - Skip, Reverse, and Draw 2 cards
  - Wild and Wild Draw 4 cards
- **Real-time Updates**: Instant game state synchronization across all players
- **UNO Call System**: Don't forget to call UNO when you have one card left!
- **Responsive Design**: Works on desktop and mobile devices
- **Game Log**: Track all game actions in real-time

## Installation

1. Navigate to the game directory:
```bash
cd uno-game
```

2. Install dependencies:
```bash
npm install
```

## Running the Game Locally

1. Start the server:
```bash
npm start
```

You should see:
```
UNO server running on port 8080
HTTP server: http://localhost:8080
WebSocket server: ws://localhost:8080
```

2. Open your browser and navigate to `http://localhost:8080` (you can open multiple tabs/windows to simulate multiple players)

## How to Play

### Starting a Game

1. **Create a Room**:
   - Enter your name
   - Click "Create Private Room"
   - Share the room code with other players

2. **Join a Room**:
   - Enter your name
   - Enter the room code (or leave blank to join any available room)
   - Click "Join Game"

3. **Start the Game**:
   - The host clicks "Start Game" when all players have joined
   - Each player receives 7 cards

### Game Rules

1. **Playing Cards**:
   - You can play a card that matches the color, number, or type of the top card
   - Wild cards can be played anytime
   - Click on a playable card to play it

2. **Drawing Cards**:
   - If you can't play, click "Draw Card"
   - You can play the drawn card if it's playable, or pass your turn

3. **Special Cards**:
   - **Skip**: Next player loses their turn
   - **Reverse**: Reverses the direction of play
   - **Draw 2**: Next player draws 2 cards and loses their turn
   - **Wild**: Choose the next color to play
   - **Wild Draw 4**: Choose the next color and next player draws 4 cards

4. **Calling UNO**:
   - Click "UNO!" when you have one card left
   - Failure to call UNO results in a 2-card penalty if caught

5. **Winning**:
   - First player to play all their cards wins!

## Game Controls

- **Draw Card**: Draw a card from the deck
- **UNO!**: Call UNO when you have one card left
- **Click Card**: Play the card (if it's your turn and the card is playable)
- **Color Chooser**: Appears when you play a Wild or Wild Draw 4

## Technical Details

### Server (server.js)
- HTTP server with WebSocket support running on port 8080
- Serves static files (HTML, CSS, JavaScript)
- Handles game logic, card management, and player synchronization
- Supports multiple concurrent game rooms
- Includes health check endpoint for deployment platforms

### Client (client.js)
- Real-time WebSocket connection to server
- Handles UI updates and player interactions
- Manages game state synchronization

### Styling (style.css)
- Responsive design with gradient backgrounds
- Animated card effects
- Color-coded UNO cards

## Browser Compatibility

Works in all modern browsers that support:
- WebSocket API
- ES6 JavaScript
- CSS3 Flexbox/Grid

## Troubleshooting

**Connection Issues**:
- Make sure the server is running (`npm start`)
- Check that port 8080 is not being used by another application
- Ensure your browser allows WebSocket connections to localhost

**Game Not Starting**:
- Minimum 2 players required to start
- Only the host (first player) can start the game

**Cards Not Appearing**:
- Refresh the page and rejoin the room
- Check browser console for errors

## Project Structure

```
uno-game/
├── index.html          # Main game interface
├── style.css          # Game styling
├── client.js          # Client-side game logic
├── server.js          # WebSocket server and game engine
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## Deployment Options

**IMPORTANT**: The game now automatically detects if it's running locally or on a deployed server, so no manual WebSocket URL changes are needed!

### Prerequisites: Push to GitHub

Before deploying, push your code to GitHub:

1. Create a new repository on [GitHub.com](https://github.com/new)
   - Don't initialize with README (you already have one)
2. In your terminal (Git Bash or WSL), run:
   ```bash
   cd /mnt/c/Users/carlethanjustinev/Desktop/uno-game
   git init
   git add .
   git commit -m "Initial commit: UNO multiplayer game"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

### Option 1: Deploy on Render (Recommended - Free)

This project includes a `render.yaml` file for easy deployment!

#### Method A: Using Blueprint (Automatic - Easiest)
1. Go to [Render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and configure everything
5. Click "Apply" and wait for deployment (5-10 minutes)
6. Once deployed, open the provided URL (e.g., `https://uno-game-xxxx.onrender.com`)

#### Method B: Manual Web Service
1. Go to [Render.com](https://render.com) and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `uno-game` (or your preferred name)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Once deployed, open the provided URL (e.g., `https://uno-game-xxxx.onrender.com`)

**Important Notes**:
- The free tier sleeps after 15 minutes of inactivity. First load may take 30-60 seconds
- The health check endpoint (`/health`) ensures Render can monitor your service
- Your app will automatically use WebSocket Secure (wss://) in production

### Option 2: Deploy on Railway (Free Tier Available)

1. Go to [Railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `uno-game` repository
4. Railway auto-detects Node.js
5. Click on your deployment → "Settings"
6. Under "Networking", click "Generate Domain"
7. Your game will be available at the generated URL
8. Railway also provides $5 free credit monthly

### Option 3: Deploy on Cyclic (Free & Simple)

1. Go to [Cyclic.sh](https://cyclic.sh) and sign up with GitHub
2. Click "Deploy" → Connect to GitHub
3. Select your `uno-game` repository
4. Cyclic automatically deploys and provides a URL
5. 100% free with no sleep time!

### Option 4: Deploy on Glitch (Beginner-Friendly)

1. Go to [Glitch.com](https://glitch.com)
2. Click "New Project" → "Import from GitHub"
3. Paste your GitHub repository URL
4. Glitch will automatically deploy
5. Share the live app URL with friends!

### Testing Your Deployment

1. Open the deployed URL in your browser
2. Create a room and note the room code
3. Open the same URL in a different browser/device
4. Join using the room code
5. Start playing!

## Future Enhancements

- Player chat system
- Custom house rules
- Tournament mode
- Player statistics and leaderboards
- Sound effects and animations
- AI players for single-player mode

## License

MIT License - Feel free to modify and distribute!

---

Enjoy playing UNO with your friends!
