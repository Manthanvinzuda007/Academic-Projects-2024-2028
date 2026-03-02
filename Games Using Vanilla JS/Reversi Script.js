        // --- AUDIO SYNTHESIZER ---
        const audio = {
            ctx: null,
            init() {
                if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            },
            playTone(freq, type, duration, vol=0.1) {
                if (!this.ctx) return;
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
            },
            place() { this.init(); this.playTone(400, 'sine', 0.1, 0.2); },
            flip() { this.init(); this.playTone(300, 'triangle', 0.15, 0.1); },
            turn() { this.init(); this.playTone(600, 'sine', 0.1, 0.05); },
            win() { 
                this.init(); 
                this.playTone(400, 'sine', 0.3, 0.2);
                setTimeout(() => this.playTone(500, 'sine', 0.3, 0.2), 150);
                setTimeout(() => this.playTone(600, 'sine', 0.5, 0.2), 300);
            },
            error() { this.init(); this.playTone(150, 'sawtooth', 0.2, 0.1); }
        };

        // --- CONSTANTS & DIRECTIONS ---
        const EMPTY = 0, BLACK = 1, WHITE = 2;
        const DIRS = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // N, S, W, E
            [-1, -1], [-1, 1], [1, -1], [1, 1] // NW, NE, SW, SE
        ];

        // --- UI CONTROLLER ---
        const ui = {
            cells: [],
            discs: [],
            
            showScreen(id) {
                document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
                document.getElementById(id).classList.add('active');
            },
            
            initBoard() {
                const boardEl = document.getElementById('board');
                boardEl.innerHTML = '';
                this.cells = [];
                this.discs = [];

                for (let r = 0; r < 8; r++) {
                    this.cells[r] = [];
                    this.discs[r] = [];
                    for (let c = 0; c < 8; c++) {
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.dataset.r = r;
                        cell.dataset.c = c;
                        cell.onclick = () => game.handlePlayerClick(r, c);
                        
                        const discContainer = document.createElement('div');
                        discContainer.className = 'disc-container';
                        
                        const disc = document.createElement('div');
                        disc.className = 'disc';
                        // Keep track of total rotation for smooth continuous flipping
                        disc.dataset.rotation = 0; 
                        
                        const faceBlack = document.createElement('div');
                        faceBlack.className = 'face face-black';
                        
                        const faceWhite = document.createElement('div');
                        faceWhite.className = 'face face-white';
                        
                        disc.appendChild(faceBlack);
                        disc.appendChild(faceWhite);
                        discContainer.appendChild(disc);
                        cell.appendChild(discContainer);
                        
                        boardEl.appendChild(cell);
                        this.cells[r][c] = cell;
                        this.discs[r][c] = disc;
                    }
                }
            },

            updateBoard(state, animatePlacements = []) {
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const val = state.board[r][c];
                        const disc = this.discs[r][c];
                        const currentVal = parseInt(disc.dataset.val || 0);
                        
                        if (val !== EMPTY) {
                            disc.dataset.val = val;
                            let rotation = parseInt(disc.dataset.rotation);
                            
                            // If it's a new placement
                            if (currentVal === EMPTY) {
                                rotation = val === BLACK ? 0 : 180;
                                disc.style.opacity = 1;
                                disc.style.transform = `scale(1) rotateY(${rotation}deg)`;
                                if (animatePlacements.some(p => p.r===r && p.c===c)) {
                                    // Drop animation simulated by a quick scale bounce via transition
                                    disc.style.transform = `scale(1.3) rotateY(${rotation}deg)`;
                                    setTimeout(() => {
                                        disc.style.transform = `scale(1) rotateY(${rotation}deg)`;
                                    }, 50);
                                }
                            } 
                            // If it's a flip
                            else if (currentVal !== val) {
                                // Add 180 to current rotation for smooth continuous spin
                                rotation += 180; 
                                disc.style.transform = `scale(1) rotateY(${rotation}deg)`;
                            }
                            disc.dataset.rotation = rotation;
                        } else {
                            disc.dataset.val = EMPTY;
                            disc.style.opacity = 0;
                            disc.style.transform = `scale(0.5)`;
                        }
                    }
                }
            },

            highlightMoves(moves) {
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        this.cells[r][c].classList.remove('valid-move');
                    }
                }
                moves.forEach(m => {
                    this.cells[m.r][m.c].classList.add('valid-move');
                });
            },

            updateScore(black, white, turn) {
                document.getElementById('count-black').innerText = black;
                document.getElementById('count-white').innerText = white;
                
                document.getElementById('score-black').classList.toggle('active-turn', turn === BLACK);
                document.getElementById('score-white').classList.toggle('active-turn', turn === WHITE);
            },

            showToast(msg) {
                const t = document.getElementById('message-toast');
                t.innerText = msg;
                t.classList.add('show');
                setTimeout(() => t.classList.remove('show'), 2000);
            },

            showResult(black, white) {
                this.showScreen('screen-result');
                const title = document.getElementById('winner-text');
                const score = document.getElementById('winner-score');
                const icon = document.getElementById('winner-icon');
                
                score.innerText = `Black: ${black}  |  White: ${white}`;
                
                if (black > white) {
                    title.innerText = "Black Wins!";
                    title.className = "text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200";
                    icon.innerText = "⚫";
                } else if (white > black) {
                    title.innerText = "White Wins!";
                    title.className = "text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-white";
                    icon.innerText = "⚪";
                } else {
                    title.innerText = "It's a Draw!";
                    title.className = "text-4xl font-extrabold mb-2 text-slate-300";
                    icon.innerText = "🤝";
                }
            }
        };

        // --- GAME ENGINE ---
        const game = {
            state: { board: [], turn: BLACK },
            mode: 'PVP', // PVP or PVAI
            aiDifficulty: 'easy',
            playerColor: BLACK,
            history: [],
            isAnimating: false,

            setMode(mode, difficulty = 'easy') {
                this.mode = mode;
                this.aiDifficulty = difficulty;
                if (mode === 'PVAI') {
                    ui.showScreen('screen-side');
                } else {
                    this.start(BLACK); // In PVP, local player controls both, but we start from board setup
                }
            },

            start(playerSide) {
                this.playerColor = playerSide;
                this.state = {
                    board: Array(8).fill(null).map(() => Array(8).fill(EMPTY)),
                    turn: BLACK
                };
                this.history = [];
                
                // Initial setup
                this.state.board[3][3] = WHITE;
                this.state.board[4][4] = WHITE;
                this.state.board[3][4] = BLACK;
                this.state.board[4][3] = BLACK;

                ui.initBoard();
                
                if (this.mode === 'PVAI') {
                    document.getElementById('name-black').innerText = playerSide === BLACK ? 'You (Black)' : 'AI (Black)';
                    document.getElementById('name-white').innerText = playerSide === WHITE ? 'You (White)' : 'AI (White)';
                } else {
                    document.getElementById('name-black').innerText = 'Player 1';
                    document.getElementById('name-white').innerText = 'Player 2';
                }

                ui.showScreen('screen-game');
                this.updateGameState();
            },

            restart() {
                this.start(this.playerColor);
            },

            saveState() {
                this.history.push(JSON.parse(JSON.stringify(this.state)));
            },

            undo() {
                if (this.isAnimating || this.history.length === 0) return;
                
                // If playing AI, undo two moves (AI's move and Player's last move)
                if (this.mode === 'PVAI' && this.history.length >= 2) {
                    this.history.pop(); // Pop AI state
                    this.state = this.history.pop();
                } else {
                    this.state = this.history.pop();
                }
                this.updateGameState(false);
            },

            getValidMoves(board, player) {
                let moves = [];
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (board[r][c] !== EMPTY) continue;
                        let flips = this.getFlips(board, r, c, player);
                        if (flips.length > 0) {
                            moves.push({r, c, flips});
                        }
                    }
                }
                return moves;
            },

            getFlips(board, r, c, player) {
                let flips = [];
                const opponent = player === BLACK ? WHITE : BLACK;

                for (let [dr, dc] of DIRS) {
                    let nr = r + dr, nc = c + dc;
                    let tempFlips = [];
                    
                    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opponent) {
                        tempFlips.push({r: nr, c: nc});
                        nr += dr; nc += dc;
                    }
                    
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
                        flips.push(...tempFlips);
                    }
                }
                return flips;
            },

            async handlePlayerClick(r, c) {
                if (this.isAnimating) return;
                if (this.mode === 'PVAI' && this.state.turn !== this.playerColor) return;

                const validMoves = this.getValidMoves(this.state.board, this.state.turn);
                const move = validMoves.find(m => m.r === r && m.c === c);

                if (move) {
                    audio.init();
                    this.executeMove(move);
                } else {
                    audio.error();
                }
            },

            executeMove(move) {
                this.saveState();
                this.isAnimating = true;
                
                // Place piece
                this.state.board[move.r][move.c] = this.state.turn;
                ui.updateBoard(this.state, [{r: move.r, c: move.c}]);
                audio.place();
                ui.highlightMoves([]); // clear highlights during anim

                // Flip pieces with staggered animation
                let flipDelay = 150;
                setTimeout(() => {
                    move.flips.forEach((f, i) => {
                        setTimeout(() => {
                            this.state.board[f.r][f.c] = this.state.turn;
                            ui.updateBoard(this.state);
                            audio.flip();
                        }, i * 50); // Stagger flips
                    });

                    // Wait for flips to finish then switch turn
                    setTimeout(() => {
                        this.state.turn = this.state.turn === BLACK ? WHITE : BLACK;
                        this.isAnimating = false;
                        audio.turn();
                        this.updateGameState();
                    }, move.flips.length * 50 + 200);

                }, flipDelay);
            },

            updateGameState(checkTurnSkip = true) {
                ui.updateBoard(this.state);
                
                let bCount = 0, wCount = 0;
                for(let r=0; r<8; r++) {
                    for(let c=0; c<8; c++) {
                        if(this.state.board[r][c] === BLACK) bCount++;
                        if(this.state.board[r][c] === WHITE) wCount++;
                    }
                }
                ui.updateScore(bCount, wCount, this.state.turn);

                let validMoves = this.getValidMoves(this.state.board, this.state.turn);
                
                if (validMoves.length === 0) {
                    // Check if other player has moves
                    let nextTurn = this.state.turn === BLACK ? WHITE : BLACK;
                    let opponentMoves = this.getValidMoves(this.state.board, nextTurn);
                    
                    if (opponentMoves.length === 0) {
                        // Game Over
                        audio.win();
                        setTimeout(() => ui.showResult(bCount, wCount), 1000);
                        return;
                    } else if (checkTurnSkip) {
                        ui.showToast(`${this.state.turn === BLACK ? 'Black' : 'White'} has no moves. Turn skipped.`);
                        this.state.turn = nextTurn;
                        setTimeout(() => this.updateGameState(), 1500);
                        return;
                    }
                }

                ui.highlightMoves(validMoves);

                // Trigger AI if it's AI's turn
                if (this.mode === 'PVAI' && this.state.turn !== this.playerColor && validMoves.length > 0) {
                    setTimeout(() => ai.makeMove(validMoves), 800);
                }
            }
        };

        // --- AI ENGINE ---
        const ai = {
            makeMove(validMoves) {
                let bestMove = null;
                
                if (game.aiDifficulty === 'easy') {
                    bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                } 
                else if (game.aiDifficulty === 'medium') {
                    // Greedy: Maximize flips
                    validMoves.sort((a, b) => b.flips.length - a.flips.length);
                    bestMove = validMoves[0];
                } 
                else if (game.aiDifficulty === 'hard') {
                    bestMove = this.getBestMoveHard(validMoves, game.state.board, game.state.turn);
                }

                if (bestMove) {
                    game.executeMove(bestMove);
                }
            },

            // Heuristics mapping for Hard Mode
            WEIGHTS: [
                [ 50, -20,  10,   5,   5,  10, -20,  50],
                [-20, -30,  -5,  -5,  -5,  -5, -30, -20],
                [ 10,  -5,   5,   1,   1,   5,  -5,  10],
                [  5,  -5,   1,   1,   1,   1,  -5,   5],
                [  5,  -5,   1,   1,   1,   1,  -5,   5],
                [ 10,  -5,   5,   1,   1,   5,  -5,  10],
                [-20, -30,  -5,  -5,  -5,  -5, -30, -20],
                [ 50, -20,  10,   5,   5,  10, -20,  50]
            ],

            getBestMoveHard(validMoves, board, player) {
                let bestScore = -Infinity;
                let bestMove = validMoves[0];

                for (let move of validMoves) {
                    // Simulate move
                    let tempBoard = board.map(row => [...row]);
                    tempBoard[move.r][move.c] = player;
                    for (let f of move.flips) tempBoard[f.r][f.c] = player;

                    let score = this.evaluateBoard(tempBoard, player) + move.flips.length;

                    // Slight randomizer for equal scores to avoid predictable play
                    if (score > bestScore || (score === bestScore && Math.random() > 0.5)) {
                        bestScore = score;
                        bestMove = move;
                    }
                }
                return bestMove;
            },

            evaluateBoard(board, player) {
                let score = 0;
                let opponent = player === BLACK ? WHITE : BLACK;

                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (board[r][c] === player) {
                            score += this.WEIGHTS[r][c];
                        } else if (board[r][c] === opponent) {
                            score -= this.WEIGHTS[r][c];
                        }
                    }
                }
                
                // Mobility bonus
                let myMoves = game.getValidMoves(board, player).length;
                let oppMoves = game.getValidMoves(board, opponent).length;
                score += (myMoves - oppMoves) * 5;

                return score;
            }
        };

        // Wake up audio context on first click
        document.body.addEventListener('click', () => {
            audio.init();
        }, { once: true });

