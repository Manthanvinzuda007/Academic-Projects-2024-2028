// Created By Manthan Viznuda //
const GRID_SIZE = 12;
        const WORD_POOL = [
            { word: "REACT", clue: "The foundation of this app's logic" },
            { word: "JAVASCRIPT", clue: "The engine that drives web interactivity" },
            { word: "COMPONENT", clue: "A LEGO-like block of digital design" },
            { word: "TAILWIND", clue: "Utility-first magic for modern styling" },
            { word: "ALGORITHM", clue: "A logical roadmap for solving problems" },
            { word: "DATABASE", clue: "A digital warehouse for structured data" },
            { word: "BROWSER", clue: "Your window into the World Wide Web" },
            { word: "FRONTEND", clue: "What you see when you browse a site" },
            { word: "BACKEND", clue: "The invisible gears behind the screen" },
            { word: "VARIABLE", clue: "A container for ever-changing values" },
            { word: "FUNCTION", clue: "Reusable instructions for code" },
            { word: "INTERNET", clue: "The global web connecting us all" },
            { word: "PROGRAM", clue: "The code that brings silicon to life" },
            { word: "KEYBOARD", clue: "Your primary tool for digital input" },
            { word: "MONITOR", clue: "The glowing canvas of your computer" },
            { word: "DEVELOPER", clue: "An architect of the digital age" },
            { word: "RECURSION", clue: "When code looks into a mirror" },
            { word: "BOOLEAN", clue: "A simple choice between True and False" },
            { word: "STRING", clue: "A linked chain of text characters" },
            { word: "INTEGER", clue: "A number without any broken parts" },
        ];

        let state = {
            grid: [],
            placedWords: [],
            inputs: {}, 
            focus: { r: 0, c: 0, dir: 'across' },
            timer: 0,
            isComplete: false,
            darkMode: false
        };

        let timerInterval = null;

        function generateCrossword() {
            const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
            const placedWords = [];
            const pool = [...WORD_POOL].sort(() => Math.random() - 0.5);

            const canPlace = (word, row, col, direction) => {
                if (direction === 'across') {
                    if (col + word.length > GRID_SIZE) return false;
                    for (let i = 0; i < word.length; i++) {
                        const char = grid[row][col + i];
                        if (char !== null && char !== word[i]) return false;
                        if (char === null) {
                            if (row > 0 && grid[row - 1][col + i] !== null) return false;
                            if (row < GRID_SIZE - 1 && grid[row + 1][col + i] !== null) return false;
                            if (i === 0 && col > 0 && grid[row][col - 1] !== null) return false;
                            if (i === word.length - 1 && col + i < GRID_SIZE - 1 && grid[row][col + i + 1] !== null) return false;
                        }
                    }
                } else {
                    if (row + word.length > GRID_SIZE) return false;
                    for (let i = 0; i < word.length; i++) {
                        const char = grid[row + i][col];
                        if (char !== null && char !== word[i]) return false;
                        if (char === null) {
                            if (col > 0 && grid[row + i][col - 1] !== null) return false;
                            if (col < GRID_SIZE - 1 && grid[row + i][col + 1] !== null) return false;
                            if (i === 0 && row > 0 && grid[row - 1][col] !== null) return false;
                            if (i === word.length - 1 && row + i < GRID_SIZE - 1 && grid[row + i + 1][col] !== null) return false;
                        }
                    }
                }
                return true;
            };

            const place = (wordObj, row, col, direction) => {
                for (let i = 0; i < wordObj.word.length; i++) {
                    if (direction === 'across') grid[row][col + i] = wordObj.word[i];
                    else grid[row + i][col] = wordObj.word[i];
                }
                placedWords.push({ ...wordObj, row, col, direction });
            };

            const first = pool.pop();
            place(first, Math.floor(GRID_SIZE / 2), Math.floor((GRID_SIZE - first.word.length) / 2), 'across');

            let attempts = 0;
            while (pool.length > 0 && attempts < 150) {
                const wordObj = pool.pop();
                let placed = false;
                for (const existing of placedWords) {
                    for (let i = 0; i < existing.word.length; i++) {
                        for (let j = 0; j < wordObj.word.length; j++) {
                            if (existing.word[i] === wordObj.word[j]) {
                                const dir = existing.direction === 'across' ? 'down' : 'across';
                                const r = dir === 'down' ? existing.row - j + i : existing.row + i;
                                const c = dir === 'across' ? existing.col - j + i : existing.col + i;
                                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && canPlace(wordObj.word, r, c, dir)) {
                                    place(wordObj, r, c, dir);
                                    placed = true;
                                    break;
                                }
                            }
                        }
                        if (placed) break;
                    }
                    if (placed) break;
                }
                if (!placed) { pool.unshift(wordObj); attempts++; }
            }

            const sorted = [...placedWords].sort((a, b) => (a.row !== b.row) ? a.row - b.row : a.col - b.col);
            const numbering = {};
            let n = 1;
            sorted.forEach(w => {
                const key = `${w.row},${w.col}`;
                if (!numbering[key]) numbering[key] = n++;
                w.number = numbering[key];
            });

            return { grid, placedWords: sorted };
        }

        function renderGrid() {
            const container = document.getElementById('grid-container');
            container.innerHTML = '';
            
            const gridEl = document.createElement('div');
            gridEl.className = 'grid gap-[2px] sm:gap-[4px] p-2 rounded-2xl bg-slate-200 dark:bg-slate-800 shadow-inner';
            gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, minmax(30px, 45px))`;

            state.grid.forEach((row, r) => {
                row.forEach((cell, c) => {
                    const cellEl = document.createElement('div');
                    const isBlocked = cell === null;
                    const isFocused = state.focus.r === r && state.focus.c === c;
                    const isActiveWord = isPartOfActiveWord(r, c);

                    if (isBlocked) {
                        cellEl.className = 'aspect-square bg-slate-900/10 dark:bg-slate-950/40 rounded-sm sm:rounded-md transition-all duration-700';
                    } else {
                        const startWord = state.placedWords.find(w => w.row === r && w.col === c);
                        const userVal = state.inputs[`${r},${c}`] || '';
                        const isCorrect = userVal === cell;

                        cellEl.className = `relative aspect-square rounded-sm sm:rounded-lg border-[1.5px] sm:border-2 transition-all cursor-text grid-cell group
                            ${isFocused ? 'bg-indigo-600 border-indigo-600 shadow-lg z-10 scale-[1.05]' : 
                              isActiveWord ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' : 
                              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'}`;
                        
                        if (startWord) {
                            const span = document.createElement('span');
                            span.className = `absolute top-0.5 left-1 text-[7px] sm:text-[9px] font-black leading-none pointer-events-none select-none 
                                ${isFocused ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`;
                            span.innerText = startWord.number;
                            cellEl.appendChild(span);
                        }

                        const input = document.createElement('input');
                        input.type = 'text';
                        input.maxLength = 1;
                        input.className = `w-full h-full bg-transparent text-center text-lg sm:text-2xl font-black uppercase outline-none caret-transparent cursor-pointer 
                            ${isFocused ? 'text-white' : isCorrect ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`;
                        input.value = userVal;
                        
                        input.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            if (state.focus.r === r && state.focus.c === c) {
                                state.focus.dir = state.focus.dir === 'across' ? 'down' : 'across';
                            } else {
                                state.focus = { r, c, dir: state.focus.dir };
                            }
                            updateUI();
                        });

                        input.addEventListener('input', (e) => {
                            const val = e.target.value.slice(-1).toUpperCase();
                            if (val && !/^[A-Z]$/.test(val)) { e.target.value = ''; return; }
                            
                            if (val) {
                                input.parentElement.classList.add('letter-pop');
                                setTimeout(() => input.parentElement.classList.remove('letter-pop'), 200);
                            }

                            state.inputs[`${r},${c}`] = val;
                            if (val) moveFocus(1);
                            checkCompletion();
                            updateUI();
                        });

                        input.addEventListener('keydown', (e) => handleKeyDown(e, r, c));

                        cellEl.appendChild(input);
                        if (isFocused) setTimeout(() => input.focus(), 0);
                    }
                    gridEl.appendChild(cellEl);
                });
            });
            container.appendChild(gridEl);
        }

        function renderClues() {
            const containers = {
                across: document.getElementById('across-clues'),
                down: document.getElementById('down-clues'),
                mobileAcross: document.getElementById('mobile-across'),
                mobileDown: document.getElementById('mobile-down')
            };

            Object.values(containers).forEach(c => c.innerHTML = '');

            const activeWord = getActiveWord();

            state.placedWords.forEach(w => {
                const clueEl = document.createElement('div');
                const isActive = activeWord && activeWord.number === w.number && activeWord.direction === w.direction;
                
                clueEl.className = `clue-item p-4 rounded-2xl border text-sm transition-all cursor-pointer group ${
                    isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-md'
                }`;
                clueEl.innerHTML = `
                    <div class="flex items-start gap-3">
                        <span class="mono font-black text-indigo-500 group-hover:text-indigo-400 ${isActive ? 'text-indigo-200' : ''}">${w.number}</span>
                        <span class="font-semibold leading-snug">${w.clue}</span>
                    </div>`;
                
                clueEl.onclick = () => {
                    state.focus = { r: w.row, c: w.col, dir: w.direction };
                    updateUI();
                };

                if (w.direction === 'across') {
                    containers.across.appendChild(clueEl);
                    containers.mobileAcross.appendChild(clueEl.cloneNode(true)).onclick = clueEl.onclick;
                } else {
                    containers.down.appendChild(clueEl);
                    containers.mobileDown.appendChild(clueEl.cloneNode(true)).onclick = clueEl.onclick;
                }
            });
        }

        function getActiveWord() {
            return state.placedWords.find(w => {
                if (state.focus.dir === 'across') {
                    return w.direction === 'across' && w.row === state.focus.r && state.focus.c >= w.col && state.focus.c < w.col + w.word.length;
                } else {
                    return w.direction === 'down' && w.col === state.focus.c && state.focus.r >= w.row && state.focus.r < w.row + w.word.length;
                }
            });
        }

        function isPartOfActiveWord(r, c) {
            const w = getActiveWord();
            if (!w) return false;
            if (w.direction === 'across') return w.row === r && c >= w.col && c < w.col + w.word.length;
            return w.col === c && r >= w.row && r < w.row + w.word.length;
        }

        function moveFocus(delta) {
            let { r, c, dir } = state.focus;
            let currentWord = getActiveWord();
            
            if (dir === 'across') c += delta; else r += delta;
            
            if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && state.grid[r][c] !== null) {
                state.focus = { r, c, dir };
            }
        }

        function handleKeyDown(e, r, c) {
            if (e.key === 'Backspace') {
                if (!state.inputs[`${r},${c}`]) {
                    moveFocus(-1);
                    updateUI();
                } else {
                    delete state.inputs[`${r},${c}`];
                    updateUI();
                }
            } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                const newDir = (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ? 'across' : 'down';
                const delta = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
                state.focus.dir = newDir;
                moveFocus(delta);
                updateUI();
            } else if (e.key === ' ') {
                e.preventDefault();
                state.focus.dir = state.focus.dir === 'across' ? 'down' : 'across';
                updateUI();
            }
        }

        function checkCompletion() {
            let allCorrect = true;
            let filledCount = 0;
            state.placedWords.forEach(w => {
                for (let i = 0; i < w.word.length; i++) {
                    const r = w.direction === 'across' ? w.row : w.row + i;
                    const c = w.direction === 'across' ? w.col + i : w.col;
                    if (state.inputs[`${r},${c}`]) filledCount++;
                    if (state.inputs[`${r},${c}`] !== w.word[i]) allCorrect = false;
                }
            });

            if (allCorrect && !state.isComplete) {
                state.isComplete = true;
                clearInterval(timerInterval);
                document.getElementById('final-time').innerText = formatTime(state.timer);
                document.getElementById('completion-modal').classList.remove('hidden');
                triggerConfetti();
            }
        }

        function triggerConfetti() {
            const container = document.getElementById('confetti-container');
            for(let i = 0; i < 100; i++) {
                const conf = document.createElement('div');
                conf.className = 'fixed w-3 h-3 rounded-full opacity-80';
                conf.style.backgroundColor = ['#6366f1', '#a855f7', '#ec4899', '#22c55e'][Math.floor(Math.random()*4)];
                conf.style.left = Math.random() * 100 + 'vw';
                conf.style.top = '-10px';
                conf.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                container.appendChild(conf);
                
                const anim = conf.animate([
                    { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate(${(Math.random() - 0.5) * 200}px, 100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
                ], {
                    duration: 2000 + Math.random() * 3000,
                    easing: 'cubic-bezier(0, .9, .57, 1)'
                });
                
                anim.onfinish = () => conf.remove();
            }
        }

        function formatTime(s) {
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return `${m}:${sec.toString().padStart(2, '0')}`;
        }

        function updateUI() {
            renderGrid();
            renderClues();
            const active = getActiveWord();
            const bannerDir = document.getElementById('banner-direction');
            const bannerClue = document.getElementById('banner-clue');
            
            if (active) {
                bannerDir.innerText = `${active.direction} — ${active.number}`;
                bannerClue.innerText = active.clue;
                bannerClue.classList.remove('italic', 'text-slate-400');
            } else {
                bannerDir.innerText = 'SELECT START';
                bannerClue.innerText = 'Click a square to begin your challenge.';
                bannerClue.classList.add('italic', 'text-slate-400');
            }
        }

        function startNewGame() {
            const data = generateCrossword();
            state.grid = data.grid;
            state.placedWords = data.placedWords;
            state.inputs = {};
            state.timer = 0;
            state.isComplete = false;
            state.focus = { r: data.placedWords[0].row, c: data.placedWords[0].col, dir: data.placedWords[0].direction };
            
            document.getElementById('completion-modal').classList.add('hidden');
            document.getElementById('timer-display').innerText = '0:00';
            
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                state.timer++;
                document.getElementById('timer-display').innerText = formatTime(state.timer);
            }, 1000);
            
            updateUI();
        }

        document.getElementById('theme-toggle').onclick = () => {
            state.darkMode = !state.darkMode;
            document.documentElement.classList.toggle('dark', state.darkMode);
            document.body.classList.toggle('dark', state.darkMode);
            document.getElementById('theme-icon-sun').classList.toggle('hidden', !state.darkMode);
            document.getElementById('theme-icon-moon').classList.toggle('hidden', state.darkMode);
        };

        document.getElementById('reveal-letter-btn').onclick = () => {
            const { r, c } = state.focus;
            const correct = state.grid[r][c];
            if (correct) {
                state.inputs[`${r},${c}`] = correct;
                checkCompletion();
                updateUI();
            }
        };

        document.getElementById('reveal-word-btn').onclick = () => {
            const active = getActiveWord();
            if (active) {
                for (let i = 0; i < active.word.length; i++) {
                    const r = active.direction === 'across' ? active.row : active.row + i;
                    const c = active.direction === 'across' ? active.col + i : active.col;
                    state.inputs[`${r},${c}`] = active.word[i];
                }
                checkCompletion();
                updateUI();
            }
        };

        document.getElementById('new-game-btn').onclick = startNewGame;
        document.getElementById('modal-replay-btn').onclick = startNewGame;

        window.onload = startNewGame;
