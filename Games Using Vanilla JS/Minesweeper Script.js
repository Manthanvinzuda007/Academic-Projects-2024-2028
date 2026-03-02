    /* ================= State & Config ================= */
    let config = { rows: 9, cols: 9, mines: 10, difficulty: 'easy' };
    let board = [];
    let state = {
        status: 'menu', // menu, playing, won, lost
        minesLeft: 0,
        revealedCount: 0,
        time: 0,
        timerId: null,
        firstClick: true,
        muted: false
    };

    // In-Memory Best Times (per session)
    const bestTimes = { easy: null, medium: null, hard: null };

    // DOM Elements
    const screens = { menu: document.getElementById('menu-screen'), game: document.getElementById('game-screen') };
    const boardEl = document.getElementById('board');
    const faceBtn = document.getElementById('face-btn');
    const minesCountEl = document.getElementById('mines-count');
    const timerEl = document.getElementById('timer');
    const flashEl = document.getElementById('flash');
    const gameWrapper = document.getElementById('game-wrapper');
    const customInputs = document.getElementById('custom-inputs');
    const bestTimeDisplay = document.getElementById('best-time-display');
    const canvas = document.getElementById('effects-canvas');
    const ctx = canvas.getContext('2d');

    /* ================= Theming & Menu ================= */
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active-theme'));
        document.querySelector(`.theme-dot.${theme}`).classList.add('active-theme');
    }

    function setDifficulty(diff) {
        document.querySelectorAll('.btn-group .btn').forEach(b => b.classList.remove('active-btn'));
        document.querySelector(`[data-diff="${diff}"]`).classList.add('active-btn');
        config.difficulty = diff;
        customInputs.classList.toggle('show', diff === 'custom');

        if (diff === 'easy') { config.rows = 9; config.cols = 9; config.mines = 10; }
        else if (diff === 'medium') { config.rows = 16; config.cols = 16; config.mines = 40; }
        else if (diff === 'hard') { config.rows = 24; config.cols = 24; config.mines = 99; }
    }

    function showMenu() {
        stopTimer();
        screens.game.classList.remove('active');
        screens.menu.classList.add('active');
        state.status = 'menu';
    }

    /* ================= Audio System (Web Audio API) ================= */
    let audioCtx = null;
    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playTone(freq, type, duration, vol=0.1) {
        if (state.muted || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e) { console.warn("Audio error", e); }
    }

    function playSound(action) {
        initAudio();
        if (state.muted) return;
        switch(action) {
            case 'click': playTone(800, 'sine', 0.05, 0.05); break;
            case 'flag': playTone(1200, 'square', 0.1, 0.05); setTimeout(()=>playTone(1500, 'square', 0.1, 0.05), 100); break;
            case 'win': 
                [400, 500, 600, 800].forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.2, 0.1), i * 100));
                break;
            case 'explosion': playExplosion(); break;
        }
    }

    function playExplosion() {
        if (state.muted || !audioCtx) return;
        try {
            const bufferSize = audioCtx.sampleRate * 0.5;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            noise.start();
        } catch(e){}
    }

    function toggleMute() {
        state.muted = !state.muted;
        document.getElementById('mute-btn').innerText = state.muted ? '🔇' : '🔊';
    }

    /* ================= Core Game Logic ================= */
    function startGame() {
        initAudio();
        if (config.difficulty === 'custom') {
            config.rows = Math.max(5, Math.min(50, parseInt(document.getElementById('c-rows').value) || 10));
            config.cols = Math.max(5, Math.min(50, parseInt(document.getElementById('c-cols').value) || 10));
            const maxMines = (config.rows * config.cols) - 9; // Leave room for safe first click
            config.mines = Math.max(1, Math.min(maxMines, parseInt(document.getElementById('c-mines').value) || 15));
        }

        // Adjust CSS vars for scaling based on cols
        const maxW = window.innerWidth * 0.9;
        let cSize = 32;
        if (config.cols * 32 > maxW) {
            cSize = Math.max(18, Math.floor(maxW / config.cols));
        }
        document.documentElement.style.setProperty('--cell-size', `${cSize}px`);

        resetGame();
        screens.menu.classList.remove('active');
        screens.game.classList.add('active');

        // Show best time if available
        const bt = bestTimes[config.difficulty];
        bestTimeDisplay.innerText = bt ? bt : '--';
    }

    function resetGame() {
        stopTimer();
        state = { ...state, status: 'playing', minesLeft: config.mines, revealedCount: 0, time: 0, firstClick: true };
        faceBtn.innerText = '🙂';
        updateLCD();
        timerEl.innerText = '000';
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        board = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear particles

        for (let r = 0; r < config.rows; r++) {
            let row = [];
            for (let c = 0; c < config.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                boardEl.appendChild(cell);
                
                row.push({
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                    el: cell
                });
            }
            board.push(row);
        }
    }

    function placeMines(firstR, firstC) {
        let placed = 0;
        while (placed < config.mines) {
            let r = Math.floor(Math.random() * config.rows);
            let c = Math.floor(Math.random() * config.cols);
            
            // First click is safe, and ideally its direct neighbors too
            const isSafeZone = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;

            if (!board[r][c].isMine && !isSafeZone) {
                board[r][c].isMine = true;
                placed++;
            }
        }
        calculateNeighbors();
    }

    function calculateNeighbors() {
        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
                if (board[r][c].isMine) continue;
                let count = 0;
                dirs.forEach(([dr, dc]) => {
                    let nr = r + dr, nc = c + dc;
                    if (nr>=0 && nr<config.rows && nc>=0 && nc<config.cols && board[nr][nc].isMine) {
                        count++;
                    }
                });
                board[r][c].neighborMines = count;
            }
        }
    }

    /* ================= Interaction Logic ================= */
    
    // Prevent context menu
    boardEl.addEventListener('contextmenu', e => { e.preventDefault(); });

    // Handle mouse down/up for face emoji reaction
    boardEl.addEventListener('mousedown', e => {
        if(e.button === 0 && state.status === 'playing' && !e.target.classList.contains('revealed')) {
            faceBtn.innerText = '😮';
        }
    });
    window.addEventListener('mouseup', () => {
        if(state.status === 'playing') faceBtn.innerText = '🙂';
    });

    // Main interaction
    boardEl.addEventListener('mouseup', e => {
        if (state.status !== 'playing') return;
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        let r = parseInt(cell.dataset.r);
        let c = parseInt(cell.dataset.c);

        if (e.button === 2) { // Right click
            toggleFlag(r, c);
        } else if (e.button === 0) { // Left click
            revealCell(r, c);
        }
    });

    // Touch logic for long press
    let touchTimer = null;
    let touchMoved = false;

    boardEl.addEventListener('touchstart', e => {
        if (e.touches.length > 1 || state.status !== 'playing') return;
        const cell = e.target.closest('.cell');
        if (!cell) return;
        touchMoved = false;
        faceBtn.innerText = '😮';
        let r = parseInt(cell.dataset.r);
        let c = parseInt(cell.dataset.c);
        
        touchTimer = setTimeout(() => {
            if(!touchMoved) {
                navigator.vibrate && navigator.vibrate(50);
                toggleFlag(r, c);
                touchTimer = null;
            }
        }, 400); // 400ms long press
    }, {passive: true});

    boardEl.addEventListener('touchmove', () => { touchMoved = true; });
    
    boardEl.addEventListener('touchend', e => {
        if (state.status === 'playing') faceBtn.innerText = '🙂';
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
            if (!touchMoved) {
                const cell = e.target.closest('.cell');
                if(cell) revealCell(parseInt(cell.dataset.r), parseInt(cell.dataset.c));
            }
        }
        e.preventDefault(); // prevent mouse events firing
    });


    function toggleFlag(r, c) {
        let cellData = board[r][c];
        if (cellData.isRevealed) return;

        playSound('flag');
        if (cellData.isFlagged) {
            cellData.isFlagged = false;
            cellData.el.innerHTML = '';
            cellData.el.classList.remove('flagged');
            state.minesLeft++;
        } else {
            if(state.minesLeft <= 0) return; // Optional strict flagging
            cellData.isFlagged = true;
            cellData.el.innerHTML = '🚩';
            cellData.el.classList.add('flagged');
            cellData.el.classList.add('anim-pop');
            setTimeout(()=> cellData.el.classList.remove('anim-pop'), 300);
            state.minesLeft--;
        }
        updateLCD();
    }

    function revealCell(r, c) {
        let cellData = board[r][c];
        if (cellData.isRevealed || cellData.isFlagged) return;

        if (state.firstClick) {
            state.firstClick = false;
            startTimer();
            placeMines(r, c);
        }

        if (cellData.isMine) {
            gameOver(r, c);
            return;
        }

        playSound('click');
        
        // Flood fill (Iterative BFS to avoid stack overflow on huge grids)
        let queue = [[r, c]];
        let visited = new Set();
        visited.add(`${r},${c}`);

        while (queue.length > 0) {
            let [currR, currC] = queue.shift();
            let currCell = board[currR][currC];
            
            if (currCell.isFlagged) continue;
            
            currCell.isRevealed = true;
            currCell.el.classList.add('revealed');
            state.revealedCount++;

            if (currCell.neighborMines > 0) {
                currCell.el.innerText = currCell.neighborMines;
                currCell.el.classList.add(`num-${currCell.neighborMines}`);
            } else {
                // If 0, add neighbors
                const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
                dirs.forEach(([dr, dc]) => {
                    let nr = currR + dr, nc = currC + dc;
                    if (nr>=0 && nr<config.rows && nc>=0 && nc<config.cols) {
                        let key = `${nr},${nc}`;
                        if (!visited.has(key) && !board[nr][nc].isRevealed && !board[nr][nc].isMine) {
                            visited.add(key);
                            queue.push([nr, nc]);
                        }
                    }
                });
            }
        }

        checkWin();
    }

    /* ================= Game Flow & UI ================= */
    function updateLCD() {
        let count = Math.max(0, state.minesLeft);
        minesCountEl.innerText = count.toString().padStart(3, '0');
    }

    function startTimer() {
        state.timerId = setInterval(() => {
            state.time++;
            if(state.time > 999) state.time = 999;
            timerEl.innerText = state.time.toString().padStart(3, '0');
        }, 1000);
    }

    function stopTimer() {
        if (state.timerId) {
            clearInterval(state.timerId);
            state.timerId = null;
        }
    }

    function gameOver(hitR, hitC) {
        state.status = 'lost';
        stopTimer();
        faceBtn.innerText = '💀';
        playSound('explosion');
        
        gameWrapper.classList.add('shake');
        flashEl.classList.add('active');
        setTimeout(() => flashEl.classList.remove('active'), 150);
        setTimeout(() => gameWrapper.classList.remove('shake'), 500);

        // Reveal all mines progressively
        let mines = [];
        for(let r=0; r<config.rows; r++) {
            for(let c=0; c<config.cols; c++) {
                if(board[r][c].isMine && !(r===hitR && c===hitC) && !board[r][c].isFlagged) {
                    mines.push(board[r][c]);
                }
                // False flag marker
                if(!board[r][c].isMine && board[r][c].isFlagged) {
                    board[r][c].el.innerHTML = '❌';
                }
            }
        }
        
        // Hit mine
        board[hitR][hitC].el.classList.add('revealed', 'mine');
        board[hitR][hitC].el.innerHTML = '💣';
        createParticles(hitR, hitC, 'explosion');

        // Chain explosion
        mines.sort(() => Math.random() - 0.5);
        mines.forEach((m, idx) => {
            setTimeout(() => {
                m.el.classList.add('revealed');
                m.el.innerHTML = '💣';
            }, idx * (800 / Math.max(1, mines.length))); // Scale timing
        });
    }

    function checkWin() {
        const totalSafe = (config.rows * config.cols) - config.mines;
        if (state.revealedCount === totalSafe) {
            state.status = 'won';
            stopTimer();
            faceBtn.innerText = '😎';
            playSound('win');
            
            // Flag remaining mines
            for(let r=0; r<config.rows; r++) {
                for(let c=0; c<config.cols; c++) {
                    if(board[r][c].isMine && !board[r][c].isFlagged) {
                        board[r][c].el.innerHTML = '🚩';
                        board[r][c].el.classList.add('flagged');
                    }
                }
            }
            state.minesLeft = 0;
            updateLCD();
            
            // Save Best Time (In-Memory per session requirements)
            if (config.difficulty !== 'custom') {
                const prevBest = bestTimes[config.difficulty];
                if (!prevBest || state.time < prevBest) {
                    bestTimes[config.difficulty] = state.time;
                    bestTimeDisplay.innerText = state.time;
                    bestTimeDisplay.style.color = 'var(--primary)';
                    bestTimeDisplay.classList.add('anim-pop');
                    setTimeout(()=>bestTimeDisplay.classList.remove('anim-pop'), 500);
                }
            }

            triggerConfetti();
        }
    }

    /* ================= Visual Effects (Canvas) ================= */
    let particles = [];
    let animFrame = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createParticles(r, c, type) {
        const cell = board[r][c].el;
        const rect = cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        for (let i = 0; i < 30; i++) {
            particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: Math.random() * 0.03 + 0.02,
                color: type === 'explosion' ? `hsl(${Math.random()*60}, 100%, 50%)` : `hsl(${Math.random()*360}, 100%, 50%)`,
                size: Math.random() * 4 + 2
            });
        }
        if(!animFrame) updateParticles();
    }

    function triggerConfetti() {
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -10 - Math.random() * 50,
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * 3 + 2,
                life: 1,
                decay: Math.random() * 0.005 + 0.005,
                color: `hsl(${Math.random()*360}, 100%, 50%)`,
                size: Math.random() * 6 + 4,
                wobble: Math.random() * 10
            });
        }
        if(!animFrame) updateParticles();
    }

    function updateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx + Math.sin(p.life * p.wobble || 0) * 2;
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life > 0) {
                active = true;
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                particles.splice(i, 1);
            }
        }
        ctx.globalAlpha = 1;

        if (active) {
            animFrame = requestAnimationFrame(updateParticles);
        } else {
            animFrame = null;
        }
    }
