/* By Manthan Vinzuda */
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

        function initGame() {
            snake = [
                { x: 10, y: 10 },
                { x: 10, y: 11 },
                { x: 10, y: 12 }
            ];
            dx = 0;
            dy = -1;
            nextDx = 0;
            nextDy = -1;
            score = 0;
            speed = 100;
            scoreElement.textContent = score;
            createFood();
        }

        function createFood() {
            food = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT)
            };
            // Prevent food from spawning on snake
            snake.forEach(part => {
                if (part.x === food.x && part.y === food.y) createFood();
            });
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
                if (snake[i].x === head.x && snake[i].y === head.y) {
                    gameOver();
                    return;
                }
            }

            snake.unshift(head);

            // Food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('snake-high-score', highScore);
                }
                createFood();
                // Increase speed slightly
                if (speed > 50) {
                    clearInterval(gameLoop);
                    speed -= 1;
                    gameLoop = setInterval(gameStep, speed);
                }
            } else {
                snake.pop();
            }
        }

        function draw() {
            // Background
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines (subtle)
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 0.5;
            for(let i=0; i<=TILE_COUNT; i++) {
                ctx.beginPath();
                ctx.moveTo(i * TILE_SIZE, 0);
                ctx.lineTo(i * TILE_SIZE, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * TILE_SIZE);
                ctx.lineTo(canvas.width, i * TILE_SIZE);
                ctx.stroke();
            }

            // Food
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ef4444';
            ctx.beginPath();
            ctx.arc(
                food.x * TILE_SIZE + TILE_SIZE/2, 
                food.y * TILE_SIZE + TILE_SIZE/2, 
                TILE_SIZE/2.5, 0, Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;

            // Snake
            snake.forEach((part, index) => {
                const isHead = index === 0;
                ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
                
                // Draw rounded segments
                const r = TILE_SIZE * 0.2;
                const x = part.x * TILE_SIZE + 1;
                const y = part.y * TILE_SIZE + 1;
                const w = TILE_SIZE - 2;
                const h = TILE_SIZE - 2;
                
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, isHead ? 6 : 4);
                ctx.fill();

                if (isHead) {
                    // Eyes
                    ctx.fillStyle = '#000';
                    const eyeSize = TILE_SIZE / 6;
                    if (dx === 1) { // Right
                        ctx.fillRect(x + w - 6, y + 4, eyeSize, eyeSize);
                        ctx.fillRect(x + w - 6, y + h - 6, eyeSize, eyeSize);
                    } else if (dx === -1) { // Left
                        ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);
                        ctx.fillRect(x + 4, y + h - 6, eyeSize, eyeSize);
                    } else if (dy === -1) { // Up
                        ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);
                        ctx.fillRect(x + w - 6, y + 4, eyeSize, eyeSize);
                    } else { // Down
                        ctx.fillRect(x + 4, y + h - 6, eyeSize, eyeSize);
                        ctx.fillRect(x + w - 6, y + h - 6, eyeSize, eyeSize);
                    }
                }
            });
        }

        function gameStep() {
            update();
            draw();
        }

        function gameOver() {
            isPaused = true;
            clearInterval(gameLoop);
            msgTitle.textContent = "GAME OVER";
            msgTitle.classList.add('text-red-500');
            startBtn.textContent = "RETRY";
            overlay.classList.remove('hidden');
        }

        function startGame() {
            initGame();
            isPaused = false;
            overlay.classList.add('hidden');
            msgTitle.classList.remove('text-red-500');
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, speed);
        }

        // Input Handling
        function handleInput(key) {
            switch(key) {
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
