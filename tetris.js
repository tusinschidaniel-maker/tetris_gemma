const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen = document.getElementById('pause-screen');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Game Constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const NEXT_BLOCK_SIZE = 30;

// Tetromino Colors
const COLORS = [
    null,
    '#06b6d4', // I - Cyan
    '#3b82f6', // J - Blue
    '#f97316', // L - Orange
    '#eab308', // O - Yellow
    '#22c55e', // S - Green
    '#a855f7', // T - Purple
    '#ef4444'  // Z - Red
];

// Tetromino Shapes
const PIECES = [
    [],
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // O
    [
        [4, 4],
        [4, 4]
    ],
    // S
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    // T
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // Z
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// Game State
let board = [];
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isPaused = false;
let animationId;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

let isAnimating = false;
let clearingLines = [];
let clearAnimationTimer = 0;
const CLEAR_ANIMATION_DURATION = 300;

let particles = [];
let floatingTexts = [];

let player = {
    pos: {x: 0, y: 0},
    matrix: null,
};

let nextPiece = null;

// Initialize Board
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Draw a single block
function drawBlock(ctx, x, y, size, colorIndex) {
    if (colorIndex === 0) return;
    
    const color = COLORS[colorIndex];
    
    // Draw base color
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    
    // Draw highlight/shadow for 3D effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * size, y * size, size, size * 0.1); // top
    ctx.fillRect(x * size, y * size, size * 0.1, size); // left
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * size, y * size + size * 0.9, size, size * 0.1); // bottom
    ctx.fillRect(x * size + size * 0.9, y * size, size * 0.1, size); // right
    
    // Draw inner rect
    ctx.fillStyle = color;
    ctx.fillRect(x * size + size * 0.1, y * size + size * 0.1, size * 0.8, size * 0.8);
}

// Draw outline block for ghost piece
function drawOutlineBlock(ctx, x, y, size, colorIndex) {
    if (colorIndex === 0) return;
    
    const color = COLORS[colorIndex];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
}

function createConfetti(yIndex, linesCleared) {
    const particleCount = 20 * linesCleared;
    const speedMultiplier = 1 + (linesCleared * 0.3);

    for(let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: yIndex * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
            vx: (Math.random() - 0.5) * 10 * speedMultiplier,
            vy: (Math.random() - 1) * 10 * speedMultiplier,
            color: COLORS[Math.floor(Math.random() * 7) + 1] || '#ffffff',
            life: 1.0 + (linesCleared * 0.2)
        });
    }
}

function createFloatingText(linesCleared) {
    let text = "";
    let color = "";
    let fontSize = 32;

    if (linesCleared === 1) {
        text = "NICE";
        color = "#e2e8f0"; // silver
        fontSize = 28;
    } else if (linesCleared === 2) {
        text = "AMAZING";
        color = "#38bdf8"; // cyan
        fontSize = 36;
    } else if (linesCleared === 3) {
        text = "EXCELLENT";
        color = "#a855f7"; // purple
        fontSize = 44;
    } else if (linesCleared >= 4) {
        text = "TETRIS!";
        color = "#fcd34d"; // gold
        fontSize = 54;
    }
    
    floatingTexts.push({
        text: text,
        color: color,
        fontSize: fontSize,
        x: canvas.width / 2,
        y: canvas.height / 2,
        vy: -1.5 - (linesCleared * 0.5),
        life: 1.0 + (linesCleared * 0.2)
    });
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravity
        p.life -= deltaTime / 1000;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= deltaTime / 1500;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

// Draw Board and Player
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * BLOCK_SIZE, 0);
        ctx.lineTo(i * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * BLOCK_SIZE);
        ctx.lineTo(canvas.width, i * BLOCK_SIZE);
        ctx.stroke();
    }

    drawMatrix(board, {x: 0, y: 0}, ctx, BLOCK_SIZE);
    
    if (isAnimating) {
        // Draw flashing effect over clearing lines
        const flashIntensity = Math.abs(Math.sin(clearAnimationTimer / 50));
        ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        
        clearingLines.forEach(y => {
            ctx.fillRect(0, y * BLOCK_SIZE, canvas.width, BLOCK_SIZE);
        });
    } else {
        // Draw Ghost Piece
        let ghostPos = {x: player.pos.x, y: player.pos.y};
        while (!collide(board, {matrix: player.matrix, pos: ghostPos})) {
            ghostPos.y++;
        }
        ghostPos.y--;
        
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawOutlineBlock(ctx, x + ghostPos.x, y + ghostPos.y, BLOCK_SIZE, value);
                }
            });
        });

        // Draw active piece
        drawMatrix(player.matrix, player.pos, ctx, BLOCK_SIZE);
    }

    // Draw Particles
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 6);
    });
    ctx.globalAlpha = 1.0;

    // Draw Floating Texts
    floatingTexts.forEach(ft => {
        ctx.globalAlpha = Math.max(0, Math.min(1, ft.life));
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${ft.fontSize}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1.0;
}

function drawMatrix(matrix, offset, context, size) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(context, x + offset.x, y + offset.y, size, value);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;
    
    // Center the piece in the next box
    const offsetX = (4 - nextPiece[0].length) / 2;
    const offsetY = (4 - nextPiece.length) / 2;
    
    drawMatrix(nextPiece, {x: offsetX, y: offsetY}, nextCtx, NEXT_BLOCK_SIZE);
}

// Collision Detection
function collide(board, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Merge Piece into Board
function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Clear Lines
function sweep() {
    let hasLines = false;
    let linesToClear = [];
    for (let y = 0; y < board.length; ++y) {
        let isFull = true;
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                isFull = false;
                break;
            }
        }
        if (isFull) {
            hasLines = true;
            linesToClear.push(y);
        }
    }
    
    if (hasLines) {
        isAnimating = true;
        clearingLines = linesToClear;
        clearAnimationTimer = 0;
        
        clearingLines.forEach(y => createConfetti(y, linesToClear.length));
        createFloatingText(linesToClear.length);
    } else {
        playerReset();
    }
}

function processClearedLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;
        linesCleared++;
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        linesElement.innerText = lines;
        
        // Scoring: 100, 300, 500, 800 based on lines cleared
        const lineScores = [0, 100, 300, 500, 800];
        score += lineScores[linesCleared] * level;
        scoreElement.innerText = score;
        
        // Level up every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            levelElement.innerText = level;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
    }
    
    isAnimating = false;
    clearingLines = [];
    playerReset();
}

// Get Random Piece
function randomPiece() {
    const index = Math.floor(Math.random() * 7) + 1;
    return PIECES[index];
}

// Reset Piece
function playerReset() {
    if (!nextPiece) {
        nextPiece = randomPiece();
    }
    player.matrix = nextPiece;
    nextPiece = randomPiece();
    drawNextPiece();
    
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    
    if (collide(board, player)) {
        gameOver = true;
        gameOverScreen.classList.remove('hidden');
        finalScoreElement.innerText = score;
    }
}

// Movement
function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        sweep();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(board, player)) {
        player.pos.x -= offset;
    }
}

// Rotation
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    
    // Wall kick
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir); // Undo rotation
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function hardDrop() {
    while (!collide(board, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(board, player);
    sweep();
    dropCounter = 0;
}

// Game Loop
function update(time = 0) {
    if (gameOver || isPaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    updateParticles(deltaTime);

    if (isAnimating) {
        clearAnimationTimer += deltaTime;
        if (clearAnimationTimer >= CLEAR_ANIMATION_DURATION) {
            processClearedLines();
        }
    } else {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
    }

    draw();
    animationId = requestAnimationFrame(update);
}

// Input Handling
document.addEventListener('keydown', event => {
    if (gameOver) return;

    if (event.key === 'Escape') {
        togglePause();
        return;
    }

    if (isPaused || isAnimating) return;

    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            playerMove(-1);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            playerMove(1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            playerDrop();
            score += 1; // Soft drop score
            scoreElement.innerText = score;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            playerRotate(1);
            break;
        case ' ':
            hardDrop();
            break;
    }
});

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
        cancelAnimationFrame(animationId);
    } else {
        pauseScreen.classList.add('hidden');
        lastTime = performance.now();
        update(lastTime);
    }
}

function resetGame() {
    board = createMatrix(COLS, ROWS);
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    gameOver = false;
    isPaused = false;
    isAnimating = false;
    clearingLines = [];
    particles = [];
    floatingTexts = [];
    
    scoreElement.innerText = score;
    levelElement.innerText = level;
    linesElement.innerText = lines;
    
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    
    playerReset();
    lastTime = performance.now();
    update(lastTime);
}

restartBtn.addEventListener('click', resetGame);

// Start Game
resetGame();
