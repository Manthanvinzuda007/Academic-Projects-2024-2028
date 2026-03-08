/* Created By Manthan Vinzuda */

/** * SETUP MODULE
         * Handles game configuration
         */
        const Setup = (() => {
            let mode = '';
            let totalPlayers = 0;
            let currentPicker = 0;
            let playerList = [];
            let taken = [];

            return {
                setMode(m) {
                    mode = m;
                    totalPlayers = m === 'AI' ? 2 : parseInt(m);
                    document.getElementById('mode-select').style.display = 'none';
                    document.getElementById('color-select').style.display = 'block';
                    this.refreshDots();
                },
                refreshDots() {
                    const msg = document.getElementById('picker-msg');
                    msg.innerText = `Player ${currentPicker + 1}, Choose Color`;
                    document.querySelectorAll('.dot').forEach(d => {
                        const c = d.classList[1];
                        d.classList.toggle('locked', taken.includes(c));
                    });
                },
                chooseColor(color) {
                    if (taken.includes(color)) return;
                    playerList.push({ color, isAI: false });
                    taken.push(color);
                    currentPicker++;

                    const humans = mode === 'AI' ? 1 : totalPlayers;
                    if (currentPicker === humans) {
                        if (mode === 'AI') {
                            const avail = ['red', 'green', 'yellow', 'blue'].filter(c => !taken.includes(c));
                            playerList.push({ color: avail[0], isAI: true });
                        }
                        this.launch();
                    } else {
                        this.refreshDots();
                    }
                },
                launch() {
                    document.getElementById('setup-screen').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('setup-screen').style.display = 'none';
                        Ludo.init(playerList);
                    }, 400);
                }
            };
        })();

        /**
         * LUDO ENGINE
         * Core game mechanics
         */
        const Ludo = (() => {
            const COLORS = ['red', 'green', 'yellow', 'blue'];
            // Precise Standard Ludo Path Indices
            const STAR_COORDS = ["6,1", "1,8", "8,13", "13,6", "8,2", "2,6", "6,12", "12,8"];
            
            // Standard Paths (57 positions: 0 is start, 56 is home)
            const PATHS = {
                red: [[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
                green: [[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
                yellow: [[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
                blue: [[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]
            };

            let state = {
                players: [],
                turnIdx: 0,
                dice: 0,
                rolling: false,
                moving: false,
                sixChain: 0
            };

            const init = (configs) => {
                state.players = configs.map(c => ({
                    ...c,
                    tokens: [-1, -1, -1, -1],
                    finished: 0
                }));
                buildBoard();
                renderUI();
                processTurn();
            };

            const buildBoard = () => {
                const b = document.getElementById('board');
                b.innerHTML = '';

                // Homes
                COLORS.forEach(c => {
                    const h = document.createElement('div');
                    h.className = `home ${c}`;
                    const inner = document.createElement('div');
                    inner.className = 'home-inner';
                    for(let i=0; i<4; i++) {
                        const slot = document.createElement('div');
                        slot.className = 'slot';
                        slot.id = `slot-${c}-${i}`;
                        inner.appendChild(slot);
                    }
                    h.appendChild(inner);
                    b.appendChild(h);
                });

                // Path cells
                for(let r=0; r<15; r++) {
                    for(let c=0; c<15; c++) {
                        if ((r<6 && c<6) || (r<6 && c>8) || (r>8 && c<6) || (r>8 && c>8)) continue;
                        if (r>=6 && r<=8 && c>=6 && c<=8) continue;

                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.dataset.pos = `${r},${c}`;
                        cell.style.gridArea = `${r+1} / ${c+1}`;
                        if (STAR_COORDS.includes(`${r},${c}`)) cell.classList.add('star');
                        
                        // Path coloring
                        if (r === 7 && c > 0 && c < 7) cell.classList.add('bg-red');
                        if (c === 7 && r > 0 && r < 7) cell.classList.add('bg-green');
                        if (r === 7 && c > 8 && c < 14) cell.classList.add('bg-yellow');
                        if (c === 7 && r > 8 && r < 14) cell.classList.add('bg-blue');

                        // Start cell colors
                        if (r===6 && c===1) cell.classList.add('start-red');
                        if (r===1 && c===8) cell.classList.add('start-green');
                        if (r===8 && c===13) cell.classList.add('start-yellow');
                        if (r===13 && c===6) cell.classList.add('start-blue');

                        b.appendChild(cell);
                    }
                }

                // Center House
                const center = document.createElement('div');
                center.className = 'center-house';
                ['r','g','y','b'].forEach(x => {
                    const t = document.createElement('div');
                    t.className = `tri tri-${x}`;
                    center.appendChild(t);
                });
                b.appendChild(center);

                // Tokens
                state.players.forEach(p => {
                    p.tokens.forEach((_, i) => {
                        const t = document.createElement('div');
                        t.className = `token ${p.color}`;
                        t.id = `tok-${p.color}-${i}`;
                        t.onclick = () => handleInput(p.color, i);
                        document.getElementById(`slot-${p.color}-${i}`).appendChild(t);
                    });
                });
            };

            const roll = async () => {
                if (state.rolling || state.moving) return;
                const p = state.players[state.turnIdx];
                const dw = document.getElementById(`dw-${p.color}`);
                
                state.rolling = true;
                dw.querySelector('.dice-face').classList.add('rolling');

                await new Promise(r => setTimeout(r, 700));

                state.dice = Math.floor(Math.random() * 6);
                drawDice(p.color, state.dice);
                dw.querySelector('.dice-face').classList.remove('rolling');
                state.rolling = false;

                 if (state.dice == 6) {
                    state.sixChain++;
                   if (state.sixChain === 3) {
                        state.sixChain = 0;
                        return nextTurn();
                     }
                     
                    } 
                    else {
                        state.sixChain = 0;
                     }

                const moves = getMoves();
                if (moves.length === 0) {
                    setTimeout(nextTurn, 800);
                } else {
                    if (p.isAI) {
                        setTimeout(() => runAI(moves), 800);
                    } else {
                        moves.forEach(mIdx => {
                            document.getElementById(`tok-${p.color}-${mIdx}`).classList.add('active');
                        });
                    }
                }
            };

            const handleInput = async (color, idx) => {
                const p = state.players[state.turnIdx];
                if (p.color !== color || state.moving || state.dice === 0) return;
                const valid = getMoves();
                if (!valid.includes(idx)) return;

                state.moving = true;
                document.querySelectorAll('.token').forEach(t => t.classList.remove('active'));

                const cur = p.tokens[idx];
                if (cur === -1) {
                    p.tokens[idx] = 0;
                    updateTok(color, idx);
                } else {
                    for (let i = 0; i < state.dice; i++) {
                        p.tokens[idx]++;
                        updateTok(color, idx);
                        await new Promise(r => setTimeout(r, 160));
                    }
                }

                finalize(color, idx);
            };

            const finalize = (color, idx) => {
                const p = state.players[state.turnIdx];
                const step = p.tokens[idx];
                const coords = PATHS[color][step];

                // Check Victory
                if (step === 56) {
                    p.finished++;
                    document.getElementById(`tok-${color}-${idx}`).style.display = 'none';
                    if (p.finished === 4) return win(color);
                    return bonus();
                }

                // Check Kill
                let kill = false;
                if (coords && !STAR_COORDS.includes(`${coords[0]},${coords[1]}`)) {
                    state.players.forEach((op, opIdx) => {
                        if (opIdx === state.turnIdx) return;
                        op.tokens.forEach((ostep, oidx) => {
                            if (ostep === -1 || ostep === 56) return;
                            const oc = PATHS[op.color][ostep];
                            if (oc && oc[0] === coords[0] && oc[1] === coords[1]) {
                                op.tokens[oidx] = -1;
                                updateTok(op.color, oidx);
                                kill = true;
                            }
                        });
                    });
                }

                if (kill || state.dice === 6) {
                    bonus();
                } else {
                    nextTurn();
                }
            };

            const bonus = () => {
                state.dice = 0;
                state.moving = false;
                renderUI();
                processTurn();
            };

            const nextTurn = () => {
                state.turnIdx = (state.turnIdx + 1) % state.players.length;
                state.dice = 0;
                state.moving = false;
                state.sixChain = 0;
                renderUI();
                processTurn();
            };

            const processTurn = () => {
                const p = state.players[state.turnIdx];
                if (p.isAI) setTimeout(roll, 1000);
            };

            const getMoves = () => {
                const p = state.players[state.turnIdx];
                return p.tokens.map((s, i) => {
                    if (s === -1 && state.dice === 6) return i;
                    if (s !== -1 && s + state.dice <= 56) return i;
                    return null;
                }).filter(x => x !== null);
            };

            const runAI = (moves) => {
                const p = state.players[state.turnIdx];
                let best = moves[0];

                // Smart AI Priorities: Finish > Kill > Exit Base > Furthest
                for (let m of moves) {
                    const step = p.tokens[m];
                    const target = step === -1 ? 0 : step + state.dice;

                    if (target === 56) { best = m; break; }

                    const tc = PATHS[p.color][target];
                    if (tc && !STAR_COORDS.includes(`${tc[0]},${tc[1]}`)) {
                        const killChance = state.players.some((op, opi) => 
                            opi !== state.turnIdx && op.tokens.some(os => {
                                const oc = PATHS[op.color][os];
                                return oc && oc[0] === tc[0] && oc[1] === tc[1];
                            })
                        );
                        if (killChance) { best = m; break; }
                    }

                    if (step === -1) best = m;
                    else if (step > p.tokens[best]) best = m;
                }
                handleInput(p.color, best);
            };

            const updateTok = (color, idx) => {
                const p = state.players.find(x => x.color === color);
                const step = p.tokens[idx];
                const el = document.getElementById(`tok-${color}-${idx}`);
                
                if (step === -1) {
                    document.getElementById(`slot-${color}-${idx}`).appendChild(el);
                    el.style.transform = 'translate(0,0)';
                } else if (step === 56) {
                    el.style.display = 'none';
                } else {
                    const c = PATHS[color][step];
                    const cell = document.querySelector(`[data-pos="${c[0]},${c[1]}"]`);
                    cell.appendChild(el);
                    adjustStack(cell);
                }
            };

            const adjustStack = (cell) => {
                const toks = cell.querySelectorAll('.token');
                toks.forEach((t, i) => {
                    if (toks.length > 1) {
                        t.style.width = '60%'; t.style.height = '60%';
                        const offset = (i * 3) - (toks.length * 1.5);
                        t.style.transform = `translate(${offset}px, ${offset}px)`;
                    } else {
                        t.style.width = '80%'; t.style.height = '80%';
                        t.style.transform = 'translate(0,0)';
                    }
                });
            };

            const drawDice = (color, val) => {
                const face = document.querySelector(`#dw-${color} .dice-face`);
                face.innerHTML = '';
                const dots = {
                    1:[[2,2]], 2:[[1,1],[3,3]], 3:[[1,1],[2,2],[3,3]],
                    4:[[1,1],[1,3],[3,1],[3,3]], 5:[[1,1],[1,3],[2,2],[3,1],[3,3]],
                    6:[[1,1],[1,3],[2,1],[2,3],[3,1],[3,3]]
                };
                dots[val].forEach(pos => {
                    const dot = document.createElement('div');
                    dot.className = 'dot-dice';
                    dot.style.gridArea = `${pos[0]} / ${pos[1]}`;
                    face.appendChild(dot);
                });
            };

            const renderUI = () => {
                const p = state.players[state.turnIdx];
                const label = document.getElementById('turn-indicator');
                label.innerText = p.isAI ? `AI (${p.color}) thinking...` : `${p.color}'s turn`;
                label.style.borderColor = `var(--${p.color})`;
                label.style.color = `var(--${p.color})`;

                document.querySelectorAll('.dice-wrap').forEach(d => d.classList.add('disabled'));
                document.getElementById(`dw-${p.color}`).classList.remove('disabled');
            };

            const win = (color) => {
                const overlay = document.getElementById('win-overlay');
                const name = document.getElementById('win-name');
                name.innerText = `${color.toUpperCase()} VICTORIOUS!`;
                name.style.color = `var(--${color})`;
                overlay.style.display = 'flex';
            };

            return { init, roll };
        })();

        // Touch handling
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) e.preventDefault();
        }, { passive: false });
