// Manthan Vinzuda 
        // =========================================
        // LOBBY UI Logic
        // =========================================
        const LobbyUI = {
            init() {
                this.setupNameObserver();
            },

            showPanel(panelId) {
                document.querySelectorAll('.wood-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(panelId).classList.remove('hidden');
            },

            startGame() {
                // Set name in original UI statically so observer catches it
                const p1Name = document.getElementById('p1-name').value || "Player 1";
                const p2Name = document.getElementById('p2-name').value || "Player 2";
                
                // Keep the suffix so users know which color is theirs
                document.getElementById('ui-name-p1').innerText = p1Name + " (IVORY)";
                document.getElementById('ui-name-p2').innerText = p2Name + " (EBONY)";
                
                // Show the board
                document.body.classList.add('game-active');

                // Start original game script safely. Since Checkers timer starts on page load,
                // calling initGame() cleanly resets the board and starts the timer fresh!
                if(typeof initGame === 'function') initGame();

                // Make sure resize layout kicks in
                setTimeout(() => {
                    if(typeof renderBoard === 'function') renderBoard();
                }, 100);
            },

            exitToLobby() {
                document.body.classList.remove('game-active');
                this.toggleSidePanel(false);
                this.showPanel('lobby-main');
                
                // Pause timer by clearing the original interval variable securely
                if (typeof timerInterval !== 'undefined') {
                    clearInterval(timerInterval);
                }
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

            setupNameObserver() {
                // This ensures the custom name also applies dynamically if the original logic replaces texts.
                // Mostly handles the Game Over modal winner text in Checkers.
                const observer = new MutationObserver(() => {
                    const customP1 = document.getElementById('p1-name').value || "PLAYER 1";
                    const customP2 = document.getElementById('p2-name').value || "PLAYER 2";
                    
                    const modalTitle = document.getElementById('modal-title');
                    if (modalTitle) {
                        if (modalTitle.innerText === "PLAYER 1 WINS!") {
                            modalTitle.innerText = customP1.toUpperCase() + " WINS!";
                        } else if (modalTitle.innerText === "PLAYER 2 WINS!") {
                            modalTitle.innerText = customP2.toUpperCase() + " WINS!";
                        }
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true, characterData: true });
            }
        };

        // Initialize Observer
        LobbyUI.init();
  

        // Game logic variables and constants
        // Using 1 and 2 for white and black pieces respectively, negative values for kings, and 0 for empty cells
        // This allows us to easily determine piece type and ownership with simple checks (e.g., Math.abs(board[r][c]) === turn)
        // Additionally, using a single board array to represent the entire state simplifies move generation and rendering logic.
        const WHITE = 1, BLACK = 2, EMPTY = 0;
        let board = [], turn = WHITE, selected = null, validMoves = [], isBusy = false;
        let timers = { 1: 300, 2: 300 }; // 5 minutes each
        let timerInterval = null;
        let lastMove = null;

        const CROWN = `<svg class="king-crown" viewBox="0 0 24 24"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>`;

        const SFX = {
            ctx: null,
            play(f, d, v) {
                if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                const o = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                o.type = 'triangle';
                o.frequency.setValueAtTime(f, this.ctx.currentTime);
                o.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + d);
                g.gain.setValueAtTime(v, this.ctx.currentTime);
                g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + d);
                o.connect(g); g.connect(this.ctx.destination);
                o.start(); o.stop(this.ctx.currentTime + d);
            },
            move() { this.play(160, 0.1, 0.2); },
            king() { this.play(440, 0.4, 0.2); }
        };

        function initGame() {
            board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
            for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) board[r][c] = BLACK;
            for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) board[r][c] = WHITE;
            
            turn = WHITE; selected = null; validMoves = []; timers = { 1: 300, 2: 300 }; lastMove = null;
            document.getElementById('modal').style.display = 'none';
            
            clearInterval(timerInterval);
            startTimer();
            renderBoard();
            updateUI();
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timers[turn]--;
                if (timers[turn] <= 0) {
                    gameOver(turn === WHITE ? BLACK : WHITE, "Time Out!");
                }
                updateUI();
            }, 1000);
        }

        function renderBoard() {
            const container = document.getElementById('board');
            container.innerHTML = '';
            const cellSize = container.offsetWidth / 8;

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const cell = document.createElement('div');
                    cell.className = `cell ${(r+c)%2===0 ? 'light' : 'dark'}`;
                    if (lastMove) {
                        if (lastMove.fromR === r && lastMove.fromC === c) cell.classList.add('last-move-src');
                        if (lastMove.toR === r && lastMove.toC === c) cell.classList.add('last-move-dest');
                    }
                    if (validMoves.some(m => m.toR === r && m.toC === c)) cell.classList.add('valid-target');
                    cell.onclick = () => onCellClick(r, c);
                    container.appendChild(cell);

                    const val = board[r][c];
                    if (val !== EMPTY) {
                        const p = document.createElement('div');
                        p.className = `piece ${Math.abs(val) === WHITE ? 'ivory' : 'ebony'}`;
                        if (val < 0) p.innerHTML = CROWN;
                        if (selected && selected.r === r && selected.c === c) p.classList.add('selected');
                        
                        p.style.width = (cellSize * 0.82) + 'px';
                        p.style.height = (cellSize * 0.82) + 'px';
                        p.style.left = (c * cellSize + (cellSize * 0.09)) + 'px';
                        p.style.top = (r * cellSize + (cellSize * 0.09)) + 'px';

                        p.onclick = (e) => { e.stopPropagation(); onPieceClick(r, c); };
                        container.appendChild(p);
                    }
                }
            }
        }

        function onPieceClick(r, c) {
            if (Math.abs(board[r][c]) === turn) {
                selected = { r, c };
                validMoves = getFilteredMoves(r, c, board, turn);
                renderBoard();
                SFX.move();
            }
        }

        function onCellClick(r, c) {
            const move = validMoves.find(m => m.toR === r && m.toC === c);
            if (move) executeMove(move);
            else { selected = null; validMoves = []; renderBoard(); }
        }

        function executeMove(move) {
            const { fromR, fromC, toR, toC, isJump } = move;
            let piece = board[fromR][fromC];
            board[fromR][fromC] = EMPTY;
            board[toR][toC] = piece;
            if (isJump) board[(fromR+toR)/2][(fromC+toC)/2] = EMPTY;

            if (piece === WHITE && toR === 0) { board[toR][toC] = -WHITE; SFX.king(); }
            if (piece === BLACK && toR === 7) { board[toR][toC] = -BLACK; SFX.king(); }
            
            SFX.move();
            lastMove = move;

            if (isJump) {
                const chain = getPieceMoves(toR, toC, board).filter(m => m.isJump);
                if (chain.length > 0) {
                    selected = { r: toR, c: toC };
                    validMoves = chain;
                    renderBoard();
                    return;
                }
            }

            turn = (turn === WHITE) ? BLACK : WHITE;
            selected = null; validMoves = [];
            renderBoard();
            updateUI();
            checkGameState();
        }

        function getPieceMoves(r, c, b) {
            const p = b[r][c];
            if (p === EMPTY) return [];
            const moves = [];
            const dirs = (p < 0) ? [[1,1], [1,-1], [-1,1], [-1,-1]] : 
                           (Math.abs(p) === WHITE ? [[-1,1], [-1,-1]] : [[1,1], [1,-1]]);

            dirs.forEach(([dr, dc]) => {
                const tr = r + dr, tc = c + dc;
                if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                    if (b[tr][tc] === EMPTY) {
                        moves.push({ fromR: r, fromC: c, toR: tr, toC: tc, isJump: false });
                    } else if (Math.abs(b[tr][tc]) !== Math.abs(p)) {
                        const jr = tr + dr, jc = tc + dc;
                        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && b[jr][jc] === EMPTY) {
                            moves.push({ fromR: r, fromC: c, toR: jr, toC: jc, isJump: true });
                        }
                    }
                }
            });
            return moves;
        }

        function getFilteredMoves(r, c, b, player) {
            const allMoves = [];
            for(let i=0; i<8; i++) for(let j=0; j<8; j++) 
                if(Math.abs(b[i][j]) === player) allMoves.push(...getPieceMoves(i, j, b));
            const jumps = allMoves.filter(m => m.isJump);
            const pMoves = getPieceMoves(r, c, b);
            return jumps.length > 0 ? pMoves.filter(m => m.isJump) : pMoves;
        }

        function checkGameState() {
            let moves = [];
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) 
                if (Math.abs(board[r][c]) === turn) moves.push(...getPieceMoves(r, c, board));
            
            if (moves.length === 0) {
                gameOver(turn === WHITE ? BLACK : WHITE, "No Moves Left!");
            }
        }

        function gameOver(winner, reason) {
            clearInterval(timerInterval);
            document.getElementById('modal').style.display = 'flex';
            document.getElementById('modal-title').innerText = winner === WHITE ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
            document.getElementById('modal-body').innerText = reason;
        }

        function updateUI() {
            const fmt = (s) => {
                const m = Math.floor(s / 60);
                const sec = s % 60;
                return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
            };
            document.getElementById('timer-p1').innerText = fmt(timers[1]);
            document.getElementById('timer-p2').innerText = fmt(timers[2]);
            
            document.getElementById('card-p1').classList.toggle('active', turn === WHITE);
            document.getElementById('card-p2').classList.toggle('active', turn === BLACK);
        }

        window.onresize = renderBoard;
        window.onload = initGame;
