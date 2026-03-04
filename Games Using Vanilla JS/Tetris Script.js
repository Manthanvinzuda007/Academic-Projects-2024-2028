        // --- GAME CONSTANTS & SETUP ---
        const canvas = document.getElementById('tetris');
        const ctx = canvas.getContext('2d');
        const nextCanvas = document.getElementById('next-piece');
        const nextCtx = nextCanvas.getContext('2d');

        const BLOCK_SIZE = 30;
        const COLS = 10;
        const ROWS = 20;

        // Scale context to make drawing easier (1 unit = 1 block)
        ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
        // Next piece canvas needs different scaling as it's a 4x4 grid max
        nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

        // Neon colors for pieces
        const COLORS = [
            null,
            '#00ffff', // 1: Cyan (I)
            '#0055ff', // 2: Blue (J)
            '#ffaa00', // 3: Orange (L)
            '#ffff00', // 4: Yellow (O)
            '#00ff00', // 5: Green (S)
            '#aa00ff', // 6: Purple (T)
            '#ff0055'  // 7: Red (Z)
        ];

        // Standard Tetromino Shapes (Matrices)
        const SHAPES = [
            [], // 0 is empty
            [ // 1: I
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ],
            [ // 2: J
                [0, 2, 0],
                [0, 2, 0],
                [2, 2, 0]
            ],
            [ // 3: L
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ],
            [ // 4: O
                [4, 4],
                [4, 4]
            ],
            [ // 5: S
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0]
            ],
            [ // 6: T
                [0, 0, 0],
                [6, 6, 6],
                [0, 6, 0]
            ],
            [ // 7: Z
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ]
        ];

        // --- GAME STATE ---
        let arena = createMatrix(COLS, ROWS);
        let player = {
            pos: {x: 0, y: 0},
            matrix: null,
            score: 0,
            lines: 0,
            level: 1
        };
        let nextMatrix = null;
        
        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;
        
        let isGameOver = false;
        let isPaused = false;
        let animationId = null;

        // --- DOM ELEMENTS ---
        const scoreEl = document.getElementById('score');
        const linesEl = document.getElementById('lines');
        const levelEl = document.getElementById('level');
        const finalScoreEl = document.getElementById('final-score');
        
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over');
        const pauseScreen = document.getElementById('pause-screen');

        // --- CORE FUNCTIONS ---

        // Create a 2D array (matrix) filled with 0s
        function createMatrix(w, h) {
            const matrix = [];
            while (h--) {
                matrix.push(new Array(w).fill(0));
            }
            return matrix;
        }

        // Generate a random piece matrix
        function randomPiece() {
            const pieces = '1234567';
            const type = pieces[Math.floor(Math.random() * pieces.length)];
            return SHAPES[type];
        }

        // Beautiful 3D/Neon Block rendering
        function drawBlock(context, x, y, colorIndex, isGhost = false) {
            const color = COLORS[colorIndex];
            if (!color) return;

            context.fillStyle = isGhost ? 'transparent' : color;
            context.fillRect(x, y, 1, 1);

            if (isGhost) {
                // Draw ghost outline
                context.strokeStyle = color;
                context.lineWidth = 0.05;
                context.globalAlpha = 0.5;
                context.strokeRect(x + 0.05, y + 0.05, 0.9, 0.9);
                context.globalAlpha = 1.0;
            } else {
                // 3D Bevel Effect
                // Top Highlight
                context.fillStyle = 'rgba(255, 255, 255, 0.3)';
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + 1, y);
                context.lineTo(x + 0.8, y + 0.2);
                context.lineTo(x + 0.2, y + 0.2);
                context.fill();

                // Left Highlight
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x, y + 1);
                context.lineTo(x + 0.2, y + 0.8);
                context.lineTo(x + 0.2, y + 0.2);
                context.fill();

                // Bottom Shadow
                context.fillStyle = 'rgba(0, 0, 0, 0.4)';
                context.beginPath();
                context.moveTo(x, y + 1);
                context.lineTo(x + 1, y + 1);
                context.lineTo(x + 0.8, y + 0.8);
                context.lineTo(x + 0.2, y + 0.8);
                context.fill();

                // Right Shadow
                context.beginPath();
                context.moveTo(x + 1, y);
                context.lineTo(x + 1, y + 1);
                context.lineTo(x + 0.8, y + 0.8);
                context.lineTo(x + 0.8, y + 0.2);
                context.fill();

                // Inner Border (Neon pop)
                context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                context.lineWidth = 0.05;
                context.strokeRect(x + 0.1, y + 0.1, 0.8, 0.8);
            }
        }

        // Draw a matrix (arena or player)
        function drawMatrix(matrix, offset, context, isGhost = false) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        drawBlock(context, x + offset.x, y + offset.y, value, isGhost);
                    }
                });
            });
        }

        // Calculate Ghost Piece position
        function getGhostPos() {
            const ghost = {
                matrix: player.matrix,
                pos: { x: player.pos.x, y: player.pos.y }
            };
            while (!collide(arena, ghost)) {
                ghost.pos.y++;
            }
            ghost.pos.y--; // Step back to last valid position
            return ghost.pos;
        }

        // Main draw function
        function draw() {
            // Clear main canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Arena (locked pieces)
            drawMatrix(arena, {x: 0, y: 0}, ctx);

            if (player.matrix) {
                // Draw Ghost Piece
                const ghostPos = getGhostPos();
                drawMatrix(player.matrix, ghostPos, ctx, true);

                // Draw Player Piece
                drawMatrix(player.matrix, player.pos, ctx);
            }

            // Draw Next Piece
            nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
            if (nextMatrix) {
                // Center the next piece in the 4x4 preview box
                const offset = {
                    x: nextMatrix[0].length === 2 ? 1 : 0.5,
                    y: nextMatrix.length === 2 ? 1 : 1
                };
                if(nextMatrix.length === 4) { offset.x = 0; offset.y = 0; } // 'I' piece
                
                drawMatrix(nextMatrix, offset, nextCtx);
            }
        }

        // Collision detection
        function collide(board, obj) {
            const m = obj.matrix;
            const o = obj.pos;
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

        // Merge player into arena
        function merge(board, p) {
            p.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        board[y + p.pos.y][x + p.pos.x] = value;
                    }
                });
            });
        }

        // Rotate matrix
        function rotate(matrix, dir) {
            // Transpose
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [
                        matrix[x][y],
                        matrix[y][x],
                    ] = [
                        matrix[y][x],
                        matrix[x][y],
                    ];
                }
            }
            // Reverse rows
            if (dir > 0) {
                matrix.forEach(row => row.reverse());
            } else {
                matrix.reverse();
            }
        }

        // Player actions
        function playerDrop() {
            player.pos.y++;
            if (collide(arena, player)) {
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
                updateScore();
            }
            dropCounter = 0;
        }

        function hardDrop() {
            while (!collide(arena, player)) {
                player.pos.y++;
            }
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            updateScore();
            dropCounter = 0;
        }

        function playerMove(offset) {
            player.pos.x += offset;
            if (collide(arena, player)) {
                player.pos.x -= offset;
            }
        }

        function playerRotate(dir) {
            const pos = player.pos.x;
            let offset = 1;
            rotate(player.matrix, dir);
            
            // Wall kick logic (basic)
            while (collide(arena, player)) {
                player.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > player.matrix[0].length) {
                    rotate(player.matrix, -dir); // Rotate back if failed
                    player.pos.x = pos;
                    return;
                }
            }
        }

        function playerReset() {
            if (!nextMatrix) {
                nextMatrix = randomPiece();
            }
            player.matrix = nextMatrix;
            nextMatrix = randomPiece();
            
            player.pos.y = 0;
            player.pos.x = (Math.floor(COLS / 2)) - (Math.floor(player.matrix[0].length / 2));

            // Check Game Over
            if (collide(arena, player)) {
                gameOver();
            }
        }

        // Clear completed lines
        function arenaSweep() {
            let rowCount = 1;
            outer: for (let y = arena.length - 1; y >= 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) {
                        continue outer;
                    }
                }

                // Remove the full row
                const row = arena.splice(y, 1)[0].fill(0);
                // Add empty row at top
                arena.unshift(row);
                ++y;

                player.score += rowCount * 100 * player.level;
                player.lines++;
                rowCount *= 2; // Bonus for multiple lines
            }

            // Level up every 10 lines
            player.level = Math.floor(player.lines / 10) + 1;
            // Increase speed based on level (max speed limit applied)
            dropInterval = Math.max(100, 1000 - (player.level - 1) * 100); 
        }

        // Update UI stats
        function updateScore() {
            scoreEl.innerText = player.score;
            linesEl.innerText = player.lines;
            levelEl.innerText = player.level;
        }

        // Game Loop
        function update(time = 0) {
            if (isGameOver || isPaused) return;

            const deltaTime = time - lastTime;
            lastTime = time;

            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                playerDrop();
            }

            draw();
            animationId = requestAnimationFrame(update);
        }

        // State Managers
        function startGame() {
            arena = createMatrix(COLS, ROWS);
            player.score = 0;
            player.lines = 0;
            player.level = 1;
            dropInterval = 1000;
            updateScore();
            
            isGameOver = false;
            isPaused = false;
            startScreen.classList.add('hidden');
            gameOverScreen.classList.add('hidden');
            pauseScreen.classList.add('hidden');
            
            nextMatrix = randomPiece();
            playerReset();
            
            lastTime = performance.now();
            update();
        }

        function gameOver() {
            isGameOver = true;
            cancelAnimationFrame(animationId);
            finalScoreEl.innerText = player.score;
            gameOverScreen.classList.remove('hidden');
        }

        function togglePause() {
            if (isGameOver) return;
            isPaused = !isPaused;
            if (isPaused) {
                cancelAnimationFrame(animationId);
                pauseScreen.classList.remove('hidden');
            } else {
                pauseScreen.classList.add('hidden');
                lastTime = performance.now();
                update();
            }
        }

        // --- INPUT HANDLING ---

        // Keyboard Inputs
        document.addEventListener('keydown', event => {
            if (isGameOver) return;
            
            switch (event.keyCode) {
                case 37: // Left
                    if(!isPaused) playerMove(-1);
                    break;
                case 39: // Right
                    if(!isPaused) playerMove(1);
                    break;
                case 40: // Down
                    if(!isPaused) playerDrop();
                    break;
                case 38: // Up
                    if(!isPaused) playerRotate(1);
                    break;
                case 32: // Space
                    if(!isPaused) hardDrop();
                    break;
                case 80: // P
                    togglePause();
                    break;
            }
            if(!isPaused) draw(); // Immediate visual feedback
        });

        // Touch / Mobile Inputs
        let touchInterval;
        const addTouchControl = (id, action, holdAction = null) => {
            const btn = document.getElementById(id);
            if(!btn) return;

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double firing & scrolling
                if (isGameOver || isPaused) return;
                action();
                draw();
                
                if (holdAction) {
                    touchInterval = setInterval(() => {
                        holdAction();
                        draw();
                    }, 100); // Repeat speed for holding down
                }
            });

            const stopHold = (e) => {
                e.preventDefault();
                clearInterval(touchInterval);
            };

            btn.addEventListener('touchend', stopHold);
            btn.addEventListener('touchcancel', stopHold);
        };

        addTouchControl('btn-left', () => playerMove(-1), () => playerMove(-1));
        addTouchControl('btn-right', () => playerMove(1), () => playerMove(1));
        addTouchControl('btn-down', () => playerDrop(), () => playerDrop());
        addTouchControl('btn-rotate', () => playerRotate(1));
        addTouchControl('btn-drop', () => hardDrop());

        // UI Button Events
        document.getElementById('start-btn').addEventListener('click', startGame);
        document.getElementById('restart-btn').addEventListener('click', startGame);
        document.getElementById('resume-btn').addEventListener('click', togglePause);

        // Initial Draw (Background)
        draw();
