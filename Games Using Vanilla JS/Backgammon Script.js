// Manthan Vinzuda 
        // User Interface & Lobby Management
        
        const LobbyUI = {
            selectedMode: 'ai',

            showPanel(panelId) {
                document.querySelectorAll('.wood-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(panelId).classList.remove('hidden');
            },

            openSetup(mode) {
                this.selectedMode = mode;
                // Show/hide AI difficulty row based on mode
                document.getElementById('ai-difficulty-row').style.display = (mode === 'ai') ? 'flex' : 'none';
                this.showPanel('lobby-setup');
            },

            startGame() {
                // Set name in original UI
                const pName = document.getElementById('player-name').value || "Player 1";
                document.getElementById('ui-p1-name').innerText = pName + " (White)";
                
                // Update original select element
                const nativeSelect = document.getElementById('mode-select');
                nativeSelect.value = this.selectedMode;
                
                // Show the board
                document.body.classList.add('game-active');

                // Start original game script
                initGame();

                // Call resize/render quickly to ensure checkers snap perfectly based on visible geometry
                setTimeout(() => {
                    renderCheckers();
                }, 100);
            },

            exitToLobby() {
                // Hide game, show lobby
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
            }
        };
   
        /**
         * Backgammon Core Logic & UI
         */
        const BOARD_SIZE = 24;
        const P1 = 1; // White, moves 23 -> 0. Home is 0-5.
        const P2 = 2; // Black, moves 0 -> 23. Home is 18-23.

        // DOM Elements
        const boardEl = document.getElementById('board');
        const checkersLayer = document.getElementById('checkers-layer');
        const pointsEl = Array.from(document.querySelectorAll('.point'));
        const barP1El = document.getElementById('bar-p1');
        const barP2El = document.getElementById('bar-p2');
        const homeP1El = document.getElementById('home-p1');
        const homeP2El = document.getElementById('home-p2');
        const turnDisplay = document.getElementById('turn-display');
        const btnRoll = document.getElementById('btn-roll');
        const btnUndo = document.getElementById('btn-undo');
        const die1El = document.getElementById('die1');
        const die2El = document.getElementById('die2');
        const btnRestart = document.getElementById('btn-restart');
        const modeSelect = document.getElementById('mode-select');
        const btnSound = document.getElementById('btn-sound');
        const notif = document.getElementById('notif');

        // Audio Context
        let audioCtx;
        let soundEnabled = true;

        // State Variables
        let state = {
            board: [],
            bar: { 1: 0, 2: 0 },
            off: { 1: 0, 2: 0 },
            turn: P1,
            dice: [],
            originalDice: [],
            diceRolled: false
        };

        let moveHistory = [];
        let checkersData = [];
        let selectedChecker = null;
        let validTargetsForSelected = [];
        let allValidTurns = [];
        let aiMoveQueue = [];

        function initAudio() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        function playTone(type, freq, duration, vol, isSweep = false) {
            if (!soundEnabled) return;
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            if (isSweep) {
                osc.frequency.exponentialRampToValueAtTime(freq / 4, audioCtx.currentTime + duration);
            }
            
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        }

        const Sounds = {
            roll: () => {
                if(!soundEnabled) return;
                let count = 0;
                let int = setInterval(() => {
                    playTone('square', 200 + Math.random()*200, 0.05, 0.05);
                    count++;
                    if(count > 6) clearInterval(int);
                }, 50);
            },
            click: () => playTone('sine', 600, 0.1, 0.1),
            hit: () => playTone('square', 100, 0.2, 0.2, true),
            error: () => playTone('sawtooth', 150, 0.3, 0.1),
            win: () => {
                setTimeout(() => playTone('sine', 400, 0.2, 0.2), 0);
                setTimeout(() => playTone('sine', 500, 0.2, 0.2), 200);
                setTimeout(() => playTone('sine', 600, 0.4, 0.2), 400);
            }
        };

        btnSound.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            btnSound.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
            event.target.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
        });

        function createInitialState() {
            let board = new Array(BOARD_SIZE).fill(null).map(() => ({ p: 0, c: 0 }));
            board[0] = { p: P2, c: 2 };
            board[5] = { p: P1, c: 5 };
            board[7] = { p: P1, c: 3 };
            board[11] = { p: P2, c: 5 };
            board[12] = { p: P1, c: 5 };
            board[16] = { p: P2, c: 3 };
            board[18] = { p: P2, c: 5 };
            board[23] = { p: P1, c: 2 };

            return {
                board, bar: { 1: 0, 2: 0 }, off: { 1: 0, 2: 0 }, turn: P1,
                dice: [], originalDice: [], diceRolled: false
            };
        }

        function initGame() {
            state = createInitialState();
            moveHistory = [];
            aiMoveQueue = [];
            rebuildCheckers();
            btnRoll.disabled = false;
            btnUndo.disabled = true;
            die1El.classList.add('used');
            die2El.classList.add('used');
            document.getElementById('win-modal').style.display = 'none';
        }

        function rebuildCheckers() {
            checkersLayer.innerHTML = '';
            checkersData = [];
            let idCounter = 0;
            for(let i=0; i<BOARD_SIZE; i++) {
                for(let j=0; j<state.board[i].c; j++) {
                    createCheckerDom(idCounter++, state.board[i].p, i);
                }
            }
            for(let j=0; j<state.bar[P1]; j++) createCheckerDom(idCounter++, P1, 'bar');
            for(let j=0; j<state.bar[P2]; j++) createCheckerDom(idCounter++, P2, 'bar');
            setTimeout(updateUI, 10);
        }

        function createCheckerDom(id, player, pIdx) {
            const el = document.createElement('div');
            el.className = `checker p${player}`;
            el.id = `chk-${id}`;
            checkersLayer.appendChild(el);
            checkersData.push({ id, player, pIdx, el });
        }

        pointsEl.forEach(pt => pt.addEventListener('click', () => handlePointClick(parseInt(pt.dataset.idx))));
        barP1El.addEventListener('click', () => handlePointClick('bar1'));
        barP2El.addEventListener('click', () => handlePointClick('bar2'));
        homeP1El.addEventListener('click', () => handlePointClick('off1'));
        homeP2El.addEventListener('click', () => handlePointClick('off2'));

        function handlePointClick(targetLoc) {
            if (!state.diceRolled || state.dice.length === 0) return;
            if (modeSelect.value === 'ai' && state.turn === P2) return;

            if (targetLoc === 'off1' || targetLoc === 'off2') {
                if (selectedChecker && targetLoc === `off${state.turn}`) {
                    let moveInfo = validTargetsForSelected.find(t => t.to === 'off');
                    if (moveInfo) executeMove(moveInfo.turnData);
                }
                return;
            }

            if (selectedChecker && typeof targetLoc === 'number') {
                let moveInfo = validTargetsForSelected.find(t => t.to === targetLoc);
                if (moveInfo) {
                    executeMove(moveInfo.turnData);
                    return;
                }
            }

            let searchLoc = targetLoc;
            if (targetLoc === `bar${state.turn}`) searchLoc = 'bar';
            else if (targetLoc === 'bar1' || targetLoc === 'bar2') return;

            let topId = getTopCheckerId(searchLoc);
            
            if (topId !== null) {
                let cData = checkersData.find(c => c.id === topId);
                if (cData.player !== state.turn) { clearSelection(); return; }

                if (state.bar[state.turn] > 0 && cData.pIdx !== 'bar') {
                    showNotification("Must play from the bar first!");
                    Sounds.error();
                    clearSelection();
                    return;
                }

                if (selectedChecker && selectedChecker.id === cData.id) { clearSelection(); return; }

                clearSelection();
                selectedChecker = cData;
                cData.el.classList.add('selected');
                cData.el.style.zIndex = 1000;
                Sounds.click();

                validTargetsForSelected = [];
                for (let turn of allValidTurns) {
                    if (turn[0].from === cData.pIdx) {
                        if (!validTargetsForSelected.some(t => t.to === turn[0].to)) {
                            validTargetsForSelected.push({ to: turn[0].to, turnData: turn[0] });
                        }
                    }
                }

                validTargetsForSelected.forEach(t => {
                    if (t.to === 'off') {
                        document.getElementById(`home-p${state.turn}`).classList.add('highlight');
                    } else {
                        let el = pointsEl.find(p => parseInt(p.dataset.idx) === t.to);
                        if(el) el.classList.add('highlight');
                    }
                });
            } else { clearSelection(); }
        }

        function cloneState(s) {
            return {
                board: s.board.map(pt => ({...pt})),
                bar: { ...s.bar }, off: { ...s.off }, turn: s.turn,
                dice: [...s.dice], originalDice: [...s.originalDice], diceRolled: s.diceRolled
            };
        }

        function getValidMovesForDie(s, player, die) {
            let moves = [];
            let dir = (player === P1) ? -1 : 1;
            
            if (s.bar[player] > 0) {
                let enterIdx = (player === P1) ? 24 - die : die - 1;
                if (canLandOn(s, enterIdx, player)) moves.push({ from: 'bar', to: enterIdx, die: die });
                return moves;
            }

            let canBearOff = true;
            for (let i = 0; i < BOARD_SIZE; i++) {
                if (s.board[i].p === player && s.board[i].c > 0) {
                    if (player === P1 && i > 5) canBearOff = false;
                    if (player === P2 && i < 18) canBearOff = false;
                }
            }

            for (let i = 0; i < BOARD_SIZE; i++) {
                if (s.board[i].p === player && s.board[i].c > 0) {
                    let target = i + (dir * die);
                    if (target >= 0 && target < BOARD_SIZE) {
                        if (canLandOn(s, target, player)) moves.push({ from: i, to: target, die: die });
                    } else if (canBearOff) {
                        if (player === P1 && target === -1) moves.push({ from: i, to: 'off', die: die });
                        else if (player === P2 && target === 24) moves.push({ from: i, to: 'off', die: die });
                        else if ((player === P1 && target < -1) || (player === P2 && target > 24)) {
                            let hasFurtherBack = false;
                            if (player === P1) {
                                for (let j = i + 1; j <= 5; j++) { if (s.board[j].p === player && s.board[j].c > 0) { hasFurtherBack = true; break; } }
                            } else {
                                for (let j = i - 1; j >= 18; j--) { if (s.board[j].p === player && s.board[j].c > 0) { hasFurtherBack = true; break; } }
                            }
                            if (!hasFurtherBack) moves.push({ from: i, to: 'off', die: die });
                        }
                    }
                }
            }
            return moves;
        }

        function canLandOn(s, idx, player) {
            let pt = s.board[idx];
            return pt.p === 0 || pt.p === player || (pt.p !== player && pt.c === 1);
        }

        function applyMoveToState(s, move, player) {
            let ns = cloneState(s);
            if (move.from === 'bar') ns.bar[player]--;
            else { ns.board[move.from].c--; if (ns.board[move.from].c === 0) ns.board[move.from].p = 0; }

            if (move.to === 'off') ns.off[player]++;
            else {
                let pt = ns.board[move.to];
                if (pt.p !== player && pt.c === 1) {
                    let opp = player === P1 ? P2 : P1;
                    ns.bar[opp]++; pt.p = player; pt.c = 1;
                } else { pt.p = player; pt.c++; }
            }
            return ns;
        }

        function getLegalTurns(s, player, diceRemaining) {
            let turns = [];
            let uniqueDice = [...new Set(diceRemaining)];
            
            for (let d of uniqueDice) {
                let moves = getValidMovesForDie(s, player, d);
                for (let m of moves) {
                    let ns = applyMoveToState(s, m, player);
                    let nextDice = [...diceRemaining];
                    nextDice.splice(nextDice.indexOf(d), 1);
                    
                    if (nextDice.length > 0) {
                        let subTurns = getLegalTurns(ns, player, nextDice);
                        if (subTurns.length > 0) { for (let st of subTurns) turns.push([m, ...st]); } 
                        else turns.push([m]);
                    } else turns.push([m]);
                }
            }
            
            if (turns.length === 0) return [];
            let maxLen = Math.max(...turns.map(t => t.length));
            turns = turns.filter(t => t.length === maxLen);

            if (maxLen === 1 && s.originalDice.length === 2 && s.originalDice[0] !== s.originalDice[1]) {
                let maxDie = Math.max(...s.originalDice);
                let hasMaxDieMove = turns.some(t => t[0].die === maxDie);
                if (hasMaxDieMove) turns = turns.filter(t => t[0].die === maxDie);
            }
            return turns;
        }

        function getTopCheckerId(loc) {
            let chks = [];
            if (loc === 'bar') chks = checkersData.filter(c => c.pIdx === 'bar' && c.player === state.turn);
            else chks = checkersData.filter(c => c.pIdx === loc);
            if(chks.length === 0) return null;
            return chks[chks.length - 1].id;
        }

        function clearSelection() {
            if (selectedChecker) { selectedChecker.el.classList.remove('selected'); selectedChecker.el.style.zIndex = ''; }
            selectedChecker = null; validTargetsForSelected = [];
            document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        }

        function executeMove(moveData) {
            clearSelection();
            if (modeSelect.value === 'pvp' || state.turn === P1) {
                moveHistory.push(cloneState(state));
                btnUndo.disabled = false;
            }

            let hitOccurred = false;
            if (moveData.to !== 'off') {
                let pt = state.board[moveData.to];
                if (pt.p !== 0 && pt.p !== state.turn && pt.c === 1) hitOccurred = true;
            }
            
            state = applyMoveToState(state, moveData, state.turn);
            let dieIdx = state.dice.indexOf(moveData.die);
            if(dieIdx > -1) state.dice.splice(dieIdx, 1);
            updateDiceUI();

            let cData;
            if (moveData.from === 'bar') cData = checkersData.find(c => c.player === state.turn && c.pIdx === 'bar');
            else {
                let topId = getTopCheckerId(moveData.from);
                cData = checkersData.find(c => c.id === topId);
            }
            
            if (cData) {
                cData.pIdx = moveData.to; cData.el.style.zIndex = 500; 
                setTimeout(() => cData.el.style.zIndex = '', 400); 
            }

            if (hitOccurred) {
                Sounds.hit();
                let opp = state.turn === P1 ? P2 : P1;
                let oppChk = checkersData.find(c => c.pIdx === moveData.to && c.player === opp);
                if (oppChk) oppChk.pIdx = 'bar';
            } else Sounds.click();

            renderCheckers();
            checkWinCondition();

            if (state.dice.length > 0) {
                allValidTurns = getLegalTurns(state, state.turn, state.dice);
                updatePlayableHighlights();
                if (allValidTurns.length === 0) {
                    showNotification("No valid moves.");
                    aiMoveQueue = [];
                    setTimeout(() => switchTurn(), 1500);
                } else if (modeSelect.value === 'ai' && state.turn === P2) {
                    setTimeout(processAITurn, 800);
                }
            } else {
                updatePlayableHighlights();
                setTimeout(() => switchTurn(), 800);
            }
        }

        btnUndo.addEventListener('click', () => {
            if (moveHistory.length === 0 || (modeSelect.value === 'ai' && state.turn === P2)) return;
            state = moveHistory.pop();
            rebuildCheckers();
            updateDiceUI();
            allValidTurns = getLegalTurns(state, state.turn, state.dice);
            updatePlayableHighlights();
            if (moveHistory.length === 0) btnUndo.disabled = true;
        });

        function rollDice() {
            if (state.diceRolled) return;
            Sounds.roll();
            die1El.classList.add('rolling'); die2El.classList.add('rolling');
            btnRoll.disabled = true;

            setTimeout(() => {
                die1El.classList.remove('rolling'); die2El.classList.remove('rolling');
                
                let d1 = Math.floor(Math.random() * 6) + 1;
                let d2 = Math.floor(Math.random() * 6) + 1;
                
                die1El.dataset.val = d1; die2El.dataset.val = d2;
                
                if (d1 === d2) {
                    state.dice = [d1, d1, d1, d1]; state.originalDice = [d1, d1, d1, d1];
                    showNotification("Doubles!");
                } else {
                    state.dice = [d1, d2]; state.originalDice = [d1, d2];
                }
                
                state.diceRolled = true; moveHistory = []; btnUndo.disabled = true; updateDiceUI();
                allValidTurns = getLegalTurns(state, state.turn, state.dice);
                updatePlayableHighlights();
                
                if (allValidTurns.length === 0) {
                    showNotification("No valid moves.");
                    setTimeout(() => switchTurn(), 2500);
                } else if (modeSelect.value === 'ai' && state.turn === P2) {
                    setTimeout(processAITurn, 1000);
                }
            }, 400); 
        }

        btnRoll.addEventListener('click', rollDice);

        function updateDiceUI() {
            let orig = [...state.originalDice]; let curr = [...state.dice];
            if (orig.length === 4) {
                let used = 4 - curr.length;
                if (used >= 2) die1El.classList.add('used'); else die1El.classList.remove('used');
                if (used >= 4) die2El.classList.add('used'); else die2El.classList.remove('used');
            } else {
                if (!curr.includes(parseInt(die1El.dataset.val)) || curr.length === 0) die1El.classList.add('used');
                else die1El.classList.remove('used');
                
                if (!curr.includes(parseInt(die2El.dataset.val)) || curr.length === 0) {
                    let countInOrig = orig.filter(x=>x===parseInt(die2El.dataset.val)).length;
                    let countInCurr = curr.filter(x=>x===parseInt(die2El.dataset.val)).length;
                    if(countInCurr < countInOrig && die1El.dataset.val !== die2El.dataset.val) die2El.classList.add('used');
                    else if(curr.length === 0) die2El.classList.add('used');
                    else die2El.classList.remove('used');
                } else die2El.classList.remove('used');
            }
        }

        function switchTurn() {
            if(state.off[1] === 15 || state.off[2] === 15) return; 
            state.turn = state.turn === P1 ? P2 : P1;
            state.diceRolled = false; state.dice = []; state.originalDice = [];
            allValidTurns = []; aiMoveQueue = []; moveHistory = [];
            clearSelection(); updatePlayableHighlights();
            
            die1El.classList.add('used'); die2El.classList.add('used');
            btnRoll.disabled = false; btnUndo.disabled = true;
            
            updateUI();

            if (modeSelect.value === 'ai' && state.turn === P2) {
                btnRoll.disabled = true;
                setTimeout(rollDice, 800);
            }
        }

        function updateUI() {
            let p1Name = document.getElementById('player-name') ? document.getElementById('player-name').value : "Player 1";
            turnDisplay.textContent = state.turn === P1 ? `${p1Name}'s Turn` : "Player 2 (Black)'s Turn";
            turnDisplay.style.color = state.turn === P1 ? "#e4c59a" : "#aaa";
            
            document.getElementById('score-p1').textContent = state.off[1];
            document.getElementById('score-p2').textContent = state.off[2];
            document.getElementById('count-off1').textContent = state.off[1];
            document.getElementById('count-off2').textContent = state.off[2];
            
            renderCheckers();
        }

        function updatePlayableHighlights() {
            document.querySelectorAll('.checker.playable').forEach(el => el.classList.remove('playable'));
            if (state.turn === P2 && modeSelect.value === 'ai') return; 
            if (!state.diceRolled || state.dice.length === 0) return;

            let playableOrigins = new Set(allValidTurns.map(t => t[0].from));
            playableOrigins.forEach(origin => {
                let locStr = origin === 'bar' ? 'bar' : origin; 
                let topId = getTopCheckerId(locStr);
                if (topId !== null) {
                    let chk = checkersData.find(c => c.id === topId);
                    if (chk) chk.el.classList.add('playable');
                }
            });
        }

        function renderCheckers() {
            const layerRect = checkersLayer.getBoundingClientRect();
            if(layerRect.width === 0) return; 
            
            const tempChecker = document.createElement('div');
            tempChecker.className = 'checker';
            tempChecker.style.visibility = 'hidden';
            checkersLayer.appendChild(tempChecker);
            const checkerSize = tempChecker.getBoundingClientRect().width;
            checkersLayer.removeChild(tempChecker);
            
            let groups = { 'bar1':[], 'bar2':[], 'off1':[], 'off2':[] };
            for(let i=0; i<BOARD_SIZE; i++) groups[i] = [];
            
            checkersData.forEach(c => {
                if (c.pIdx === 'bar') groups[`bar${c.player}`].push(c);
                else if (c.pIdx === 'off') groups[`off${c.player}`].push(c);
                else groups[c.pIdx].push(c);
            });

            const positionGroup = (grp, targetEl, isTop, isBarOrOff = false) => {
                if(grp.length === 0 || !targetEl) return;
                const targetRect = targetEl.getBoundingClientRect();
                
                let baseX = targetRect.left - layerRect.left + (targetRect.width / 2) - (checkerSize / 2);
                let baseY = targetRect.top - layerRect.top;
                
                let usableHeight = targetRect.height;
                if (!isBarOrOff) usableHeight = targetRect.height * 0.90; 

                let stepY = checkerSize;
                if (grp.length * checkerSize > usableHeight && grp.length > 1) {
                    stepY = (usableHeight - checkerSize) / (grp.length - 1);
                }

                grp.forEach((c, idx) => {
                    let x = baseX; let y;
                    if (isBarOrOff) {
                        let totalHeight = checkerSize + (grp.length - 1) * stepY;
                        let startY = baseY + (targetRect.height / 2) - (totalHeight / 2);
                        y = startY + (idx * stepY);
                    } else {
                        if (isTop) y = baseY + (idx * stepY);
                        else y = baseY + targetRect.height - checkerSize - (idx * stepY);
                    }
                    c.el.style.transform = `translate(${x}px, ${y}px)`;
                    
                    if (idx === grp.length - 1 && grp.length > 5 && !isBarOrOff) {
                        c.el.innerHTML = `<div class="badge">${grp.length}</div>`;
                    } else c.el.innerHTML = '';
                });
            };

            pointsEl.forEach(pt => {
                let idx = parseInt(pt.dataset.idx); let isTop = pt.classList.contains('top-row');
                positionGroup(groups[idx], pt, isTop);
            });

            positionGroup(groups['bar1'], barP1El, true, true);
            positionGroup(groups['bar2'], barP2El, true, true);
            
            groups['off1'].forEach(c => c.el.style.transform = `translate(-200px, -200px) scale(0)`);
            groups['off2'].forEach(c => c.el.style.transform = `translate(-200px, -200px) scale(0)`);
        }

        window.addEventListener('resize', renderCheckers);

        function getPipCount(s, player) {
            let pips = 0;
            for (let i = 0; i < BOARD_SIZE; i++) {
                if (s.board[i].p === player) { pips += s.board[i].c * (player === P1 ? (i + 1) : (24 - i)); }
            }
            pips += s.bar[player] * 25;
            return pips;
        }

        function evaluateBoard(s, player) {
            let score = 0; let opp = player === P1 ? P2 : P1;

            score += (getPipCount(s, opp) - getPipCount(s, player)) * 2;
            score += s.off[player] * 300; score -= s.off[opp] * 300;
            score -= s.bar[player] * 150; score += s.bar[opp] * 150;

            for (let i = 0; i < BOARD_SIZE; i++) {
                let pt = s.board[i];
                if (pt.p === player) {
                    if (pt.c > 1) {
                        score += 15; 
                        if ((player === P1 && i <= 5) || (player === P2 && i >= 18)) score += 20; 
                    } else if (pt.c === 1) score -= s.bar[opp] > 0 ? 30 : 15;
                } else if (pt.p === opp) { if (pt.c === 1) score += 10; }
            }
            return score;
        }

        function processAITurn() {
            if (state.turn !== P2) return;
            if (aiMoveQueue.length > 0) {
                let move = aiMoveQueue.shift(); executeMove(move); return;
            }

            if (allValidTurns.length === 0) return;
            
            let bestScore = -Infinity; let bestTurns = [];

            for (let turn of allValidTurns) {
                let tempState = cloneState(state);
                for (let move of turn) { tempState = applyMoveToState(tempState, move, P2); }
                let score = evaluateBoard(tempState, P2);
                
                let blotCount = tempState.board.filter(pt => pt.p === P2 && pt.c === 1).length;
                score -= blotCount * 30; 

                if (score > bestScore) { bestScore = score; bestTurns = [turn]; } 
                else if (score === bestScore) { bestTurns.push(turn); }
            }
            
            let chosenTurn = bestTurns[Math.floor(Math.random() * bestTurns.length)];

            if (chosenTurn && chosenTurn.length > 0) {
                aiMoveQueue = [...chosenTurn];
                let move = aiMoveQueue.shift(); executeMove(move);
            }
        }

        function showNotification(msg) {
            notif.textContent = msg; notif.classList.add('show-notif');
            setTimeout(() => notif.classList.remove('show-notif'), 2000);
        }

        function checkWinCondition() {
            if (state.off[1] === 15 || state.off[2] === 15) {
                let p1Name = document.getElementById('player-name') ? document.getElementById('player-name').value : "Player 1";
                let winner = state.off[1] === 15 ? `${p1Name} (White)` : "Player 2 (Black)";
                document.getElementById('win-text').textContent = `${winner} Wins!`;
                document.getElementById('win-stats').textContent = `Final Pips - P1: ${getPipCount(state, P1)} | P2: ${getPipCount(state, P2)}`;
                document.getElementById('win-modal').style.display = 'flex';
                Sounds.win();
            }
        }

        btnRestart.addEventListener('click', initGame);
        document.getElementById('btn-play-again').addEventListener('click', initGame);
        modeSelect.addEventListener('change', initGame);

