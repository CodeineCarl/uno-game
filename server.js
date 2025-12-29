const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
    // Serve static files
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/style.css') {
        fs.readFile(path.join(__dirname, 'style.css'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading style.css');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else if (req.url === '/client.js') {
        fs.readFile(path.join(__dirname, 'client.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading client.js');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    } else if (req.url === '/health') {
        // Health check endpoint for Render
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', rooms: rooms.size }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocket.Server({ server });

// Game rooms
const rooms = new Map();

// Card definitions
const COLORS = ['red', 'blue', 'green', 'yellow'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SPECIAL_TYPES = ['skip', 'reverse', 'draw2'];

class UnoGame {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.deck = [];
        this.discardPile = [];
        this.currentPlayerIndex = 0;
        this.direction = 1; // 1 for clockwise, -1 for counter-clockwise
        this.gameStarted = false;
        this.drawnThisTurn = false;
    }

    addPlayer(playerId, playerName, ws) {
        if (this.players.length >= 15) {
            return { success: false, message: 'Room is full (15 players max)' };
        }

        const player = {
            id: playerId,
            name: playerName,
            hand: [],
            ws: ws,
            isHost: this.players.length === 0,
            cardCount: 0,
            calledUno: false
        };

        this.players.push(player);
        return { success: true, player };
    }

    removePlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            const removedPlayer = this.players.splice(index, 1)[0];

            // If host left, assign new host
            if (removedPlayer.isHost && this.players.length > 0) {
                this.players[0].isHost = true;
            }

            // Adjust current player index if needed
            if (this.currentPlayerIndex >= this.players.length) {
                this.currentPlayerIndex = 0;
            }

            return removedPlayer;
        }
        return null;
    }

    createDeck() {
        this.deck = [];

        // Number cards (0-9) - 0 appears once per color, 1-9 appear twice
        COLORS.forEach(color => {
            this.deck.push({ color, type: 'number', value: 0 });
            for (let i = 1; i <= 9; i++) {
                this.deck.push({ color, type: 'number', value: i });
                this.deck.push({ color, type: 'number', value: i });
            }
        });

        // Special cards (skip, reverse, draw2) - 2 per color
        COLORS.forEach(color => {
            SPECIAL_TYPES.forEach(type => {
                this.deck.push({ color, type });
                this.deck.push({ color, type });
            });
        });

        // Wild cards - 4 of each
        for (let i = 0; i < 4; i++) {
            this.deck.push({ color: 'wild', type: 'wild' });
            this.deck.push({ color: 'wild', type: 'wild_draw4' });
        }

        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        // Deal 7 cards to each player
        this.players.forEach(player => {
            player.hand = [];
            for (let i = 0; i < 7; i++) {
                player.hand.push(this.deck.pop());
            }
            player.cardCount = player.hand.length;
        });

        // Place first card on discard pile (make sure it's not a wild or wild draw 4)
        let firstCard = this.deck.pop();
        while (firstCard.type === 'wild' || firstCard.type === 'wild_draw4') {
            this.deck.unshift(firstCard);
            this.shuffleDeck();
            firstCard = this.deck.pop();
        }
        this.discardPile.push(firstCard);

        // If first card is a special card, handle it
        if (firstCard.type === 'skip') {
            this.currentPlayerIndex = 1 % this.players.length;
        } else if (firstCard.type === 'reverse') {
            this.direction = -1;
            this.currentPlayerIndex = this.players.length - 1;
        } else if (firstCard.type === 'draw2') {
            this.drawCardsForPlayer(0, 2);
            this.currentPlayerIndex = 1 % this.players.length;
        }
    }

    drawCard() {
        if (this.deck.length === 0) {
            // Reshuffle discard pile into deck
            const topCard = this.discardPile.pop();
            this.deck = this.discardPile;
            this.discardPile = [topCard];
            this.shuffleDeck();
        }
        return this.deck.pop();
    }

    drawCardsForPlayer(playerIndex, count) {
        const player = this.players[playerIndex];
        for (let i = 0; i < count; i++) {
            player.hand.push(this.drawCard());
        }
        player.cardCount = player.hand.length;
        player.calledUno = false;
    }

    canPlayCard(card, topCard) {
        if (!topCard) return true;

        if (card.type === 'wild' || card.type === 'wild_draw4') {
            return true;
        }

        return card.color === topCard.color ||
               card.type === topCard.type ||
               (card.value !== undefined && card.value === topCard.value);
    }

    playCard(playerId, cardIndex, chosenColor = null) {
        const player = this.players.find(p => p.id === playerId);
        const playerIndex = this.players.findIndex(p => p.id === playerId);

        if (!player || playerIndex !== this.currentPlayerIndex) {
            return { success: false, message: 'Not your turn' };
        }

        if (cardIndex < 0 || cardIndex >= player.hand.length) {
            return { success: false, message: 'Invalid card' };
        }

        const card = player.hand[cardIndex];
        const topCard = this.discardPile[this.discardPile.length - 1];

        if (!this.canPlayCard(card, topCard)) {
            return { success: false, message: 'Cannot play this card' };
        }

        // Remove card from player's hand
        player.hand.splice(cardIndex, 1);
        player.cardCount = player.hand.length;

        // Handle wild cards with chosen color
        let playedCard = { ...card };
        if ((card.type === 'wild' || card.type === 'wild_draw4') && chosenColor) {
            playedCard.color = chosenColor;
        }

        this.discardPile.push(playedCard);

        // Check for win
        if (player.hand.length === 0) {
            return { success: true, gameOver: true, winner: player };
        }

        // Check if player should have called UNO
        if (player.hand.length === 1) {
            if (!player.calledUno) {
                // Penalty: draw 2 cards
                this.drawCardsForPlayer(playerIndex, 2);
                this.broadcastMessage({
                    type: 'cardDrawn',
                    message: `${player.name} didn't call UNO and drew 2 penalty cards!`
                });
            }
        }

        // Handle special cards
        let skipNext = false;
        let drawCount = 0;

        switch (card.type) {
            case 'skip':
                skipNext = true;
                break;
            case 'reverse':
                this.direction *= -1;
                if (this.players.length === 2) {
                    // In 2-player game, reverse acts like skip
                    skipNext = true;
                }
                break;
            case 'draw2':
                drawCount = 2;
                skipNext = true;
                break;
            case 'wild_draw4':
                drawCount = 4;
                skipNext = true;
                break;
        }

        // Move to next player
        this.nextPlayer();

        // Apply draw cards to next player
        if (drawCount > 0) {
            this.drawCardsForPlayer(this.currentPlayerIndex, drawCount);
        }

        // Skip next player if needed
        if (skipNext) {
            this.nextPlayer();
        }

        this.drawnThisTurn = false;
        player.calledUno = false; // Reset UNO call after playing

        return { success: true, gameOver: false };
    }

    handleDrawCard(playerId) {
        const player = this.players.find(p => p.id === playerId);
        const playerIndex = this.players.findIndex(p => p.id === playerId);

        if (!player || playerIndex !== this.currentPlayerIndex) {
            return { success: false, message: 'Not your turn' };
        }

        if (this.drawnThisTurn) {
            // Already drew this turn, must pass
            this.nextPlayer();
            this.drawnThisTurn = false;
            return { success: true, passed: true };
        }

        const card = this.drawCard();
        player.hand.push(card);
        player.cardCount = player.hand.length;
        player.calledUno = false;
        this.drawnThisTurn = true;

        // Check if the drawn card can be played
        const topCard = this.discardPile[this.discardPile.length - 1];
        const canPlay = this.canPlayCard(card, topCard);

        return { success: true, card, canPlay };
    }

    callUno(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player && player.hand.length === 1) {
            player.calledUno = true;
            return { success: true };
        }
        return { success: false };
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getTopCard() {
        return this.discardPile[this.discardPile.length - 1];
    }

    broadcastMessage(message, excludePlayerId = null) {
        this.players.forEach(player => {
            if (player.id !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify(message));
            }
        });
    }

    sendGameState() {
        this.players.forEach(player => {
            const message = {
                type: 'gameState',
                hand: player.hand,
                topCard: this.getTopCard(),
                currentPlayer: this.getCurrentPlayer().id,
                direction: this.direction,
                players: this.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    cardCount: p.cardCount,
                    isHost: p.isHost
                })),
                deckCount: this.deck.length
            };
            player.ws.send(JSON.stringify(message));
        });
    }

    getPlayerList() {
        return this.players.map(p => ({
            id: p.id,
            name: p.name,
            cardCount: p.cardCount,
            isHost: p.isHost
        }));
    }
}

// Generate random room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate unique player ID
function generatePlayerId() {
    return Math.random().toString(36).substr(2, 9);
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    let currentPlayerId = null;
    let currentRoomCode = null;

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('Received:', message);

        switch (message.type) {
            case 'createRoom':
                const newRoomCode = generateRoomCode();
                const newPlayerId = generatePlayerId();
                const newGame = new UnoGame(newRoomCode);

                newGame.addPlayer(newPlayerId, message.playerName, ws);
                rooms.set(newRoomCode, newGame);

                currentPlayerId = newPlayerId;
                currentRoomCode = newRoomCode;

                ws.send(JSON.stringify({
                    type: 'roomCreated',
                    roomCode: newRoomCode,
                    playerId: newPlayerId
                }));
                break;

            case 'join':
                const roomCode = message.roomCode || Array.from(rooms.keys()).find(code => {
                    const room = rooms.get(code);
                    return !room.gameStarted && room.players.length < 15;
                });

                if (!roomCode || !rooms.has(roomCode)) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Room not found. Please create a new room.'
                    }));
                    break;
                }

                const game = rooms.get(roomCode);

                if (game.gameStarted) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game already started'
                    }));
                    break;
                }

                const playerId = generatePlayerId();
                const result = game.addPlayer(playerId, message.playerName, ws);

                if (!result.success) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: result.message
                    }));
                    break;
                }

                currentPlayerId = playerId;
                currentRoomCode = roomCode;

                ws.send(JSON.stringify({
                    type: 'joined',
                    roomCode: roomCode,
                    playerId: playerId,
                    players: game.getPlayerList()
                }));

                game.broadcastMessage({
                    type: 'playerJoined',
                    playerName: message.playerName,
                    players: game.getPlayerList()
                }, playerId);
                break;

            case 'startGame':
                if (!currentRoomCode || !rooms.has(currentRoomCode)) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
                    break;
                }

                const startGame = rooms.get(currentRoomCode);
                const player = startGame.players.find(p => p.id === currentPlayerId);

                if (!player || !player.isHost) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Only host can start game' }));
                    break;
                }

                if (startGame.players.length < 1) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Need at least 1 player' }));
                    break;
                }

                startGame.gameStarted = true;
                startGame.createDeck();
                startGame.dealCards();

                startGame.players.forEach(p => {
                    p.ws.send(JSON.stringify({
                        type: 'gameStarted',
                        hand: p.hand,
                        topCard: startGame.getTopCard(),
                        currentPlayer: startGame.getCurrentPlayer().id,
                        direction: startGame.direction,
                        players: startGame.getPlayerList(),
                        deckCount: startGame.deck.length
                    }));
                });
                break;

            case 'playCard':
                if (!currentRoomCode || !rooms.has(currentRoomCode)) break;

                const playGame = rooms.get(currentRoomCode);
                const playResult = playGame.playCard(currentPlayerId, message.cardIndex, message.chosenColor);

                if (!playResult.success) {
                    ws.send(JSON.stringify({ type: 'error', message: playResult.message }));
                    break;
                }

                const playingPlayer = playGame.players.find(p => p.id === currentPlayerId);
                const card = playGame.getTopCard();

                playGame.broadcastMessage({
                    type: 'cardPlayed',
                    message: `${playingPlayer.name} played a ${card.color} ${card.type === 'number' ? card.value : card.type}`
                });

                if (playResult.gameOver) {
                    playGame.broadcastMessage({
                        type: 'gameOver',
                        winner: playResult.winner,
                        scores: playGame.players
                            .sort((a, b) => a.cardCount - b.cardCount)
                            .map(p => ({ name: p.name, score: p.cardCount }))
                    });
                    rooms.delete(currentRoomCode);
                } else {
                    playGame.sendGameState();
                }
                break;

            case 'drawCard':
                if (!currentRoomCode || !rooms.has(currentRoomCode)) break;

                const drawGame = rooms.get(currentRoomCode);
                const drawResult = drawGame.handleDrawCard(currentPlayerId);

                if (!drawResult.success) {
                    ws.send(JSON.stringify({ type: 'error', message: drawResult.message }));
                    break;
                }

                const drawingPlayer = drawGame.players.find(p => p.id === currentPlayerId);

                if (drawResult.passed) {
                    drawGame.broadcastMessage({
                        type: 'cardDrawn',
                        message: `${drawingPlayer.name} drew a card and passed`
                    });
                } else {
                    drawGame.broadcastMessage({
                        type: 'cardDrawn',
                        message: `${drawingPlayer.name} drew a card`
                    });
                }

                drawGame.sendGameState();
                break;

            case 'callUno':
                if (!currentRoomCode || !rooms.has(currentRoomCode)) break;

                const unoGame = rooms.get(currentRoomCode);
                const unoResult = unoGame.callUno(currentPlayerId);

                if (unoResult.success) {
                    const unoPlayer = unoGame.players.find(p => p.id === currentPlayerId);
                    unoGame.broadcastMessage({
                        type: 'unoCall',
                        message: `${unoPlayer.name} called UNO!`
                    });
                }
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');

        if (currentRoomCode && rooms.has(currentRoomCode)) {
            const game = rooms.get(currentRoomCode);
            const removedPlayer = game.removePlayer(currentPlayerId);

            if (removedPlayer) {
                game.broadcastMessage({
                    type: 'playerLeft',
                    playerName: removedPlayer.name,
                    players: game.getPlayerList()
                });

                // If no players left, delete the room
                if (game.players.length === 0) {
                    rooms.delete(currentRoomCode);
                }
            }
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`UNO server running on port ${PORT}`);
    console.log(`HTTP server: http://localhost:${PORT}`);
    console.log(`WebSocket server: ws://localhost:${PORT}`);
});
