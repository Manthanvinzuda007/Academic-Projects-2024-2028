           const LobbyUI = {
            init() {
                // Set up observer to perfectly intercept the native Game Over trigger
                this.setupObserver();
            },

            showPanel(panelId) {
                document.querySelectorAll('.neon-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(panelId).classList.remove('hidden');
            },

            startGame() {
                // Show original wrapper
                document.body.classList.add('game-active');
                document.getElementById('lobby-layer').classList.add('hidden-lobby');
                
                // Safely trigger the original logic's Start Button
                const startBtn = document.getElementById('start-btn');
                if (startBtn) startBtn.click();
            },

            showGameOver() {
                // Show our Premium Game Over Modal
                document.getElementById('premium-game-over').classList.remove('hidden');
                
                // Sync the score from the original UI
                const currentScore = document.getElementById('score').innerText;
                document.getElementById('premium-score').innerText = currentScore;
            },

            playAgain() {
                // Hide modal and trigger original start logic again
                document.getElementById('premium-game-over').classList.add('hidden');
                const startBtn = document.getElementById('start-btn');
                if (startBtn) startBtn.click();
            },

            setupObserver() {
                // The original script sets "overlay.style.display = 'flex'" when you die.
                // We watch for this inline style change to trigger our Premium Modal safely!
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.attributeName === 'style') {
                            const origOverlay = document.getElementById('overlay');
                            if (origOverlay && origOverlay.style.display === 'flex') {
                                // Double check the game wrapper is active so it doesn't trigger in lobby
                                if (document.body.classList.contains('game-active')) {
                                    this.showGameOver();
                                }
                            }
                        }
                    });
                });

                const overlayEl = document.getElementById('overlay');
                if (overlayEl) {
                    observer.observe(overlayEl, { attributes: true, attributeFilter: ['style'] });
                }
            }
        };

        window.addEventListener('DOMContentLoaded', () => LobbyUI.init());
        // =========================================
        // END OF LOBBY UI SCRIPT
        // =========================================
        const canvas = document.getElementById('snakeGame');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('high-score');
        const overlay = document.getElementById('overlay');
        const startBtn = document.getElementById('start-btn');
        const msgTitle = document.getElementById('msg-title');

        // Game constants
        const GRID_SIZE = 20;
        let TILE_COUNT;
        let TILE_SIZE;

        // Game state
        let snake = [];
        let food = { x: 5, y: 5 };
        let dx = 0;
        let dy = 0;
        let nextDx = 0;
        let nextDy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snake-high-score') || 0;
        let gameLoop;
        let isPaused = true;
        let speed = 100;

        highScoreElement.textContent = highScore;

        function resize() {
            const size = Math.min(window.innerWidth - 40, 400);
            canvas.width = size;
            canvas.height = size;
            TILE_COUNT = 20;
            TILE_SIZE = canvas.width / TILE_COUNT;
            draw();
        }

        window.addEventListener('resize', resize);
        resize();

        function drawRect(x, y, color, isFood = false) {
            ctx.fillStyle = color;
            if (isFood) {
                ctx.beginPath();
                ctx.arc(
                    x * TILE_SIZE + TILE_SIZE/2, 
                    y * TILE_SIZE + TILE_SIZE/2, 
                    TILE_SIZE/2 - 2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            } else {
                ctx.fillRect(x * TILE_SIZE + 1, y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            }
        }

        function draw() {
            // Clear canvas
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw snake
            snake.forEach((segment, index) => {
                const color = index === 0 ? '#4ade80' : '#22c55e'; // Head is lighter green
                drawRect(segment.x, segment.y, color);
            });

            // Draw food
            drawRect(food.x, food.y, '#ef4444', true);
        }

        function update() {
            if (isPaused) return;

            dx = nextDx;
            dy = nextDy;

            const head = { x: snake[0].x + dx, y: snake[0].y + dy };

            // Wall collision
            if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
                gameOver();
                return;
            }

            // Self collision
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver();
                    return;
                }
            }

            snake.unshift(head);

            // Food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                spawnFood();
            } else {
                snake.pop();
            }

            draw();
        }

        function spawnFood() {
            let newX, newY;
            let onSnake = true;
            while (onSnake) {
                newX = Math.floor(Math.random() * TILE_COUNT);
                newY = Math.floor(Math.random() * TILE_COUNT);
                onSnake = snake.some(segment => segment.x === newX && segment.y === newY);
            }
            food = { x: newX, y: newY };
        }

        function gameOver() {
            clearInterval(gameLoop);
            isPaused = true;
            msgTitle.textContent = "GAME OVER";
            overlay.style.display = 'flex';
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snake-high-score', highScore);
                highScoreElement.textContent = highScore;
            }
        }

        function resetGame() {
            const mid = Math.floor(TILE_COUNT / 2);
            snake = [
                { x: mid, y: mid },
                { x: mid, y: mid + 1 },
                { x: mid, y: mid + 2 }
            ];
            dx = 0;
            dy = -1;
            nextDx = 0;
            nextDy = -1;
            score = 0;
            scoreElement.textContent = score;
            spawnFood();
            draw();
        }

        function startGame() {
            resetGame();
            overlay.style.display = 'none';
            isPaused = false;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, speed);
        }

        function handleInput(key) {
            switch (key) {
                case 'ArrowUp':
                case 'w':
                    if (dy !== 1) { nextDx = 0; nextDy = -1; }
                    break;
                case 'ArrowDown':
                case 's':
                    if (dy !== -1) { nextDx = 0; nextDy = 1; }
                    break;
                case 'ArrowLeft':
                case 'a':
                    if (dx !== 1) { nextDx = -1; nextDy = 0; }
                    break;
                case 'ArrowRight':
                case 'd':
                    if (dx !== -1) { nextDx = 1; nextDy = 0; }
                    break;
            }
        }

        window.addEventListener('keydown', e => handleInput(e.key));
        startBtn.addEventListener('click', startGame);

        // Mobile Button Listeners
        document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowUp'); });
        document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowDown'); });
        document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowLeft'); });
        document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowRight'); });
        
        // Mouse fallbacks for mobile buttons
        document.getElementById('btn-up').addEventListener('mousedown', () => handleInput('ArrowUp'));
        document.getElementById('btn-down').addEventListener('mousedown', () => handleInput('ArrowDown'));
        document.getElementById('btn-left').addEventListener('mousedown', () => handleInput('ArrowLeft'));
        document.getElementById('btn-right').addEventListener('mousedown', () => handleInput('ArrowRight'));

        // Initial draw
        draw();
