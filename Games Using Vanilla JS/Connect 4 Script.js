// Manthan Vinzuda 
        // --- LOBBY UI LOGIC ---
        // This entire block is new and handles the lobby interface, player name input, and seamless transition into the original game. It cleverly uses a MutationObserver to intercept and replace the original game's static "Player 1's Turn" text with the custom names entered by the user, without needing to alter any of the original game logic or DOM structure.
        const LobbyUI = {
            init() {
                this.setupNameObserver();
            },

            showPanel(panelId) {
                // Hide all panels, then show target
                ['lobby-main', 'lobby-setup', 'lobby-help'].forEach(id => {
                    const el = document.getElementById(id);
                    el.classList.add('hidden');
                    el.classList.replace('scale-100', 'scale-95');
                });
                
                const target = document.getElementById(panelId);
                target.classList.remove('hidden');
                // Brief delay to allow DOM render before scaling up for animation
                setTimeout(() => target.classList.replace('scale-95', 'scale-100'), 10);
            },

            startGame() {
                // Update static score labels safely
                const p1Name = document.getElementById('p1-name').value || "Player 1";
                const p2Name = document.getElementById('p2-name').value || "Player 2";
                document.getElementById('score-label-1').innerText = p1Name;
                document.getElementById('score-label-2').innerText = p2Name;
                
                // Show the board
                document.body.classList.add('game-active');

                // Force reset original game to ensure fresh start (calls original reset logic safely)
                if (typeof resetGame === 'function') {
                    resetGame(true); // true clears the scores too
                }
            },

            exitToLobby() {
                document.body.classList.remove('game-active');
                this.showPanel('lobby-main');
            },

            setupNameObserver() {
                // This cleverly intercepts the original game's string assignments 
                // ("Player 1's Turn") and replaces them with Custom Names 
                // BEFORE the user sees it, preventing the need to alter the original logic!
                const observer = new MutationObserver(() => {
                    const p1 = document.getElementById('p1-name').value || "Player 1";
                    const p2 = document.getElementById('p2-name').value || "Player 2";
                    
                    const status = document.getElementById('status-display');
                    if (status && status.innerHTML.includes("Player <span")) {
                        let html = status.innerHTML;
                        // To prevent infinite loop, we strip out the word "Player" entirely during replacement
                        if (html.includes(">1</span>")) {
                            status.innerHTML = html.replace("Player <span", "<span").replace(">1</span>", ">" + p1 + "</span>");
                        } else if (html.includes(">2</span>")) {
                            status.innerHTML = html.replace("Player <span", "<span").replace(">2</span>", ">" + p2 + "</span>");
                        }
                    }

                    const winMsg = document.getElementById('win-message');
                    if (winMsg && winMsg.innerHTML.includes("Player <span")) {
                        let html = winMsg.innerHTML;
                        if (html.includes(">1</span>")) {
                            winMsg.innerHTML = html.replace("Player <span", "<span").replace(">1</span>", ">" + p1 + "</span>");
                        } else if (html.includes(">2</span>")) {
                            winMsg.innerHTML = html.replace("Player <span", "<span").replace(">2</span>", ">" + p2 + "</span>");
                        }
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true, characterData: true });
            }
        };

        // Initialize Observer
        LobbyUI.init();

        // Note: The original game logic and sound engine remain completely untouched and operate as originally designed, ensuring that all core mechanics and audio effects function exactly as intended while seamlessly integrating with the new lobby UI.

    // --- REALISTIC SOUND ENGINE (Web Audio API) ---
        class SoundEngine {
            constructor() {
                this.ctx = null;
                this.muted = false;
            }

            init() {
                if (this.ctx) return;
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Creates a short burst of noise for physical impact sounds
            createNoiseBuffer() {
                const bufferSize = this.ctx.sampleRate * 0.1;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                return buffer;
            }

            playDrop(row) {
                if (this.muted || !this.ctx) return;
                this.init();
                const now = this.ctx.currentTime;
                
                // 1. The "Thud" (Low frequency resonance)
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const lowFreq = 120 - (row * 8); // Pitch varies slightly by depth
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(lowFreq, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.15);
                
                gain.gain.setValueAtTime(0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(now);
                osc.stop(now + 0.2);

                // 2. The "Clack" (High frequency transient noise)
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer();
                const noiseFilter = this.ctx.createBiquadFilter();
                const noiseGain = this.ctx.createGain();

                noiseFilter.type = 'highpass';
                noiseFilter.frequency.setValueAtTime(1500, now);
                
                noiseGain.gain.setValueAtTime(0.15, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(this.ctx.destination);
                noise.start(now);
            }

            playWin() {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                
                const playPureNote = (freq, start, duration, volume = 0.1) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, start);
                    gain.gain.setValueAtTime(0, start);
                    gain.gain.linearRampToValueAtTime(volume, start + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(start);
                    osc.stop(start + duration);
                };

                // Triumphant soft major arpeggio
                playPureNote(329.63, now, 1.0); // E4
                playPureNote(392.00, now + 0.1, 1.0); // G4
                playPureNote(523.25, now + 0.2, 1.2); // C5
                playPureNote(659.25, now + 0.3, 1.5, 0.08); // E5
            }

            playDraw() {
                if (this.muted || !this.ctx) return;
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(110, now + 0.6);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.6);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.6);
            }

            playClick() {
                if (this.muted || !this.ctx) return;
                this.init();
                const now = this.ctx.currentTime;
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer();
                const filter = this.ctx.createBiquadFilter();
                const gain = this.ctx.createGain();

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(2000, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start(now);
            }
        }

        const sounds = new SoundEngine();

        // --- GAME LOGIC ---
        const ROWS = 6;
        const COLS = 7;
        let board = [];
        let currentPlayer = 1;
        let gameActive = true;
        let scores = { 1: 0, 2: 0, draw: 0 };

        const boardElement = document.getElementById('game-board');
        const statusDisplay = document.getElementById('status-display');
        const overlay = document.getElementById('overlay');
        const winMessage = document.getElementById('win-message');
        const playAgainBtn = document.getElementById('play-again-btn');
        const resetBtn = document.getElementById('reset-btn');
        const muteBtn = document.getElementById('mute-btn');
        const soundIcon = document.getElementById('sound-icon');

        function initBoard() {
            board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
            boardElement.innerHTML = '';
            
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const slot = document.createElement('div');
                    slot.classList.add('slot');
                    slot.dataset.row = r;
                    slot.dataset.col = c;
                    boardElement.appendChild(slot);
                }
            }
            updateStatus();
        }

        function updateScores() {
            document.getElementById('score-1').textContent = scores[1];
            document.getElementById('score-2').textContent = scores[2];
            document.getElementById('score-draw').textContent = scores.draw;
        }

        function updateStatus() {
            if (gameActive) {
                statusDisplay.innerHTML = `Player <span class="${currentPlayer === 1 ? 'text-red-500' : 'text-yellow-400'}">${currentPlayer}</span>'s Turn`;
            }
        }

        boardElement.addEventListener('click', (e) => {
            sounds.init(); 
            if (!gameActive) return;

            const slot = e.target.closest('.slot');
            if (!slot) return;

            const col = parseInt(slot.dataset.col);
            handleMove(col);
        });

        function handleMove(col) {
            let row = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (board[r][col] === 0) {
                    row = r;
                    break;
                }
            }

            if (row === -1) return;

            board[row][col] = currentPlayer;
            
            const slot = document.querySelector(`.slot[data-row="${row}"][data-col="${col}"]`);
            const token = document.createElement('div');
            token.classList.add('token', currentPlayer === 1 ? 'red' : 'yellow', 'falling');
            slot.appendChild(token);

            sounds.playDrop(row);

            const winResult = checkWin(row, col);
            if (winResult) {
                endGame(currentPlayer, winResult);
                return;
            }

            if (board.every(row => row.every(cell => cell !== 0))) {
                endGame(0);
                return;
            }

            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateStatus();
        }

        function checkWin(row, col) {
            const directions = [
                [[0, 1], [0, -1]], // Horizontal
                [[1, 0], [-1, 0]], // Vertical
                [[1, 1], [-1, -1]], // Diagonal 1
                [[1, -1], [-1, 1]]  // Diagonal 2
            ];

            for (const dir of directions) {
                let count = 1;
                let winningTokens = [[row, col]];

                for (const [dr, dc] of dir) {
                    let r = row + dr;
                    let c = col + dc;
                    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === currentPlayer) {
                        count++;
                        winningTokens.push([r, c]);
                        r += dr;
                        c += dc;
                    }
                }

                if (count >= 4) return winningTokens;
            }
            return null;
        }

        function endGame(winner, tokens = []) {
            gameActive = false;
            
            if (winner === 0) {
                scores.draw++;
                winMessage.textContent = "It's a Draw!";
                statusDisplay.textContent = "Draw Game";
                sounds.playDraw();
            } else {
                scores[winner]++;
                winMessage.innerHTML = `Player <span class="${winner === 1 ? 'text-red-500' : 'text-yellow-400'}">${winner}</span> Wins!`;
                statusDisplay.textContent = `Player ${winner} won the round!`;
                
                tokens.forEach(([r, c]) => {
                    const slot = document.querySelector(`.slot[data-row="${r}"][data-col="${c}"]`);
                    slot.querySelector('.token').classList.add('win-highlight');
                });

                sounds.playWin();
            }

            updateScores();

            setTimeout(() => {
                overlay.classList.remove('hidden');
                setTimeout(() => {
                    overlay.classList.add('opacity-100');
                    overlay.querySelector('div').classList.remove('scale-95');
                }, 10);
            }, 800);
        }

        function resetGame(fullReset = false) {
            sounds.playClick();
            gameActive = true;
            currentPlayer = 1;
            overlay.classList.add('hidden');
            overlay.classList.remove('opacity-100');
            overlay.querySelector('div').classList.add('scale-95');
            
            if (fullReset) {
                scores = { 1: 0, 2: 0, draw: 0 };
                updateScores();
            }
            
            initBoard();
        }

        muteBtn.addEventListener('click', () => {
            sounds.init();
            sounds.muted = !sounds.muted;
            if (sounds.muted) {
                soundIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
            } else {
                soundIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
                sounds.playClick();
            }
        });

        playAgainBtn.addEventListener('click', () => resetGame(false));
        resetBtn.addEventListener('click', () => resetGame(true));

        window.onload = initBoard;
  
