// RetroPhone OS - Complete Application System

// System State
const systemState = {
    currentScreen: 'lockScreen',
    currentApp: null,
    soundEnabled: true,
    wallpaper: 'default',
    brightness: 80,
    network: true
};

// Complete App Registry (30 Apps)
const appRegistry = [
    // Games (6)
    { id: 'snake', name: 'Snake', icon: '🐍', category: 'games' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', category: 'games' },
    { id: 'pong', name: 'Pong', icon: '🏓', category: 'games' },
    { id: 'breakout', name: 'Breakout', icon: '🧱', category: 'games' },
    { id: 'memory', name: 'Memory', icon: '🎴', category: 'games' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩', category: 'games' },
    
    // Utilities (10)
    { id: 'calculator', name: 'Calculator', icon: '🔢', category: 'utilities' },
    { id: 'notes', name: 'Notes', icon: '📝', category: 'utilities' },
    { id: 'clock', name: 'Clock', icon: '⏰', category: 'utilities' },
    { id: 'calendar', name: 'Calendar', icon: '📅', category: 'utilities' },
    { id: 'timer', name: 'Timer', icon: '⏱️', category: 'utilities' },
    { id: 'stopwatch', name: 'Stopwatch', icon: '⏲️', category: 'utilities' },
    { id: 'converter', name: 'Converter', icon: '🔄', category: 'utilities' },
    { id: 'compass', name: 'Compass', icon: '🧭', category: 'utilities' },
    { id: 'flashlight', name: 'Flashlight', icon: '🔦', category: 'utilities' },
    { id: 'weather', name: 'Weather', icon: '🌤️', category: 'utilities' },
    
    // Media (5)
    { id: 'music', name: 'Music', icon: '🎵', category: 'media' },
    { id: 'photos', name: 'Photos', icon: '🖼️', category: 'media' },
    { id: 'video', name: 'Video', icon: '🎬', category: 'media' },
    { id: 'camera', name: 'Camera', icon: '📷', category: 'media' },
    { id: 'recorder', name: 'Recorder', icon: '🎙️', category: 'media' },
    
    // System (6)
    { id: 'settings', name: 'Settings', icon: '⚙️', category: 'system' },
    { id: 'browser', name: 'Browser', icon: '🌐', category: 'system' },
    { id: 'files', name: 'Files', icon: '📁', category: 'system' },
    { id: 'contacts', name: 'Contacts', icon: '👤', category: 'system' },
    { id: 'messages', name: 'Messages', icon: '💬', category: 'system' },
    { id: 'phone', name: 'Phone', icon: '📞', category: 'system' },
    
    // Experimental (3)
    { id: 'paint', name: 'Paint', icon: '🎨', category: 'experimental' },
    { id: 'radio', name: 'Radio', icon: '📻', category: 'experimental' },
    { id: 'assistant', name: 'Assistant', icon: '🤖', category: 'experimental' }
];

// Sound System
const soundSystem = {
    context: null,
    
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    },
    
    playClick() {
        if (!systemState.soundEnabled || !this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.1);
    },
    
    playSuccess() {
        if (!systemState.soundEnabled || !this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.setValueAtTime(600, this.context.currentTime);
        oscillator.frequency.setValueAtTime(800, this.context.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.2);
    }
};

// Initialize Sound System
soundSystem.init();

// Lock Screen Logic
let unlockStartX = 0;
let unlockIsDragging = false;
const unlockHandle = document.getElementById('unlockHandle');
const unlockTrack = document.querySelector('.unlock-track');

unlockHandle.addEventListener('touchstart', (e) => {
    unlockStartX = e.touches[0].clientX;
    unlockIsDragging = true;
});

unlockHandle.addEventListener('touchmove', (e) => {
    if (!unlockIsDragging) return;
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - unlockStartX;
    const maxDistance = unlockTrack.offsetWidth - unlockHandle.offsetWidth - 4;
    
    if (deltaX > 0 && deltaX <= maxDistance) {
        unlockHandle.style.left = deltaX + 'px';
    }
    
    if (deltaX >= maxDistance * 0.9) {
        unlock();
    }
});

unlockHandle.addEventListener('touchend', () => {
    if (unlockIsDragging && unlockHandle.style.left !== '2px') {
        unlockHandle.style.transition = 'left 0.3s ease';
        unlockHandle.style.left = '2px';
        setTimeout(() => {
            unlockHandle.style.transition = '';
        }, 300);
    }
    unlockIsDragging = false;
});

function unlock() {
    soundSystem.playSuccess();
    switchScreen('lockScreen', 'homeScreen');
}

// Screen Management
function switchScreen(from, to) {
    const fromScreen = document.getElementById(from);
    const toScreen = document.getElementById(to);
    
    if (fromScreen) fromScreen.classList.remove('active');
    if (toScreen) toScreen.classList.add('active');
    
    systemState.currentScreen = to;
}

// Time Update
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const lockTime = document.getElementById('lockTime');
    const statusTime = document.querySelectorAll('.status-time');
    
    if (lockTime) lockTime.textContent = timeString;
    statusTime.forEach(el => el.textContent = timeString);
    
    // Update date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateString = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    
    const lockDate = document.getElementById('lockDate');
    if (lockDate) lockDate.textContent = dateString;
}

setInterval(updateTime, 1000);
updateTime();

// Generate Home Screen Apps (first 8 apps)
function generateHomeApps() {
    const appGrid = document.getElementById('appGrid');
    const homeApps = appRegistry.slice(0, 8);
    
    appGrid.innerHTML = homeApps.map(app => `
        <div class="app-icon" onclick="openApp('${app.id}')">
            <div class="app-icon-bg">${app.icon}</div>
            <div class="app-label">${app.name}</div>
        </div>
    `).join('');
}

// Generate App Drawer (all 30 apps)
function generateAppDrawer() {
    const appDrawerGrid = document.getElementById('appDrawerGrid');
    
    appDrawerGrid.innerHTML = appRegistry.map(app => `
        <div class="app-icon" onclick="openAppFromDrawer('${app.id}')">
            <div class="app-icon-bg">${app.icon}</div>
            <div class="app-label">${app.name}</div>
        </div>
    `).join('');
}

// Dock Buttons
document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        soundSystem.playClick();
        const appId = this.dataset.app;
        
        if (appId === 'apps') {
            switchScreen('homeScreen', 'appDrawer');
        } else {
            openApp(appId);
        }
    });
});

function closeAppDrawer() {
    soundSystem.playClick();
    switchScreen('appDrawer', 'homeScreen');
}

function openAppFromDrawer(appId) {
    soundSystem.playClick();
    switchScreen('appDrawer', 'appContainer');
    loadApp(appId);
}

// Open App
function openApp(appId) {
    soundSystem.playClick();
    switchScreen('homeScreen', 'appContainer');
    loadApp(appId);
}

function loadApp(appId) {
    systemState.currentApp = appId;
    
    // Hide all app contents
    document.querySelectorAll('.app-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show specific app
    const appElement = document.getElementById(`${appId}App`);
    if (appElement) {
        appElement.classList.add('active');
        
        // Initialize app-specific logic
        if (appId === 'notes') initNotes();
        if (appId === 'snake') resetSnake();
        if (appId === 'tictactoe') resetTicTacToe();
    } else {
        // Generic app placeholder
        showGenericApp(appId);
    }
}

function showGenericApp(appId) {
    const app = appRegistry.find(a => a.id === appId);
    if (!app) return;
    
    const container = document.getElementById('appContainer');
    container.innerHTML = `
        <div class="app-content active">
            <div class="app-header">
                <button class="back-btn" onclick="closeApp()">←</button>
                <h1>${app.name}</h1>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">${app.icon}</div>
                <h2 style="color: white; margin-bottom: 15px; font-family: 'Orbitron', monospace;">${app.name}</h2>
                <p style="color: rgba(255, 255, 255, 0.7); max-width: 300px;">
                    This is a ${app.category} application. Full implementation coming soon in the next update!
                </p>
            </div>
        </div>
    `;
}

function closeApp() {
    soundSystem.playClick();
    switchScreen('appContainer', 'homeScreen');
    systemState.currentApp = null;
}

// Calculator Logic
let calcCurrent = '0';
let calcPrevious = '';
let calcOperation = '';

function calcNumber(num) {
    soundSystem.playClick();
    if (calcCurrent === '0') {
        calcCurrent = num;
    } else {
        calcCurrent += num;
    }
    updateCalcDisplay();
}

function calcOperation(op) {
    soundSystem.playClick();
    if (calcPrevious !== '') {
        calcEquals();
    }
    calcPrevious = calcCurrent;
    calcCurrent = '0';
    calcOperation = op;
    updateCalcDisplay();
}

function calcEquals() {
    soundSystem.playClick();
    if (calcPrevious === '' || calcOperation === '') return;
    
    const prev = parseFloat(calcPrevious);
    const curr = parseFloat(calcCurrent);
    let result = 0;
    
    switch (calcOperation) {
        case '+': result = prev + curr; break;
        case '-': result = prev - curr; break;
        case '*': result = prev * curr; break;
        case '/': result = prev / curr; break;
        case '%': result = prev % curr; break;
    }
    
    calcCurrent = String(result);
    calcPrevious = '';
    calcOperation = '';
    updateCalcDisplay();
}

function calcClear() {
    soundSystem.playClick();
    calcCurrent = '0';
    calcPrevious = '';
    calcOperation = '';
    updateCalcDisplay();
}

function calcBackspace() {
    soundSystem.playClick();
    if (calcCurrent.length > 1) {
        calcCurrent = calcCurrent.slice(0, -1);
    } else {
        calcCurrent = '0';
    }
    updateCalcDisplay();
}

function calcDecimal() {
    soundSystem.playClick();
    if (!calcCurrent.includes('.')) {
        calcCurrent += '.';
        updateCalcDisplay();
    }
}

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.textContent = calcCurrent;
    }
}

// Notes Logic
let notes = JSON.parse(localStorage.getItem('retrophone_notes') || '[]');

function initNotes() {
    renderNotes();
}

function renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
                <p>No notes yet. Tap + to create one.</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = notes.map((note, index) => `
        <div class="note-item" onclick="editNote(${index})">
            <div class="note-title">${note.title || 'Untitled'}</div>
            <div class="note-preview">${note.content}</div>
            <div class="note-date">${new Date(note.date).toLocaleDateString()}</div>
        </div>
    `).join('');
}

function createNote() {
    soundSystem.playClick();
    const title = prompt('Note title:');
    const content = prompt('Note content:');
    
    if (title || content) {
        notes.unshift({
            title: title || 'Untitled',
            content: content || '',
            date: Date.now()
        });
        saveNotes();
        renderNotes();
    }
}

function editNote(index) {
    soundSystem.playClick();
    const note = notes[index];
    const content = prompt('Edit note:', note.content);
    
    if (content !== null) {
        note.content = content;
        note.date = Date.now();
        saveNotes();
        renderNotes();
    }
}

function saveNotes() {
    localStorage.setItem('retrophone_notes', JSON.stringify(notes));
}

// Snake Game Logic
let snakeGame = {
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    gameLoop: null,
    gridSize: 20,
    tileSize: 15
};

function resetSnake() {
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.food = {x: 15, y: 15};
    snakeGame.direction = 'right';
    snakeGame.nextDirection = 'right';
    snakeGame.score = 0;
    updateSnakeScore();
    
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
        snakeGame.gameLoop = null;
    }
}

function startSnake() {
    soundSystem.playClick();
    resetSnake();
    
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    
    snakeGame.gameLoop = setInterval(() => {
        snakeGame.direction = snakeGame.nextDirection;
        
        const head = {...snakeGame.snake[0]};
        
        switch(snakeGame.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Wall collision
        if (head.x < 0 || head.x >= snakeGame.gridSize || 
            head.y < 0 || head.y >= snakeGame.gridSize) {
            gameOver();
            return;
        }
        
        // Self collision
        if (snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }
        
        snakeGame.snake.unshift(head);
        
        // Food collision
        if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
            snakeGame.score++;
            updateSnakeScore();
            soundSystem.playSuccess();
            generateFood();
        } else {
            snakeGame.snake.pop();
        }
        
        drawSnake(ctx, canvas);
    }, 150);
}

function drawSnake(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = '#ff006e';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff006e';
    ctx.fillRect(
        snakeGame.food.x * snakeGame.tileSize,
        snakeGame.food.y * snakeGame.tileSize,
        snakeGame.tileSize - 2,
        snakeGame.tileSize - 2
    );
    
    // Draw snake
    ctx.shadowBlur = 10;
    snakeGame.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00ff88' : '#00d9ff';
        ctx.shadowColor = index === 0 ? '#00ff88' : '#00d9ff';
        ctx.fillRect(
            segment.x * snakeGame.tileSize,
            segment.y * snakeGame.tileSize,
            snakeGame.tileSize - 2,
            snakeGame.tileSize - 2
        );
    });
    ctx.shadowBlur = 0;
}

function generateFood() {
    snakeGame.food = {
        x: Math.floor(Math.random() * snakeGame.gridSize),
        y: Math.floor(Math.random() * snakeGame.gridSize)
    };
}

function snakeControl(dir) {
    soundSystem.playClick();
    const opposites = {up: 'down', down: 'up', left: 'right', right: 'left'};
    if (snakeGame.direction !== opposites[dir]) {
        snakeGame.nextDirection = dir;
    }
}

function updateSnakeScore() {
    const scoreEl = document.getElementById('snakeScore');
    if (scoreEl) scoreEl.textContent = snakeGame.score;
}

function gameOver() {
    clearInterval(snakeGame.gameLoop);
    alert(`Game Over! Score: ${snakeGame.score}`);
}

// Tic Tac Toe Logic
let tttGame = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true
};

function resetTicTacToe() {
    tttGame.board = ['', '', '', '', '', '', '', '', ''];
    tttGame.currentPlayer = 'X';
    tttGame.gameActive = true;
    
    document.querySelectorAll('.ttt-cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    
    updateTTTPlayer();
}

function tttMove(index) {
    if (!tttGame.gameActive || tttGame.board[index] !== '') return;
    
    soundSystem.playClick();
    
    tttGame.board[index] = tttGame.currentPlayer;
    const cell = document.querySelectorAll('.ttt-cell')[index];
    cell.textContent = tttGame.currentPlayer;
    cell.classList.add(tttGame.currentPlayer.toLowerCase());
    
    if (checkTTTWin()) {
        setTimeout(() => {
            alert(`${tttGame.currentPlayer} wins!`);
            resetTicTacToe();
        }, 100);
        return;
    }
    
    if (!tttGame.board.includes('')) {
        setTimeout(() => {
            alert('Draw!');
            resetTicTacToe();
        }, 100);
        return;
    }
    
    tttGame.currentPlayer = tttGame.currentPlayer === 'X' ? 'O' : 'X';
    updateTTTPlayer();
}

function checkTTTWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return tttGame.board[a] !== '' &&
               tttGame.board[a] === tttGame.board[b] &&
               tttGame.board[a] === tttGame.board[c];
    });
}

function updateTTTPlayer() {
    const playerEl = document.getElementById('tttPlayer');
    if (playerEl) playerEl.textContent = tttGame.currentPlayer;
}

// Browser Logic
function browserGo() {
    soundSystem.playClick();
    const url = document.getElementById('browserUrl').value;
    const content = document.getElementById('browserContent');
    
    if (url.trim() === '') return;
    
    content.innerHTML = `
        <h2>Search Results for: ${url}</h2>
        <p style="color: rgba(255, 255, 255, 0.7); margin-top: 15px;">
            This is a simulated browser. In a real implementation, this would connect to the internet.
        </p>
        <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
            <h3 style="color: #00d9ff; margin-bottom: 10px;">🔍 ${url}</h3>
            <p style="color: rgba(255, 255, 255, 0.6);">
                RetroPhone OS Browser - Frutiger Aero Edition
            </p>
        </div>
    `;
}

function browserSearch(query) {
    soundSystem.playClick();
    document.getElementById('browserUrl').value = query;
    browserGo();
}

// Settings Functions
function openWallpaperSettings() {
    soundSystem.playClick();
    alert('Wallpaper settings - Coming soon!');
}

function openDisplaySettings() {
    soundSystem.playClick();
    alert('Display settings - Coming soon!');
}

function openSoundSettings() {
    soundSystem.playClick();
    const toggle = confirm('Sound effects are currently ' + (systemState.soundEnabled ? 'ON' : 'OFF') + '. Toggle?');
    if (toggle) {
        systemState.soundEnabled = !systemState.soundEnabled;
    }
}

function openNetworkSettings() {
    soundSystem.playClick();
    alert('Network settings - Coming soon!');
}

function openStorageSettings() {
    soundSystem.playClick();
    const notesSize = JSON.stringify(notes).length;
    alert(`Storage Info:\nNotes: ${notesSize} bytes\nTotal: ${notesSize} bytes`);
}

function openAboutSettings() {
    soundSystem.playClick();
    alert('RetroPhone OS\nFrutiger Aero Edition\nVersion 1.0\n\nInspired by Android 1.0-4.4');
}

// Initialize
generateHomeApps();
generateAppDrawer();

// Prevent default touch behaviors
document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.unlock-handle')) return;
    if (e.target.closest('.app-grid')) return;
    if (e.target.closest('.app-drawer-grid')) return;
    if (e.target.closest('.notes-list')) return;
    if (e.target.closest('.browser-content')) return;
}, { passive: false });

// Keyboard support for Snake
document.addEventListener('keydown', (e) => {
    if (systemState.currentApp !== 'snake') return;
    
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };
    
    if (keyMap[e.key]) {
        e.preventDefault();
        snakeControl(keyMap[e.key]);
    }
});

console.log('RetroPhone OS initialized with', appRegistry.length, 'applications');