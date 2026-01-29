// RetroPhone OS - Complete Application System

// ============================================
// SWIPE MANAGER MODULE - Touch Event Handler
// ============================================
class SwipeManager {
    constructor(container, options = {}) {
        this.container = container;
        this.wrapper = container.querySelector('.app-grid-wrapper');
        this.pages = container.querySelectorAll('.app-grid-page');
        this.indicators = document.querySelectorAll('.indicator');
        
        // Configuration
        this.currentPage = 0;
        this.totalPages = this.pages.length;
        this.threshold = options.threshold || 50; // Minimum swipe distance
        this.maxSwipeTime = options.maxSwipeTime || 300; // Max time for swipe gesture
        
        // Touch tracking
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.initialTransform = 0;
        
        // Performance optimization
        this.rafId = null;
        
        this.init();
    }
    
    init() {
        // Touch event listeners
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Mouse events for desktop testing
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.container.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        console.log('SwipeManager initialized - Ready for gesture input');
    }
    
    handleTouchStart(e) {
        // Don't interfere with scrolling within pages
        const target = e.target.closest('.app-icon, .dock-btn');
        if (!target) {
            this.startSwipe(e.touches[0].clientX, e.touches[0].clientY);
        }
    }
    
    handleMouseDown(e) {
        const target = e.target.closest('.app-icon, .dock-btn');
        if (!target) {
            this.startSwipe(e.clientX, e.clientY);
            e.preventDefault();
        }
    }
    
    startSwipe(x, y) {
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.startTime = Date.now();
        
        // Get current transform value
        const currentTransform = this.wrapper.style.transform;
        this.initialTransform = currentTransform 
            ? parseFloat(currentTransform.split('(')[1]) 
            : -this.currentPage * window.innerWidth;
        
        // Remove transition for immediate feedback
        this.wrapper.style.transition = 'none';
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        const deltaX = this.currentX - this.startX;
        const deltaY = currentY - this.startY;
        
        // If vertical scroll is more dominant, don't hijack the gesture
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            return;
        }
        
        // Prevent default to stop page scrolling during horizontal swipe
        e.preventDefault();
        
        // Use RAF for smooth 60fps animation
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        this.rafId = requestAnimationFrame(() => {
            this.updateSwipePosition(deltaX);
        });
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.clientX;
        const deltaX = this.currentX - this.startX;
        
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        this.rafId = requestAnimationFrame(() => {
            this.updateSwipePosition(deltaX);
        });
    }
    
    updateSwipePosition(deltaX) {
        // Apply rubber band effect at edges
        let resistance = 1;
        
        if ((this.currentPage === 0 && deltaX > 0) || 
            (this.currentPage === this.totalPages - 1 && deltaX < 0)) {
            resistance = 0.3; // Stronger resistance at edges
        }
        
        const newPosition = this.initialTransform + (deltaX * resistance);
        this.wrapper.style.transform = `translateX(${newPosition}px)`;
    }
    
    handleTouchEnd(e) {
        this.endSwipe();
    }
    
    handleMouseUp(e) {
        this.endSwipe();
    }
    
    endSwipe() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        const deltaX = this.currentX - this.startX;
        const deltaTime = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        // Restore transition
        this.wrapper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Determine if swipe was significant enough
        const isSignificantSwipe = Math.abs(deltaX) > this.threshold || velocity > 0.5;
        
        if (isSignificantSwipe) {
            if (deltaX > 0 && this.currentPage > 0) {
                // Swipe right - go to previous page
                this.goToPage(this.currentPage - 1);
                soundSystem.playClick();
            } else if (deltaX < 0 && this.currentPage < this.totalPages - 1) {
                // Swipe left - go to next page
                this.goToPage(this.currentPage + 1);
                soundSystem.playClick();
            } else {
                // Snap back to current page
                this.goToPage(this.currentPage);
            }
        } else {
            // Snap back to current page
            this.goToPage(this.currentPage);
        }
        
        console.log(`Swipe completed - Page: ${this.currentPage}, Delta: ${deltaX}px, Time: ${deltaTime}ms`);
    }
    
    goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;
        
        this.currentPage = pageIndex;
        const translateX = -pageIndex * window.innerWidth;
        
        this.wrapper.style.transform = `translateX(${translateX}px)`;
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === pageIndex);
        });
    }
}

// ============================================
// SYSTEM STATE & CONFIGURATION
// ============================================
const systemState = {
    currentScreen: 'lockScreen',
    currentApp: null,
    soundEnabled: true,
    wallpaper: 'default',
    brightness: 80,
    network: true,
    swipeManager: null
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

// Generate Home Screen Apps (distributed across 3 pages)
function generateHomeApps() {
    const pages = document.querySelectorAll('.app-grid-page');
    const appsPerPage = 8;
    
    pages.forEach((page, pageIndex) => {
        const startIndex = pageIndex * appsPerPage;
        const endIndex = startIndex + appsPerPage;
        const pageApps = appRegistry.slice(startIndex, endIndex);
        
        page.innerHTML = pageApps.map(app => `
            <div class="app-icon" onclick="openApp('${app.id}')">
                <div class="app-icon-bg">${app.icon}</div>
                <div class="app-label">${app.name}</div>
            </div>
        `).join('');
    });
    
    console.log('Home screen apps generated across', pages.length, 'pages');
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

// Initialize Swipe Manager for home screen
const appGridContainer = document.getElementById('appGridContainer');
if (appGridContainer) {
    systemState.swipeManager = new SwipeManager(appGridContainer, {
        threshold: 50,      // 50px minimum swipe
        maxSwipeTime: 300   // 300ms max swipe duration
    });
    console.log('Swipe Manager initialized successfully');
}

// Prevent default touch behaviors - optimized for swipe
document.addEventListener('touchmove', function(e) {
    // Allow swipe in home screen container
    if (e.target.closest('#appGridContainer')) {
        // Let SwipeManager handle it
        return;
    }
    
    if (e.target.closest('.unlock-handle')) return;
    if (e.target.closest('.app-drawer-grid')) return;
    if (e.target.closest('.notes-list')) return;
    if (e.target.closest('.browser-content')) return;
    if (e.target.closest('.settings-list')) return;
}, { passive: true });

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
