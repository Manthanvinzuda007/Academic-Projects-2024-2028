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
        return { board: this.board, solution: this.solution };
    }

    _isValid(board, index, num) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 9; i++) {
            if (board[row * 9 + i] === num) return false;
            if (board[i * 9 + col] === num) return false;
            const r = boxRow + Math.floor(i / 3);
            const c = boxCol + (i % 3);
            if (board[r * 9 + c] === num) return false;
        }
        return true;
    }

    _fillBoard(index) {
        if (index === 81) return true;
        let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
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
        while (count > 0) {
            let idx = Math.floor(Math.random() * 81);
            if (this.board[idx] !== 0) {
                this.board[idx] = 0;
                count--;
            }
        }
    }
}

/**
 * GAME CONTROLLER
 */
class SudokuUI {
    constructor() {
        this.engine = new SudokuEngine();
        this.boardEl = document.getElementById('sudoku-board');
        this.timerEl = document.getElementById('timer');
        this.mistakesEl = document.getElementById('mistakes');
        
        this.gameState = {
            currentBoard: [],
            solution: [],
            fixedIndices: new Set(),
            notes: Array.from({length: 81}, () => new Set()),
            selectedIndex: -1,
            mistakes: 0,
            maxMistakes: 3,
            difficulty: 'easy',
            seconds: 0,
            timerId: null,
            notesActive: false,
            history: []
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Difficulty clicks
        document.getElementById('diffs').addEventListener('click', (e) => {
            if (e.target.dataset.level) {
                document.querySelectorAll('#diffs span').forEach(s => s.classList.remove('active'));
                e.target.classList.add('active');
                this.gameState.difficulty = e.target.dataset.level;
                this.startNewGame();
            }
        });

        // Board clicks
        this.boardEl.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) this.selectCell(parseInt(cell.dataset.index));
        });

        // Numpad clicks
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleInput(parseInt(btn.innerText)));
        });

        // Action buttons
        document.getElementById('erase-btn').addEventListener('click', () => this.handleInput(0));
        document.getElementById('notes-btn').addEventListener('click', () => this.toggleNotes());
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('hint-btn').addEventListener('click', () => this.giveHint());

        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') this.handleInput(parseInt(e.key));
            if (e.key === 'Backspace' || e.key === 'Delete') this.handleInput(0);
            if (e.key === 'n') this.toggleNotes();
            
            // Arrow navigation
            let idx = this.gameState.selectedIndex;
            if (idx === -1) return;
            if (e.key === 'ArrowUp') this.selectCell(idx - 9);
            if (e.key === 'ArrowDown') this.selectCell(idx + 9);
            if (e.key === 'ArrowLeft') this.selectCell(idx - 1);
            if (e.key === 'ArrowRight') this.selectCell(idx + 1);
        });
    }

    startNewGame() {
        const { board, solution } = this.engine.generate(this.gameState.difficulty);
        this.gameState.currentBoard = [...board];
        this.gameState.solution = solution;
        this.gameState.fixedIndices = new Set();
        this.gameState.notes = Array.from({length: 81}, () => new Set());
        this.gameState.mistakes = 0;
        this.gameState.seconds = 0;
        this.gameState.history = [];
        this.gameState.selectedIndex = -1;
        
        board.forEach((val, i) => { if (val !== 0) this.gameState.fixedIndices.add(i); });

        this.renderBoard();
        this.updateStats();
        this.startTimer();
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            // Borders for 3x3 grids
            if ((i + 1) % 3 === 0 && (i + 1) % 9 !== 0) cell.classList.add('bold-right');
            if (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5) cell.classList.add('bold-bottom');

            const val = this.gameState.currentBoard[i];
            if (val !== 0) {
                cell.innerText = val;
                if (this.gameState.fixedIndices.has(i)) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.add('user-value');
                    // Check if wrong
                    if (val !== this.gameState.solution[i]) cell.classList.add('error');
                }
            } else {
                // Render notes
                const notes = this.gameState.notes[i];
                if (notes.size > 0) {
                    const grid = document.createElement('div');
                    grid.className = 'notes-grid';
                    for (let n = 1; n <= 9; n++) {
                        const noteDiv = document.createElement('div');
                        noteDiv.className = 'note';
                        noteDiv.innerText = notes.has(n) ? n : '';
                        grid.appendChild(noteDiv);
                    }
                    cell.appendChild(grid);
                }
            }
            this.boardEl.appendChild(cell);
        }
        this.updateHighlights();
    }

    selectCell(index) {
        if (index < 0 || index >= 81) return;
        this.gameState.selectedIndex = index;
        this.updateHighlights();
    }

    updateHighlights() {
        const cells = document.querySelectorAll('.cell');
        const selectedIdx = this.gameState.selectedIndex;
        const selectedVal = this.gameState.currentBoard[selectedIdx];
        
        const row = Math.floor(selectedIdx / 9);
        const col = selectedIdx % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        cells.forEach((cell, i) => {
            cell.classList.remove('selected', 'related', 'highlight-same');
            
            if (i === selectedIdx) {
                cell.classList.add('selected');
            } else if (selectedIdx !== -1) {
                const r = Math.floor(i / 9);
                const c = i % 9;
                const br = Math.floor(r / 3) * 3;
                const bc = Math.floor(c / 3) * 3;

                // Same row, column or box
                if (r === row || c === col || (br === boxRow && bc === boxCol)) {
                    cell.classList.add('related');
                }

                // Same number highlight
                if (selectedVal !== 0 && this.gameState.currentBoard[i] === selectedVal) {
                    cell.classList.add('highlight-same');
                }
            }
        });
    }

    handleInput(num) {
        const idx = this.gameState.selectedIndex;
        if (idx === -1 || this.gameState.fixedIndices.has(idx)) return;

        // Save history for undo
        this.gameState.history.push({
            index: idx,
            prevVal: this.gameState.currentBoard[idx],
            prevNotes: new Set(this.gameState.notes[idx])
        });

        if (this.gameState.notesActive && num !== 0) {
            // Pencil marks mode
            if (this.gameState.notes[idx].has(num)) {
                this.gameState.notes[idx].delete(num);
            } else {
                this.gameState.notes[idx].add(num);
                this.gameState.currentBoard[idx] = 0; // Clear value if adding note
            }
        } else {
            // Normal entry
            if (num !== 0 && num !== this.gameState.solution[idx]) {
                this.gameState.mistakes++;
                this.updateStats();
                if (this.gameState.mistakes >= this.gameState.maxMistakes) {
                    this.gameOver(false);
                }
            }
            this.gameState.currentBoard[idx] = num;
            this.gameState.notes[idx].clear();

            // Clear related notes if input is correct
            if (num !== 0 && num === this.gameState.solution[idx]) {
                this._clearRelatedNotes(idx, num);
            }
        }

        this.renderBoard();
        this.checkWin();
    }

    _clearRelatedNotes(idx, num) {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;

        for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9);
            const c = i % 9;
            const bbr = Math.floor(r / 3) * 3;
            const bbc = Math.floor(c / 3) * 3;
            if (r === row || c === col || (bbr === br && bbc === bc)) {
                this.gameState.notes[i].delete(num);
            }
        }
    }

    toggleNotes() {
        this.gameState.notesActive = !this.gameState.notesActive;
        const btn = document.getElementById('notes-btn');
        const badge = document.getElementById('notes-status');
        if (this.gameState.notesActive) {
            btn.classList.add('active');
            badge.innerText = 'ON';
        } else {
            btn.classList.remove('active');
            badge.innerText = 'OFF';
        }
    }

    undo() {
        if (this.gameState.history.length === 0) return;
        const last = this.gameState.history.pop();
        this.gameState.currentBoard[last.index] = last.prevVal;
        this.gameState.notes[last.index] = last.prevNotes;
        this.renderBoard();
    }

    giveHint() {
        const idx = this.gameState.selectedIndex;
        if (idx === -1 || this.gameState.currentBoard[idx] !== 0) {
            // Find first empty cell if none selected
            const emptyIdx = this.gameState.currentBoard.findIndex((v, i) => v === 0);
            if (emptyIdx !== -1) this.selectCell(emptyIdx);
            return;
        }
        
        this.handleInput(this.gameState.solution[idx]);
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
        if (this.gameState.currentBoard.every((val, i) => val === this.gameState.solution[i])) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        clearInterval(this.gameState.timerId);
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const msg = document.getElementById('modal-msg');
        
        modal.style.display = 'flex';
        if (won) {
            title.innerText = 'Excellent!';
            msg.innerText = `You completed the Sudoku in ${this.timerEl.innerText}.`;
        } else {
            title.innerText = 'Game Over';
            msg.innerText = 'You reached the limit of mistakes.';
        }
    }
}

// Initialize on load
window.onload = () => {
    new SudokuUI();
};
