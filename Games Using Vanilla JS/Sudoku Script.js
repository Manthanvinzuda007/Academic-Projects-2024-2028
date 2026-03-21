        const LobbyUI = {
            init() {
                // Intercept the Native Game Over Modal's Play Again button to smoothly route back to Lobby
                const nativePlayAgain = document.getElementById('modal-play-again-btn');
                if (nativePlayAgain) {
                    nativePlayAgain.removeAttribute('onclick');
                    nativePlayAgain.addEventListener('click', () => {
                        document.getElementById('game-over-modal').style.display = 'none';
                        this.exitToLobby();
                    });
                }
            },

            startGame() {
                // Show game area
                document.body.classList.add('game-active');
                document.getElementById('lobby-layer').style.opacity = '0';
                setTimeout(() => document.getElementById('lobby-layer').style.pointerEvents = 'none', 500);

                // 1. Get chosen difficulty from Lobby
                const chosenDiff = document.getElementById('lobby-difficulty').value;
                
                // 2. Programmatically select it in the original hidden header
                const diffSpans = document.querySelectorAll('#diffs span');
                diffSpans.forEach(span => {
                    span.classList.remove('active');
                    if (span.getAttribute('data-level') === chosenDiff) {
                        span.classList.add('active');
                        // 3. Trigger native game start smoothly
                        if(typeof uiController !== 'undefined') {
                            uiController.startNewGame(chosenDiff);
                        }
                    }
                });
            },

            exitToLobby() {
                document.body.classList.remove('game-active');
                document.getElementById('lobby-layer').style.opacity = '1';
                document.getElementById('lobby-layer').style.pointerEvents = 'all';

                // Pause the game timer so it doesn't run in the background
                if(typeof uiController !== 'undefined' && uiController.gameState.timerId) {
                    clearInterval(uiController.gameState.timerId);
                }
            }
        };

        window.addEventListener('DOMContentLoaded', () => LobbyUI.init());

        // The original game logic will be initialized after the lobby, so we define it globally
        /**
         * SUDOKU ENGINE
         */
        class SudokuEngine {
            constructor() {
                this.board = Array(81).fill(0);
                this.solution = Array(81).fill(0);
            }

            generate(difficulty = 'easy') {
                this.board = Array(81).fill(0);
                this._fillBoard(0);
                this.solution = [...this.board];
                
                let attempts = { 'easy': 35, 'medium': 45, 'hard': 54, 'expert': 60 }[difficulty];
                this._removeNumbers(attempts);
                return { board: [...this.board], solution: this.solution };
            }

            _isValid(board, index, num) {
                const row = Math.floor(index / 9);
                const col = index % 9;
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;

                for (let i = 0; i < 9; i++) {
                    if (board[row * 9 + i] === num && (row * 9 + i) !== index) return false;
                    if (board[i * 9 + col] === num && (i * 9 + col) !== index) return false;
                    const r = boxRow + Math.floor(i / 3);
                    const c = boxCol + (i % 3);
                    if (board[r * 9 + c] === num && (r * 9 + c) !== index) return false;
                }
                return true;
            }

            _fillBoard(index) {
                if (index >= 81) return true;
                if (this.board[index] !== 0) return this._fillBoard(index + 1);

                let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                // Shuffle
                for (let i = nums.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [nums[i], nums[j]] = [nums[j], nums[i]];
                }

                for (let num of nums) {
                    if (this._isValid(this.board, index, num)) {
                        this.board[index] = num;
                        if (this._fillBoard(index + 1)) return true;
                        this.board[index] = 0;
                    }
                }
                return false;
            }

            _removeNumbers(count) {
                let attempts = count;
                while (attempts > 0) {
                    let cellId = Math.floor(Math.random() * 81);
                    while (this.board[cellId] === 0) {
                        cellId = Math.floor(Math.random() * 81);
                    }
                    this.board[cellId] = 0;
                    attempts--;
                }
            }
        }

        /**
         * UI CONTROLLER
         */
        class UIController {
            constructor() {
                this.engine = new SudokuEngine();
                this.boardEl = document.getElementById('sudoku-board');
                this.timerEl = document.getElementById('timer');
                this.mistakesEl = document.getElementById('mistakes');
                
                this.gameState = {
                    originalBoard: [],
                    currentBoard: [],
                    solution: [],
                    notes: Array(81).fill().map(() => new Set()),
                    history: [],
                    selectedIndex: null,
                    notesMode: false,
                    mistakes: 0,
                    maxMistakes: 3,
                    seconds: 0,
                    timerId: null,
                    isGameOver: false
                };

                this.bindEvents();
            }

            startNewGame(difficulty = 'easy') {
                const puzzle = this.engine.generate(difficulty);
                
                this.gameState = {
                    originalBoard: [...puzzle.board],
                    currentBoard: [...puzzle.board],
                    solution: [...puzzle.solution],
                    notes: Array(81).fill().map(() => new Set()),
                    history: [],
                    selectedIndex: null,
                    notesMode: false,
                    mistakes: 0,
                    maxMistakes: 3,
                    seconds: 0,
                    timerId: this.gameState.timerId, // Preserve timer reference to clear it
                    isGameOver: false
                };

                // Reset UI Toggles
                const notesBadge = document.getElementById('notes-status');
                notesBadge.classList.remove('on');
                notesBadge.innerText = 'OFF';

                this.renderBoard();
                this.updateStats();
                this.startTimer();
                document.getElementById('game-over-modal').style.display = 'none';
            }

            bindEvents() {
                // Numpad
                document.querySelectorAll('.num-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (btn.dataset.num) this.handleInput(parseInt(btn.dataset.num));
                    });
                });

                // Keyboard
                document.addEventListener('keydown', (e) => {
                    if (this.gameState.isGameOver || this.gameState.selectedIndex === null) return;
                    
                    if (e.key >= '1' && e.key <= '9') {
                        this.handleInput(parseInt(e.key));
                    } else if (e.key === 'Backspace' || e.key === 'Delete') {
                        this.handleErase();
                    } else if (e.key === 'n' || e.key === 'N') {
                        this.toggleNotesMode();
                    } else if (e.key === 'ArrowUp') this.moveSelection(-9);
                    else if (e.key === 'ArrowDown') this.moveSelection(9);
                    else if (e.key === 'ArrowLeft') this.moveSelection(-1);
                    else if (e.key === 'ArrowRight') this.moveSelection(1);
                });

                // Actions
                document.getElementById('erase-btn').addEventListener('click', () => this.handleErase());
                document.getElementById('undo-btn').addEventListener('click', () => this.handleUndo());
                document.getElementById('notes-btn').addEventListener('click', () => this.toggleNotesMode());
                document.getElementById('hint-btn').addEventListener('click', () => this.handleHint());
            }

            renderBoard() {
                this.boardEl.innerHTML = '';
                for (let i = 0; i < 81; i++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.index = i;
                    
                    if (this.gameState.originalBoard[i] !== 0) {
                        cell.innerText = this.gameState.originalBoard[i];
                        cell.classList.add('fixed');
                    } else if (this.gameState.currentBoard[i] !== 0) {
                        cell.innerText = this.gameState.currentBoard[i];
                        cell.classList.add('user-input');
                        // Highlight errors if they exist
                        if (this.gameState.currentBoard[i] !== this.gameState.solution[i]) {
                            cell.classList.add('error');
                        }
                    } else {
                        // Render Notes
                        const notes = this.gameState.notes[i];
                        if (notes.size > 0) {
                            const grid = document.createElement('div');
                            grid.className = 'notes-grid';
                            for (let n = 1; n <= 9; n++) {
                                const noteDiv = document.createElement('div');
                                noteDiv.className = 'note';
                                if (notes.has(n)) noteDiv.innerText = n;
                                grid.appendChild(noteDiv);
                            }
                            cell.appendChild(grid);
                        }
                    }

                    cell.addEventListener('click', () => this.selectCell(i));
                    this.boardEl.appendChild(cell);
                }
                this.highlightCells();
            }

            selectCell(index) {
                if (this.gameState.isGameOver) return;
                this.gameState.selectedIndex = index;
                this.highlightCells();
            }

            moveSelection(delta) {
                if (this.gameState.selectedIndex === null) return;
                let newIdx = this.gameState.selectedIndex + delta;
                if (newIdx >= 0 && newIdx < 81) {
                    this.selectCell(newIdx);
                }
            }

            highlightCells() {
                const cells = document.querySelectorAll('.cell');
                cells.forEach(c => c.classList.remove('selected', 'related', 'same-num'));

                const idx = this.gameState.selectedIndex;
                if (idx === null) return;

                const row = Math.floor(idx / 9);
                const col = idx % 9;
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;

                const selectedVal = this.gameState.currentBoard[idx] || this.gameState.originalBoard[idx];

                for (let i = 0; i < 81; i++) {
                    const r = Math.floor(i / 9);
                    const c = i % 9;
                    const bR = Math.floor(r / 3) * 3;
                    const bC = Math.floor(c / 3) * 3;

                    // Same row, col, or box
                    if (r === row || c === col || (bR === boxRow && bC === boxCol)) {
                        cells[i].classList.add('related');
                    }

                    // Same number highlight
                    const cellVal = this.gameState.currentBoard[i] || this.gameState.originalBoard[i];
                    if (selectedVal !== 0 && cellVal === selectedVal) {
                        cells[i].classList.add('same-num');
                    }
                }

                // Explicitly highlight the selected cell last so it overlays
                cells[idx].classList.remove('related', 'same-num');
                cells[idx].classList.add('selected');
            }

            toggleNotesMode() {
                this.gameState.notesMode = !this.gameState.notesMode;
                const badge = document.getElementById('notes-status');
                if (this.gameState.notesMode) {
                    badge.classList.add('on');
                    badge.innerText = 'ON';
                } else {
                    badge.classList.remove('on');
                    badge.innerText = 'OFF';
                }
            }

            handleInput(num) {
                const idx = this.gameState.selectedIndex;
                if (idx === null || this.gameState.isGameOver || this.gameState.originalBoard[idx] !== 0) return;

                // Save to history
                this.gameState.history.push({
                    index: idx,
                    val: this.gameState.currentBoard[idx],
                    notes: new Set(this.gameState.notes[idx])
                });

                if (this.gameState.notesMode) {
                    // Handle Notes
                    if (this.gameState.currentBoard[idx] === 0) {
                        if (this.gameState.notes[idx].has(num)) {
                            this.gameState.notes[idx].delete(num);
                        } else {
                            this.gameState.notes[idx].add(num);
                        }
                    }
                } else {
                    // Handle Normal Input
                    if (this.gameState.currentBoard[idx] === num) {
                        // Erase if same number clicked
                        this.gameState.currentBoard[idx] = 0;
                    } else {
                        this.gameState.currentBoard[idx] = num;
                        // Check mistake
                        if (num !== this.gameState.solution[idx]) {
                            this.gameState.mistakes++;
                            this.updateStats();
                            if (this.gameState.mistakes >= this.gameState.maxMistakes) {
                                this.gameOver(false);
                            }
                        } else {
                            // Automatically clear notes in the same row/col/box
                            this.clearRelatedNotes(idx, num);
                            this.checkWin();
                        }
                    }
                }
                this.renderBoard();
            }

            clearRelatedNotes(index, num) {
                const row = Math.floor(index / 9);
                const col = index % 9;
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;

                for (let i = 0; i < 81; i++) {
                    const r = Math.floor(i / 9);
                    const c = i % 9;
                    const bR = Math.floor(r / 3) * 3;
                    const bC = Math.floor(c / 3) * 3;

                    if (r === row || c === col || (bR === boxRow && bC === boxCol)) {
                        this.gameState.notes[i].delete(num);
                    }
                }
            }

            handleErase() {
                const idx = this.gameState.selectedIndex;
                if (idx === null || this.gameState.isGameOver || this.gameState.originalBoard[idx] !== 0) return;

                this.gameState.history.push({
                    index: idx,
                    val: this.gameState.currentBoard[idx],
                    notes: new Set(this.gameState.notes[idx])
                });

                this.gameState.currentBoard[idx] = 0;
                this.gameState.notes[idx].clear();
                this.renderBoard();
            }

            handleUndo() {
                if (this.gameState.history.length === 0 || this.gameState.isGameOver) return;
                const lastState = this.gameState.history.pop();
                
                this.gameState.currentBoard[lastState.index] = lastState.val;
                this.gameState.notes[lastState.index] = lastState.notes;
                
                this.selectCell(lastState.index);
                this.renderBoard();
            }

            handleHint() {
                if (this.gameState.isGameOver) return;
                
                // Find empty cell
                let emptyIndices = [];
                for (let i = 0; i < 81; i++) {
                    if (this.gameState.currentBoard[i] === 0 && this.gameState.originalBoard[i] === 0) {
                        emptyIndices.push(i);
                    }
                }
                
                if (emptyIndices.length === 0) return;
                
                // Prioritize selected cell if empty
                let idx = this.gameState.selectedIndex;
                if (idx === null || this.gameState.currentBoard[idx] !== 0) {
                    idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                }
                
                // Disable notes mode temporarily to input the hint
                const wasNotesMode = this.gameState.notesMode;
                this.gameState.notesMode = false;
                
                this.selectCell(idx);
                this.handleInput(this.gameState.solution[idx]);

                // Restore notes mode
                this.gameState.notesMode = wasNotesMode;
            }

            startTimer() {
                if (this.gameState.timerId) clearInterval(this.gameState.timerId);
                this.gameState.timerId = setInterval(() => {
                    this.gameState.seconds++;
                    const m = Math.floor(this.gameState.seconds / 60).toString().padStart(2, '0');
                    const s = (this.gameState.seconds % 60).toString().padStart(2, '0');
                    this.timerEl.innerText = `${m}:${s}`;
                }, 1000);
            }

            updateStats() {
                this.mistakesEl.innerText = `${this.gameState.mistakes}/${this.gameState.maxMistakes}`;
            }

            checkWin() {
                let isWon = true;
                for (let i = 0; i < 81; i++) {
                    const val = this.gameState.currentBoard[i] || this.gameState.originalBoard[i];
                    if (val !== this.gameState.solution[i]) {
                        isWon = false;
                        break;
                    }
                }
                if (isWon) this.gameOver(true);
            }

            gameOver(won) {
                this.gameState.isGameOver = true;
                clearInterval(this.gameState.timerId);
                
                const modal = document.getElementById('game-over-modal');
                const title = document.getElementById('modal-title');
                const msg = document.getElementById('modal-msg');
                
                modal.style.display = 'flex';
                if (won) {
                    title.innerText = 'Excellent!';
                    msg.innerText = `You completed the Sudoku in ${this.timerEl.innerText}.`;
                    title.style.color = 'var(--primary)';
                } else {
                    title.innerText = 'Game Over';
                    msg.innerText = 'You made 3 mistakes. Try again!';
                    title.style.color = 'var(--error)';
                }
            }
        }

        // Boot Game Logic
        const uiController = new UIController();
