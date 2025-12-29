// Game State
let gameState = {
    playerId: null,
    playerName: null,
    roomCode: null,
    isHost: false,
    players: [],
    hand: [],
    currentPlayer: null,
    topCard: null,
    direction: 1,
    deckCount: 108
};

let ws = null;

// DOM Elements
const lobbyScreen = document.getElementById('lobby-screen');
const waitingScreen = document.getElementById('waiting-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');

// Lobby elements
const playerNameInput = document.getElementById('player-name');
const roomCodeInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const createRoomBtn = document.getElementById('create-room-btn');
const lobbyMessage = document.getElementById('lobby-message');

// Waiting room elements
const waitingRoomCode = document.getElementById('waiting-room-code');
const copyCodeBtn = document.getElementById('copy-code-btn');
const waitingPlayersList = document.getElementById('waiting-players-list');
const waitingPlayerCount = document.getElementById('waiting-player-count');
const startGameBtn = document.getElementById('start-game-btn');

// Game elements
const gameRoomCode = document.getElementById('game-room-code');
const currentPlayerTurn = document.getElementById('current-player-turn');
const yourCardCount = document.getElementById('your-card-count');
const otherPlayers = document.getElementById('other-players');
const drawPile = document.getElementById('draw-pile');
const topCard = document.getElementById('top-card');
const playerHand = document.getElementById('player-hand');
const drawCardBtn = document.getElementById('draw-card-btn');
const unoBtn = document.getElementById('uno-btn');
const gameMessages = document.getElementById('game-messages');
const colorChooser = document.getElementById('color-chooser');
const deckCountDisplay = document.getElementById('deck-count');

// Event Listeners
joinBtn.addEventListener('click', joinGame);
createRoomBtn.addEventListener('click', createRoom);
copyCodeBtn.addEventListener('click', copyRoomCode);
startGameBtn.addEventListener('click', startGame);
drawCardBtn.addEventListener('click', drawCard);
unoBtn.addEventListener('click', callUno);

// Color chooser buttons
document.querySelectorAll('.color-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        chooseColor(color);
    });
});

// Initialize WebSocket connection
function initWebSocket() {
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'localhost:8080'
        : window.location.host;
    const wsUrl = `${protocol}//${host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('Connected to server');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        showLobbyMessage('Connection error. Please make sure the server is running.');
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        showLobbyMessage('Disconnected from server. Please refresh and try again.');
    };
}

function joinGame() {
    const name = playerNameInput.value.trim();
    const room = roomCodeInput.value.trim().toUpperCase();

    if (!name) {
        showLobbyMessage('Please enter your name');
        return;
    }

    gameState.playerName = name;
    initWebSocket();

    setTimeout(() => {
        sendMessage({
            type: 'join',
            playerName: name,
            roomCode: room || null
        });
    }, 500);
}

function createRoom() {
    const name = playerNameInput.value.trim();

    if (!name) {
        showLobbyMessage('Please enter your name');
        return;
    }

    gameState.playerName = name;
    gameState.isHost = true;
    initWebSocket();

    setTimeout(() => {
        sendMessage({
            type: 'createRoom',
            playerName: name
        });
    }, 500);
}

function startGame() {
    sendMessage({ type: 'startGame' });
}

function drawCard() {
    sendMessage({ type: 'drawCard' });
}

function playCard(cardIndex) {
    const card = gameState.hand[cardIndex];

    if (card.type === 'wild' || card.type === 'wild_draw4') {
        gameState.pendingCardIndex = cardIndex;
        colorChooser.classList.remove('hidden');
    } else {
        sendMessage({
            type: 'playCard',
            cardIndex: cardIndex
        });
    }
}

function chooseColor(color) {
    colorChooser.classList.add('hidden');
    sendMessage({
        type: 'playCard',
        cardIndex: gameState.pendingCardIndex,
        chosenColor: color
    });
    gameState.pendingCardIndex = null;
}

function callUno() {
    sendMessage({ type: 'callUno' });
}

function copyRoomCode() {
    navigator.clipboard.writeText(gameState.roomCode);
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyCodeBtn.textContent = 'Copy Code';
    }, 2000);
}

function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

function handleServerMessage(message) {
    console.log('Received:', message);

    switch (message.type) {
        case 'joined':
            gameState.playerId = message.playerId;
            gameState.roomCode = message.roomCode;
            showWaitingRoom();
            break;

        case 'roomCreated':
            gameState.playerId = message.playerId;
            gameState.roomCode = message.roomCode;
            gameState.isHost = true;
            showWaitingRoom();
            break;

        case 'playerJoined':
            gameState.players = message.players;
            updateWaitingRoom();
            addGameMessage(`${message.playerName} joined the game`, 'system');
            break;

        case 'playerLeft':
            gameState.players = message.players;
            updateWaitingRoom();
            addGameMessage(`${message.playerName} left the game`, 'system');
            break;

        case 'gameStarted':
            gameState.hand = message.hand;
            gameState.topCard = message.topCard;
            gameState.players = message.players;
            gameState.currentPlayer = message.currentPlayer;
            gameState.direction = message.direction;
            gameState.deckCount = message.deckCount;
            showGameScreen();
            break;

        case 'gameState':
            gameState.hand = message.hand;
            gameState.topCard = message.topCard;
            gameState.players = message.players;
            gameState.currentPlayer = message.currentPlayer;
            gameState.direction = message.direction;
            gameState.deckCount = message.deckCount;
            updateGameScreen();
            break;

        case 'cardPlayed':
            addGameMessage(message.message, 'player-action');
            break;

        case 'cardDrawn':
            addGameMessage(message.message, 'player-action');
            break;

        case 'unoCall':
            addGameMessage(message.message, 'player-action');
            break;

        case 'gameOver':
            showGameOver(message.winner, message.scores);
            break;

        case 'error':
            alert(message.message);
            break;
    }
}

function showWaitingRoom() {
    lobbyScreen.classList.remove('active');
    waitingScreen.classList.add('active');
    waitingRoomCode.textContent = gameState.roomCode;

    if (gameState.isHost) {
        startGameBtn.style.display = 'block';
        document.querySelector('.waiting-message').style.display = 'none';
    }

    updateWaitingRoom();
}

function updateWaitingRoom() {
    waitingPlayerCount.textContent = gameState.players.length;
    waitingPlayersList.innerHTML = '';

    gameState.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'waiting-player-item';
        playerDiv.innerHTML = `
            <strong>${player.name}</strong>
            ${player.id === gameState.playerId ? '(You)' : ''}
            ${player.isHost ? '👑' : ''}
        `;
        waitingPlayersList.appendChild(playerDiv);
    });
}

function showGameScreen() {
    waitingScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameRoomCode.textContent = gameState.roomCode;
    updateGameScreen();
}

function updateGameScreen() {
    // DEBUG: Log turn information
    console.log('=== UPDATE GAME SCREEN ===');
    console.log('My Player ID:', gameState.playerId);
    console.log('Current Player ID:', gameState.currentPlayer);
    console.log('Is my turn?:', gameState.currentPlayer === gameState.playerId);
    console.log('Players list:', gameState.players);

    // Update player hand
    playerHand.innerHTML = '';
    gameState.hand.forEach((card, index) => {
        const cardEl = createCardElement(card);

        // Check if card is playable
        if (isCardPlayable(card) && gameState.currentPlayer === gameState.playerId) {
            cardEl.classList.add('playable');
            cardEl.addEventListener('click', () => playCard(index));
            console.log(`Card ${index} is playable and it's my turn`);
        } else {
            console.log(`Card ${index} NOT clickable - playable: ${isCardPlayable(card)}, myTurn: ${gameState.currentPlayer === gameState.playerId}`);
        }

        playerHand.appendChild(cardEl);
    });

    yourCardCount.textContent = gameState.hand.length;

    // Update top card
    topCard.innerHTML = '';
    if (gameState.topCard) {
        const topCardEl = createCardElement(gameState.topCard);
        topCardEl.style.cursor = 'default';
        topCard.appendChild(topCardEl);
    }

    // Update deck count
    deckCountDisplay.textContent = gameState.deckCount;

    // Update other players
    otherPlayers.innerHTML = '';
    gameState.players.forEach(player => {
        if (player.id !== gameState.playerId) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'other-player';
            if (player.id === gameState.currentPlayer) {
                playerDiv.classList.add('active-turn');
            }
            playerDiv.innerHTML = `
                <div class="other-player-name">${player.name}</div>
                <div class="other-player-cards">${player.cardCount} cards</div>
            `;
            otherPlayers.appendChild(playerDiv);
        }
    });

    // Update current turn indicator
    const currentPlayerObj = gameState.players.find(p => p.id === gameState.currentPlayer);
    if (currentPlayerObj) {
        if (currentPlayerObj.id === gameState.playerId) {
            currentPlayerTurn.textContent = "YOUR TURN!";
            currentPlayerTurn.style.color = '#ffc107';
            drawCardBtn.disabled = false;
        } else {
            currentPlayerTurn.textContent = `${currentPlayerObj.name}'s turn`;
            currentPlayerTurn.style.color = 'white';
            drawCardBtn.disabled = true;
        }
    }
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.color}`;

    let cardText = '';
    switch (card.type) {
        case 'number':
            cardText = card.value;
            break;
        case 'skip':
            cardText = '🚫';
            break;
        case 'reverse':
            cardText = '🔄';
            break;
        case 'draw2':
            cardText = '+2';
            break;
        case 'wild':
            cardText = '🌈';
            break;
        case 'wild_draw4':
            cardText = '+4';
            break;
    }

    cardDiv.textContent = cardText;
    return cardDiv;
}

function isCardPlayable(card) {
    if (!gameState.topCard) return true;

    // Wild cards can always be played
    if (card.type === 'wild' || card.type === 'wild_draw4') {
        return true;
    }

    // Match color or type/value
    return card.color === gameState.topCard.color ||
           card.type === gameState.topCard.type ||
           card.value === gameState.topCard.value;
}

function addGameMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `game-message ${type}`;
    messageDiv.textContent = message;
    gameMessages.appendChild(messageDiv);
    gameMessages.scrollTop = gameMessages.scrollHeight;
}

function showGameOver(winner, scores) {
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');

    const winnerAnnouncement = document.getElementById('winner-announcement');
    winnerAnnouncement.textContent = `${winner.name} wins!`;

    const finalScores = document.getElementById('final-scores');
    finalScores.innerHTML = '<h3>Final Standings:</h3>';

    scores.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        if (index === 0) scoreItem.classList.add('winner');
        scoreItem.innerHTML = `
            <span>${index + 1}. ${player.name}</span>
            <span>${player.score} points</span>
        `;
        finalScores.appendChild(scoreItem);
    });
}

function showLobbyMessage(message) {
    lobbyMessage.textContent = message;
    setTimeout(() => {
        lobbyMessage.textContent = '';
    }, 5000);
}

// Play again button
document.getElementById('play-again-btn').addEventListener('click', () => {
    location.reload();
});

// Leave game button
document.getElementById('leave-game-btn').addEventListener('click', () => {
    location.reload();
});
