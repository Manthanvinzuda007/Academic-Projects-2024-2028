 
        const LobbyUI = {
            mode: 'ai',

            init() {
                this.setupNameObserver();
            },

            showPanel(panelId) {
                document.querySelectorAll('.emerald-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(panelId).classList.remove('hidden');
            },

            openSetup(mode) {
                this.mode = mode;
                document.getElementById('p2-row').style.display = mode === 'pvp' ? 'flex' : 'none';
                document.getElementById('ai-difficulty-row').style.display = mode === 'ai' ? 'flex' : 'none';
                this.showPanel('lobby-setup');
            },

            startGame() {
                // Show game area
                document.body.classList.add('game-active');
                document.getElementById('lobby-layer').classList.add('hidden-lobby');

                // Pass settings to the original game logic securely
                const diff = document.getElementById('ai-diff').value;
                game.setupAndStart(this.mode, diff);

                // Update UI Names
                this.updateNames();
            },

            exitToLobby() {
                document.body.classList.remove('game-active');
                this.toggleSidePanel(false);
                this.showPanel('lobby-main');
            },

            toggleSidePanel(open) {
                const panel = document.getElementById('side-panel');
                const overlay = document.getElementById('side-overlay');
                if (open) {
                    panel.classList.add('open');
                    overlay.classList.add('open');
                } else {
                    panel.classList.remove('open');
                    overlay.classList.remove('open');
                }
            },

            updateNames() {
                const p1 = document.getElementById('p1-name').value || "Player 1";
                const p2 = this.mode === 'ai' ? "AI" : (document.getElementById('p2-name').value || "Player 2");
                
                document.getElementById('name-black').innerText = p1;
                document.getElementById('name-white').innerText = p2;
            },

            setupNameObserver() {
                // Sync winner modal text
                const observer = new MutationObserver(() => {
                    const resScreen = document.getElementById('screen-result');
                    if (resScreen && !resScreen.classList.contains('hidden') && !resScreen.dataset.modified) {
                        resScreen.dataset.modified = "true";
                        const p1 = document.getElementById('p1-name').value || "Player 1";
                        const p2 = this.mode === 'ai' ? "AI" : (document.getElementById('p2-name').value || "Player 2");
                        
                        const winText = document.getElementById('winner-text');
                        if (winText.innerText.includes("Black")) {
                            winText.innerText = p1 + " Wins!";
                        } else if (winText.innerText.includes("White")) {
                            winText.innerText = p2 + " Wins!";
                        }
                    } else if (resScreen && resScreen.classList.contains('hidden')) {
                        resScreen.dataset.modified = "";
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true, characterData: true });
            }
        };

        window.addEventListener('DOMContentLoaded', () => LobbyUI.init());

        
        // =========================================
        //       END OF LOBBY UI SCRIPT 
        // =========================================    

        // --- AUDIO SYNTHESIZER ---
        const audio = {
            ctx: null,
            muted: false,
            init() {
                if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            },
            playTone(freq, type, duration, vol=0.1) {
                if (!this.ctx || this.muted) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch(e) {}
            },
            place() { this.init(); this.playTone(400, 'sine', 0.1, 0.2); },
            flip() { this.init(); this.playTone(300, 'triangle', 0.15, 0.1); },
            turn() { this.init(); this.playTone(600, 'sine', 0.1, 0.05); },
            win() { 
                this.init(); 
                [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'sine', 0.3, 0.2), i * 150));
            }
        };

        // Wake up audio context on first click
        document.body.addEventListener('click', () => { audio.init(); }, { once: true });

        // --- GAME ENGINE ---
        const BLACK = 1;
        const WHITE = 2;
        const EMPTY = 0;
        const DIRS = [
            [-1,-1], [-1,0], [-1,1],
            [0,-1],          [0,1],
            [1,-1],  [1,0],  [1,1]
        ];

        const game = {
            board: [],
            turn: BLACK,
            mode: 'ai', // 'pvp' or 'ai'
            aiDiff: 'medium',
            isAnimating: false,

            setupAndStart(mode, diff) {
                this.mode = mode;
                this.aiDiff = diff;
                this.init();
            },

            init() {
                this.board = Array(8).fill().map(() => Array(8).fill(EMPTY));
                this.board[3][3] = WHITE;
                this.board[3][4] = BLACK;
                this.board[4][3] = BLACK;
                this.board[4][4] = WHITE;
                this.turn = BLACK;
                this.isAnimating = false;

                document.getElementById('screen-result').classList.add('hidden');
                
                this.renderBoard();
                this.updateUI();
            },

            getFlips(r, c, player, currentBoard = this.board) {
                if (currentBoard[r][c] !== EMPTY) return [];
                const opponent = player === BLACK ? WHITE : BLACK;
                const flips = [];

                for (let [dr, dc] of DIRS) {
                    let nr = r + dr;
                    let nc = c + dc;
                    let line = [];

                    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc] === opponent) {
                        line.push({r: nr, c: nc});
                        nr += dr;
                        nc += dc;
                    }

                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && currentBoard[nr][nc] === player && line.length > 0) {
                        flips.push(...line);
                    }
                }
                return flips;
            },

            getValidMoves(player, currentBoard = this.board) {
                const moves = [];
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const flips = this.getFlips(r, c, player, currentBoard);
                        if (flips.length > 0) moves.push({r, c, flips});
                    }
                }
                return moves;
            },

            handleCellClick(r, c) {
                if (this.isAnimating) return;
                if (this.mode === 'ai' && this.turn === WHITE) return; // Prevent clicking during AI turn

                const flips = this.getFlips(r, c, this.turn);
                if (flips.length > 0) {
                    this.executeMove(r, c, flips);
                }
            },

            executeMove(r, c, flips) {
                this.isAnimating = true;
                this.board[r][c] = this.turn;
                audio.place();
                
                // Add new disc
                const cell = document.getElementById(`cell-${r}-${c}`);
                cell.innerHTML = '';
                cell.appendChild(this.createDiscDOM(this.turn));

                // Flip animation
                flips.forEach((pos, idx) => {
                    setTimeout(() => {
                        this.board[pos.r][pos.c] = this.turn;
                        const flipCell = document.getElementById(`cell-${pos.r}-${pos.c}`);
                        const disc = flipCell.querySelector('.disc');
                        if (disc) disc.className = `disc state-${this.turn}`;
                        audio.flip();
                    }, 50 + (idx * 50)); // stagger the flips
                });

                // Complete Turn
                setTimeout(() => {
                    this.isAnimating = false;
                    this.turn = this.turn === BLACK ? WHITE : BLACK;
                    this.updateUI();
                    audio.turn();
                    this.checkTurn();
                }, 100 + (flips.length * 50));
            },

            checkTurn() {
                const validMoves = this.getValidMoves(this.turn);
                if (validMoves.length === 0) {
                    const opponent = this.turn === BLACK ? WHITE : BLACK;
                    const oppMoves = this.getValidMoves(opponent);
                    
                    if (oppMoves.length === 0) {
                        this.endGame();
                    } else {
                        document.getElementById('status-msg').innerText = "No moves! Turn passed.";
                        setTimeout(() => {
                            this.turn = opponent;
                            this.updateUI();
                            this.checkTurn();
                        }, 1500);
                    }
                } else {
                    if (this.mode === 'ai' && this.turn === WHITE) {
                        document.getElementById('status-msg').innerText = "AI is thinking...";
                        setTimeout(() => this.doAITurn(validMoves), 800);
                    }
                }
            },

            // --- AI LOGIC ---
            WEIGHTS: [
                [ 100, -20,  10,   5,   5,  10, -20, 100],
                [ -20, -50,  -2,  -2,  -2,  -2, -50, -20],
                [  10,  -2,   1,   1,   1,   1,  -2,  10],
                [   5,  -2,   1,   1,   1,   1,  -2,   5],
                [   5,  -2,   1,   1,   1,   1,  -2,   5],
                [  10,  -2,   1,   1,   1,   1,  -2,  10],
                [ -20, -50,  -2,  -2,  -2,  -2, -50, -20],
                [ 100, -20,  10,   5,   5,  10, -20, 100]
            ],

            doAITurn(validMoves) {
                let bestMove = validMoves[0];

                if (this.aiDiff === 'easy') {
                    bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                } else if (this.aiDiff === 'medium') {
                    // Greedy
                    let maxFlips = -1;
                    validMoves.forEach(m => {
                        if (m.flips.length > maxFlips) { maxFlips = m.flips.length; bestMove = m; }
                    });
                } else if (this.aiDiff === 'hard') {
                    // Strategic Weights
                    let bestScore = -Infinity;
                    validMoves.forEach(m => {
                        let score = this.WEIGHTS[m.r][m.c] + m.flips.length;
                        if (score > bestScore || (score === bestScore && Math.random() > 0.5)) { 
                            bestScore = score; bestMove = m; 
                        }
                    });
                }

                this.executeMove(bestMove.r, bestMove.c, bestMove.flips);
            },

            /* --- RENDER LOGIC --- */
            createDiscDOM(color) {
                const wrapper = document.createElement('div');
                wrapper.className = 'disc-wrapper';
                const disc = document.createElement('div');
                disc.className = `disc state-${color}`;
                disc.innerHTML = `<div class="disc-face disc-black"></div><div class="disc-face disc-white"></div>`;
                wrapper.appendChild(disc);
                return wrapper;
            },

            renderBoard() {
                const boardEl = document.getElementById('board');
                boardEl.innerHTML = '';
                
                const isHumanTurn = !this.isAnimating && (this.mode === 'pvp' || this.turn === BLACK);
                const validMoves = isHumanTurn ? this.getValidMoves(this.turn) : [];

                // Set body class for turn color hints
                document.body.className = `game-active ${this.turn === WHITE ? 'turn-white' : ''}`;

                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.id = `cell-${r}-${c}`;
                        cell.onclick = () => this.handleCellClick(r, c);

                        if (this.board[r][c] !== EMPTY) {
                            cell.appendChild(this.createDiscDOM(this.board[r][c]));
                        } else if (validMoves.some(m => m.r === r && m.c === c)) {
                            const hint = document.createElement('div');
                            hint.className = 'valid-hint';
                            cell.appendChild(hint);
                        }
                        boardEl.appendChild(cell);
                    }
                }
            },

            updateUI() {
                let blacks = 0, whites = 0;
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (this.board[r][c] === BLACK) blacks++;
                        else if (this.board[r][c] === WHITE) whites++;
                    }
                }

                document.getElementById('count-black').innerText = blacks;
                document.getElementById('count-white').innerText = whites;

                document.getElementById('pill-black').classList.toggle('active-turn', this.turn === BLACK);
                document.getElementById('pill-white').classList.toggle('active-turn', this.turn === WHITE);

                if (!this.isAnimating) {
                    const p1 = document.getElementById('p1-name').value || "Black";
                    const p2 = this.mode === 'ai' ? "AI" : (document.getElementById('p2-name').value || "White");
                    document.getElementById('status-msg').innerText = `${this.turn === BLACK ? p1 : p2}'s Turn`;
                    this.renderBoard(); // refresh hints
                }
            },

            endGame() {
                let blacks = 0, whites = 0;
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (this.board[r][c] === BLACK) blacks++;
                        else if (this.board[r][c] === WHITE) whites++;
                    }
                }

                const resScreen = document.getElementById('screen-result');
                const winText = document.getElementById('winner-text');
                const scoreStr = document.getElementById('winner-score');
                const p1 = document.getElementById('p1-name').value || "Player 1";
                const p2 = this.mode === 'ai' ? "AI" : (document.getElementById('p2-name').value || "Player 2");

                if (blacks > whites) {
                    winText.innerText = `${p1} Wins!`;
                    winText.className = "text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400";
                } else if (whites > blacks) {
                    winText.innerText = `${p2} Wins!`;
                    winText.className = "text-3xl font-extrabold mb-2 text-white";
                } else {
                    winText.innerText = "It's a Tie!";
                    winText.className = "text-3xl font-extrabold mb-2 text-slate-300";
                }

                scoreStr.innerText = `${blacks} - ${whites}`;
                audio.win();
                
                setTimeout(() => resScreen.classList.remove('hidden'), 1000);
            }
        };
 
