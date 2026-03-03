    /* ================= State & Config ================= */
    let config = { rows: 9, cols: 9, mines: 10, difficulty: 'easy' };
    let board = [];
    let state = {
        status: 'menu', // menu, playing, paused, won, lost
        minesLeft: 0,
        revealedCount: 0,
        firstClick: true,
        muted: false
    };

    // DOM Elements
    const screens = { menu: document.getElementById('menu-screen'), game: document.getElementById('game-screen') };
    const boardEl = document.getElementById('board');
    const faceBtn = document.getElementById('face-btn');
    const minesCountEl = document.getElementById('mines-count');
    const flashEl = document.getElementById('flash');
    const customInputs = document.getElementById('custom-inputs');
    const canvas = document.getElementById('effects-canvas');
    const ctx = canvas.getContext('2d');

    /* ================= Educational Facts System ================= */
    const educationalFacts = [
        "Octopuses have three hearts and blue blood! 🐙",
        "Honey never spoils. Explorers found 3,000-year-old honey in Egypt and it was still good! 🍯",
        "Bananas are officially berries, but strawberries are not! 🍌",
        "A day on Venus is longer than a year on Venus! 🪐",
        "Water makes up about 71% of the Earth's surface! 🌊",
        "Wombat poop is cube-shaped so it doesn't roll away! 🦡",
        "A single cloud can weigh more than a million pounds! ☁️",
        "Sharks existed on Earth before trees did! 🦈",
        "Butterflies taste their food with their feet! 🦋",
        "Space is completely silent because there is no air for sound to travel through! 🌌",
        "A single strand of spaghetti is called a 'spaghetto'! 🍝",
        "Cows have best friends and get stressed when separated! 🐄",
        "Snails can sleep for up to three years! 🐌"
    ];

    let factTimeout = null;

    function scheduleNextFact() {
        clearTimeout(factTimeout);
        if (state.status === 'playing' || state.firstClick) {
            factTimeout = setTimeout(() => {
                showEducationalFact();
            }, 15000); // Pops up every 15 seconds of gameplay
        }
    }

    function showEducationalFact() {
        if (state.status !== 'playing' && state.status !== 'firstClick') return;
        
        // PAUSE THE GAME
        state.status = 'paused';
        faceBtn.innerText = '🤔'; // Thinking face while reading

        // Show Fact
        const randomFact = educationalFacts[Math.floor(Math.random() * educationalFacts.length)];
        document.getElementById('fun-fact-text').innerText = randomFact;
        document.getElementById('fact-overlay').classList.add('show');
        
        playSound('pop');
    }

    function resumeGameFromFact() {
        // RESUME THE GAME
        document.getElementById('fact-overlay').classList.remove('show');
        state.status = 'playing';
        
        faceBtn.innerText = '😎';
        playSound('click');
        
        // Schedule the next fact
        scheduleNextFact();
    }

    function clearFactsTimer() {
        clearTimeout(factTimeout);
        document.getElementById('fact-overlay').classList.remove('show');
    }


    /* ================= Theming ================= */
    function toggleTheme() {
        const body = document.body;
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
        } else {
            body.setAttribute('data-theme', 'dark');
        }
    }

    /* Set Difficulty */
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
        clearFactsTimer(); // Stop popups
        screens.game.classList.remove('active');
        screens.menu.classList.add('active');
        state.status = 'menu';
        document.body.classList.remove('shake-screen');
    }

    /* ================= Audio System ================= */
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
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + duration);
        } catch(e) {}
    }

    function playSound(action) {
        initAudio();
        if (state.muted) return;
        switch(action) {
            case 'click': playTone(600, 'sine', 0.1, 0.05); break;
            case 'pop': playTone(1200, 'triangle', 0.05, 0.03); break; 
            case 'flag': playTone(800, 'square', 0.1, 0.05); setTimeout(()=>playTone(1200, 'square', 0.1, 0.05), 80); break;
            case 'unflag': playTone(600, 'square', 0.1, 0.05); break;
            case 'chord': playTone(1000, 'triangle', 0.15, 0.05); break;
            case 'win': 
                [440, 554, 659, 880, 1108].forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.2, 0.1), i * 150));
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
            for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.15));
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            noise.start();
        } catch(e){}
    }

    function toggleMute() {
        state.muted = !state.muted;
        document.getElementById('mute-btn').innerText = state.muted ? '🔇' : '🔊';
        document.getElementById('mute-btn').classList.add('anim-pop');
        setTimeout(()=>document.getElementById('mute-btn').classList.remove('anim-pop'), 400);
    }

    /* ================= Core Game Logic ================= */
    function startGame() {
        initAudio();
        if (config.difficulty === 'custom') {
            config.rows = Math.max(5, Math.min(30, parseInt(document.getElementById('c-rows').value) || 10));
            config.cols = Math.max(5, Math.min(30, parseInt(document.getElementById('c-cols').value) || 10));
            const maxMines = (config.rows * config.cols) - 9;
            config.mines = Math.max(1, Math.min(maxMines, parseInt(document.getElementById('c-mines').value) || 15));
        }

        const maxW = window.innerWidth * 0.85;
        let cSize = 40;
        if (config.cols * 40 > maxW) {
            cSize = Math.max(22, Math.floor(maxW / config.cols));
        }
        document.documentElement.style.setProperty('--cell-size', `${cSize}px`);

        resetGame();
        screens.menu.classList.remove('active');
        screens.game.classList.add('active');

        scheduleNextFact(); 
    }

    function resetGame() {
        clearFactsTimer(); 

        state = { ...state, status: 'playing', minesLeft: config.mines, revealedCount: 0, firstClick: true };
        faceBtn.innerText = '😎';
        faceBtn.classList.remove('anim-pop');
        void faceBtn.offsetWidth; 
        faceBtn.classList.add('anim-pop');
        
        updateLCD();
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        board = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = [];
        document.body.classList.remove('shake-screen');

        for (let r = 0; r < config.rows; r++) {
            let row = [];
            for (let c = 0; c < config.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                boardEl.appendChild(cell);
                
                row.push({ isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0, el: cell });
            }
            board.push(row);
        }
        scheduleNextFact(); 
    }

    function placeMines(firstR, firstC) {
        let placed = 0;
        while (placed < config.mines) {
            let r = Math.floor(Math.random() * config.rows);
            let c = Math.floor(Math.random() * config.cols);
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
                    if (nr>=0 && nr<config.rows && nc>=0 && nc<config.cols && board[nr][nc].isMine) count++;
                });
                board[r][c].neighborMines = count;
            }
        }
    }

    /* ================= Interaction Logic ================= */
    boardEl.addEventListener('contextmenu', e => e.preventDefault()); 

    boardEl.addEventListener('mousedown', e => {
        if(e.button === 0 && state.status === 'playing' && !e.target.classList.contains('revealed')) {
            faceBtn.innerText = '😲';
        }
    });
    window.addEventListener('mouseup', () => {
        if(state.status === 'playing') faceBtn.innerText = '😎';
    });

    boardEl.addEventListener('dblclick', e => {
        if (state.status !== 'playing') return;
        const cell = e.target.closest('.cell');
        if (!cell) return;
        let r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
        handleChord(r, c);
    });

    boardEl.addEventListener('mouseup', e => {
        if (state.status !== 'playing') return; 
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        let r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);

        if (e.button === 2) { 
            toggleFlag(r, c); 
        } else if (e.button === 0) { 
            if(board[r][c].isRevealed) {
                if (window.innerWidth <= 768) handleChord(r, c); 
            } else {
                revealCell(r, c); 
            }
        }
    });

    // Touch logic
    let touchTimer = null;
    let touchMoved = false;
    boardEl.addEventListener('touchstart', e => {
        if (e.touches.length > 1 || state.status !== 'playing') return;
        const cell = e.target.closest('.cell');
        if (!cell) return;
        touchMoved = false;
        if(!cell.classList.contains('revealed')) faceBtn.innerText = '😲';
        let r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
        
        touchTimer = setTimeout(() => {
            if(!touchMoved) {
                navigator.vibrate && navigator.vibrate(50);
                toggleFlag(r, c);
                touchTimer = null;
            }
        }, 300); 
    }, {passive: true});

    boardEl.addEventListener('touchmove', () => touchMoved = true);
    
    boardEl.addEventListener('touchend', e => {
        if (state.status === 'playing') faceBtn.innerText = '😎';
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
            if (!touchMoved && state.status === 'playing') { 
                const cell = e.target.closest('.cell');
                if(cell) {
                    let r = parseInt(cell.dataset.r), c = parseInt(cell.dataset.c);
                    if(board[r][c].isRevealed) handleChord(r,c);
                    else revealCell(r, c);
                }
            }
        }
        e.preventDefault(); 
    });


    function toggleFlag(r, c) {
        let cellData = board[r][c];
        if (cellData.isRevealed) return;

        if (cellData.isFlagged) {
            playSound('unflag');
            cellData.isFlagged = false;
            cellData.el.innerHTML = '';
            cellData.el.classList.remove('flagged');
            state.minesLeft++;
        } else {
            if(state.minesLeft <= 0) return; 
            playSound('flag');
            cellData.isFlagged = true;
            cellData.el.innerHTML = '🚩';
            cellData.el.classList.add('flagged', 'anim-pop');
            setTimeout(()=> cellData.el.classList.remove('anim-pop'), 400);
            createCartoonDust(r, c); 
            state.minesLeft--;
        }
        updateLCD();
    }

    function handleChord(r, c) {
        let cellData = board[r][c];
        if (!cellData.isRevealed || cellData.neighborMines === 0) return;

        const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        let flagCount = 0;
        let hiddenNeighbors = [];

        dirs.forEach(([dr, dc]) => {
            let nr = r + dr, nc = c + dc;
            if (nr>=0 && nr<config.rows && nc>=0 && nc<config.cols) {
                if (board[nr][nc].isFlagged) flagCount++;
                else if (!board[nr][nc].isRevealed) hiddenNeighbors.push([nr, nc]);
            }
        });

        if (flagCount === cellData.neighborMines) {
            playSound('chord');
            cellData.el.classList.add('anim-rubber');
            setTimeout(()=> cellData.el.classList.remove('anim-rubber'), 500);

            hiddenNeighbors.forEach(([nr, nc]) => {
                revealCell(nr, nc, true); 
            });
        }
    }

    function revealCell(r, c, isChord = false) {
        let cellData = board[r][c];
        if (cellData.isRevealed || cellData.isFlagged) return;

        if (state.firstClick) {
            state.firstClick = false;
            placeMines(r, c);
        }

        if (cellData.isMine) {
            gameOver(r, c);
            return;
        }

        if(!isChord) {
            playSound('click');
            createCartoonDust(r, c);
        }
        
        let queue = [{r: r, c: c, dist: 0}];
        let visited = new Set([`${r},${c}`]);
        let delayBase = 20; 

        while (queue.length > 0) {
            let {r: currR, c: currC, dist} = queue.shift();
            let currCell = board[currR][currC];
            
            if (currCell.isFlagged || currCell.isRevealed) continue;
            
            currCell.isRevealed = true;
            state.revealedCount++;

            setTimeout(() => {
                currCell.el.classList.add('revealed', 'anim-pop');
                if(!isChord && dist > 0 && dist % 4 === 0) playSound('pop'); 
                
                if (currCell.neighborMines > 0) {
                    currCell.el.innerText = currCell.neighborMines;
                    currCell.el.classList.add('num', `num-${currCell.neighborMines}`);
                }
            }, dist * delayBase);

            if (currCell.neighborMines === 0) {
                const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
                dirs.forEach(([dr, dc]) => {
                    let nr = currR + dr, nc = currC + dc;
                    if (nr>=0 && nr<config.rows && nc>=0 && nc<config.cols) {
                        let key = `${nr},${nc}`;
                        if (!visited.has(key) && !board[nr][nc].isRevealed && !board[nr][nc].isMine) {
                            visited.add(key);
                            queue.push({r: nr, c: nc, dist: dist + 1});
                        }
                    }
                });
            }
        }

        setTimeout(checkWin, 200); 
    }

    /* ================= Game Flow & UI ================= */
    function updateLCD() {
        let count = Math.max(0, state.minesLeft);
        minesCountEl.innerText = count.toString().padStart(3, '0');
    }

    function gameOver(hitR, hitC) {
        state.status = 'lost';
        clearFactsTimer(); // Stop popups
        faceBtn.innerText = '😵';
        playSound('explosion');
        
        document.body.classList.add('shake-screen');
        flashEl.classList.add('active');
        setTimeout(() => flashEl.classList.remove('active'), 200);

        let mines = [];
        for(let r=0; r<config.rows; r++) {
            for(let c=0; c<config.cols; c++) {
                if(board[r][c].isMine && !(r===hitR && c===hitC) && !board[r][c].isFlagged) {
                    mines.push(board[r][c]);
                }
                if(!board[r][c].isMine && board[r][c].isFlagged) {
                    board[r][c].el.innerHTML = '❌';
                    board[r][c].el.style.backgroundColor = 'var(--danger)';
                    board[r][c].el.classList.add('anim-pop');
                }
            }
        }
        
        board[hitR][hitC].el.classList.add('revealed', 'mine');
        board[hitR][hitC].el.style.transform = "scale(1.5)";
        board[hitR][hitC].el.style.zIndex = "20";
        board[hitR][hitC].el.innerHTML = '💣';
        createComicExplosion(hitR, hitC);

        mines.sort((a, b) => {
             let dA = Math.hypot(a.el.dataset.r - hitR, a.el.dataset.c - hitC);
             let dB = Math.hypot(b.el.dataset.r - hitR, b.el.dataset.c - hitC);
             return dA - dB;
        });
        
        mines.forEach((m, idx) => {
            setTimeout(() => {
                m.el.classList.add('revealed', 'anim-pop', 'mine');
                m.el.innerHTML = '💣';
                if(idx % 4 === 0) playSound('pop'); 
            }, idx * (1200 / Math.max(1, mines.length))); 
        });
    }

    function checkWin() {
        if(state.status !== 'playing') return;
        const totalSafe = (config.rows * config.cols) - config.mines;
        if (state.revealedCount === totalSafe) {
            state.status = 'won';
            clearFactsTimer(); // Stop popups
            faceBtn.innerText = '🤩';
            faceBtn.classList.add('anim-rubber');
            playSound('win');
            
            for(let r=0; r<config.rows; r++) {
                for(let c=0; c<config.cols; c++) {
                    if(board[r][c].isMine && !board[r][c].isFlagged) {
                        board[r][c].el.innerHTML = '🌟';
                        board[r][c].el.classList.add('flagged', 'anim-pop');
                    }
                }
            }
            state.minesLeft = 0;
            updateLCD();

            triggerCartoonConfetti();
        }
    }

    /* ================= Cartoon Visual Effects ================= */
    let particles = [];
    let animFrame = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createCartoonDust(r, c) {
        const cell = board[r][c].el;
        const rect = cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        for (let i = 0; i < 8; i++) {
            particles.push({
                type: 'dust',
                x: x, y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                radius: Math.random() * 8 + 4,
                life: 1,
                decay: 0.05
            });
        }
        if(!animFrame) updateParticles();
    }

    function createComicExplosion(r, c) {
        const cell = board[r][c].el;
        const rect = cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        particles.push({
            type: 'boom',
            x: x, y: y,
            radius: 10,
            maxRadius: 150,
            life: 1,
            decay: 0.03
        });

        for (let i = 0; i < 15; i++) {
            particles.push({
                type: 'star',
                x: x, y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 15,
                radius: Math.random() * 10 + 5,
                life: 1,
                decay: 0.02
            });
        }
        if(!animFrame) updateParticles();
    }

    function triggerCartoonConfetti() {
        const colors = ['#e84118', '#4cd137', '#00a8ff', '#fbc531', '#9c88ff'];
        for (let i = 0; i < 150; i++) {
            particles.push({
                type: 'confetti',
                x: canvas.width / 2 + (Math.random() - 0.5) * 300,
                y: canvas.height / 2 + (Math.random() - 0.5) * 300,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 20 - 5,
                life: 1,
                decay: Math.random() * 0.008 + 0.003,
                color: colors[Math.floor(Math.random() * colors.length)],
                width: Math.random() * 15 + 10,
                height: Math.random() * 15 + 10,
                gravity: 0.3,
                friction: 0.95,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 20
            });
        }
        if(!animFrame) updateParticles();
    }

    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }

    function updateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            
            p.life -= p.decay;

            if (p.life > 0) {
                active = true;
                ctx.save();
                
                if (p.type === 'dust') {
                    p.x += p.vx; p.y += p.vy;
                    p.radius += 0.5; 
                    ctx.globalAlpha = p.life;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = "#fff";
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#111";
                    ctx.stroke();
                } 
                else if (p.type === 'boom') {
                    p.radius += (p.maxRadius - p.radius) * 0.2;
                    ctx.globalAlpha = p.life;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = "#ff9f43";
                    ctx.fill();
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = "#111";
                    ctx.stroke();
                }
                else if (p.type === 'star') {
                    p.x += p.vx; p.y += p.vy;
                    p.rotation += p.rotSpeed;
                    ctx.globalAlpha = p.life;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    drawStar(0, 0, 5, p.radius * 2, p.radius);
                    ctx.fillStyle = "#feca57";
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#111";
                    ctx.stroke();
                }
                else if (p.type === 'confetti') {
                    p.vx *= p.friction; p.vy *= p.friction;
                    p.vy += p.gravity;
                    p.x += p.vx; p.y += p.vy;
                    p.rotation += p.rotSpeed;
                    ctx.globalAlpha = p.life;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#111";
                    ctx.strokeRect(-p.width/2, -p.height/2, p.width, p.height);
                }

                ctx.restore();
            } else {
                particles.splice(i, 1);
            }
        }

        if (active) {
            animFrame = requestAnimationFrame(updateParticles);
        } else {
            animFrame = null;
        }
    }
