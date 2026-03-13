
        /* =========================================
           CONSTANTS & UTILS
           ========================================= */
        const DOT_MAP = {
            0: [],
            1: [4],
            2: [2, 6],
            3: [2, 4, 6],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 2, 3, 5, 6, 8]
        };

        const sleep = ms => new Promise(r => setTimeout(r, ms));

        /* =========================================
           SOUND ENGINE (Web Audio API)
           ========================================= */
        class SoundEngine {
            constructor() {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.enabled = true;
            }

            playOscillator(type, freq, duration, vol, slideFreq = null) {
                if (!this.enabled) return;
                if (this.ctx.state === 'suspended') this.ctx.resume();
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = type;
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                if (slideFreq) {
                    osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
                }

                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
                
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            }

            playWoodKnock() { this.playOscillator('triangle', 150, 0.1, 0.5, 50); }
            playDraw() { this.playOscillator('sine', 400, 0.15, 0.3, 600); }
            playError() { this.playOscillator('sawtooth', 100, 0.3, 0.3, 80); }
            playWin() {
                [300, 400, 500, 600, 800].forEach((freq, i) => {
                    setTimeout(() => this.playOscillator('sine', freq, 0.2, 0.3), i * 100);
                });
            }
        }

        /* =========================================
           CLASSES
           ========================================= */
        class Tile {
            constructor(val1, val2, id) {
                this.val1 = val1;
                this.val2 = val2;
                this.id = id;
                this.isDouble = val1 === val2;
                this.weight = val1 + val2;
            }

            createDOM(isHidden = false, isHorizontal = false) {
                const wrap = document.createElement('div');
                wrap.className = `domino ${isHidden ? 'hidden-tile' : ''} ${isHorizontal ? 'horizontal' : ''}`;
                wrap.dataset.id = this.id;

                const tHalf = document.createElement('div'); tHalf.className = 'domino-half';
                const bHalf = document.createElement('div'); bHalf.className = 'domino-half';

                this._appendDots(tHalf, this.val1);
                this._appendDots(bHalf, this.val2);

                wrap.appendChild(tHalf);
                wrap.appendChild(bHalf);
                return wrap;
            }

            _appendDots(container, value) {
                const indices = DOT_MAP[value] || [];
                for (let i = 0; i < 9; i++) {
                    const cell = document.createElement('div'); cell.className = 'dot-container';
                    if (indices.includes(i)) {
                        const dot = document.createElement('div'); dot.className = 'dot';
                        cell.appendChild(dot);
                    }
                    container.appendChild(cell);
                }
            }
        }

        class Player {
            constructor(name, isAI = false) {
                this.name = name;
                this.hand = [];
                this.isAI = isAI;
            }
            
            getHighestDouble() {
                let max = -1, target = null;
                this.hand.forEach(t => { if(t.isDouble && t.val1 > max) { max = t.val1; target = t; }});
                return target;
            }

            getHighestWeightTile() {
                if(this.hand.length === 0) return null;
                return this.hand.reduce((prev, curr) => (prev.weight > curr.weight) ? prev : curr);
            }

            getValidMoves(leftEnd, rightEnd, boardEmpty) {
                if (boardEmpty) return [...this.hand];
                return this.hand.filter(t => t.val1 === leftEnd || t.val2 === leftEnd || t.val1 === rightEnd || t.val2 === rightEnd);
            }
        }

        class AIPlayer extends Player {
            constructor(name, difficulty) {
                super(name, true);
                this.difficulty = difficulty; // 'easy', 'medium', 'hard'
            }

            async calculateMove(boardObj, gameRef) {
                await sleep(1000 + Math.random() * 1000); // Thinking delay
                
                const validMoves = this.getValidMoves(boardObj.leftEnd, boardObj.rightEnd, boardObj.isEmpty());
                
                if (validMoves.length === 0) return null; // Needs to draw/pass

                let chosenTile = validMoves[0];

                if (this.difficulty === 'easy') {
                    // Random
                    chosenTile = validMoves[Math.floor(Math.random() * validMoves.length)];
                } else if (this.difficulty === 'medium') {
                    // Greedy: Highest pip value
                    chosenTile = validMoves.reduce((prev, curr) => (prev.weight > curr.weight) ? prev : curr);
                } else if (this.difficulty === 'hard') {
                    // Strategic: Count frequencies, prefer doubles, try to preserve own variety
                    chosenTile = this.getStrategicMove(validMoves, boardObj);
                }

                // Determine side
                let side = 'right';
                if (!boardObj.isEmpty()) {
                    const canLeft = chosenTile.val1 === boardObj.leftEnd || chosenTile.val2 === boardObj.leftEnd;
                    const canRight = chosenTile.val1 === boardObj.rightEnd || chosenTile.val2 === boardObj.rightEnd;
                    
                    if (canLeft && canRight && boardObj.leftEnd !== boardObj.rightEnd) {
                        // Hard AI tries to leave numbers it has in hand
                        if (this.difficulty === 'hard') {
                            side = this.bestSideStrategic(chosenTile, boardObj);
                        } else {
                            side = Math.random() > 0.5 ? 'left' : 'right';
                        }
                    } else if (canLeft) {
                        side = 'left';
                    }
                }

                return { tile: chosenTile, side };
            }

            getStrategicMove(validMoves, boardObj) {
                // Play highest double if possible
                const doubles = validMoves.filter(t => t.isDouble);
                if (doubles.length > 0) return doubles.reduce((p, c) => p.weight > c.weight ? p : c);

                // Count frequencies in own hand
                const counts = new Array(7).fill(0);
                this.hand.forEach(t => { counts[t.val1]++; if(!t.isDouble) counts[t.val2]++; });

                // Pick tile that leaves an end we have a lot of
                let bestTile = validMoves[0];
                let bestScore = -1;

                for (let t of validMoves) {
                    let score = t.weight * 0.1; // Base score on weight
                    
                    if (boardObj.isEmpty()) {
                        score += counts[t.val1] + counts[t.val2];
                    } else {
                        // If played left, new left end is the non-matching side
                        if (t.val1 === boardObj.leftEnd) score += counts[t.val2] * 2;
                        if (t.val2 === boardObj.leftEnd) score += counts[t.val1] * 2;
                        
                        if (t.val1 === boardObj.rightEnd) score += counts[t.val2] * 2;
                        if (t.val2 === boardObj.rightEnd) score += counts[t.val1] * 2;
                    }
                    if (score > bestScore) { bestScore = score; bestTile = t; }
                }
                return bestTile;
            }

            bestSideStrategic(tile, boardObj) {
                const counts = new Array(7).fill(0);
                this.hand.forEach(t => { counts[t.val1]++; if(!t.isDouble) counts[t.val2]++; });
                
                // If play left, new left end is the opposite of what matched.
                let newLeftEnd = tile.val1 === boardObj.leftEnd ? tile.val2 : tile.val1;
                let newRightEnd = tile.val1 === boardObj.rightEnd ? tile.val2 : tile.val1;

                let scoreLeft = counts[newLeftEnd];
                let scoreRight = counts[newRightEnd];

                return scoreLeft >= scoreRight ? 'left' : 'right';
            }
        }

        class Board {
            constructor() {
                this.tiles = []; // { tile, isDouble, leftVal, rightVal }
                this.leftEnd = null;
                this.rightEnd = null;
            }

            isEmpty() { return this.tiles.length === 0; }

            addTile(tile, side) {
                let placed = { tile, isDouble: tile.isDouble };
                
                if (this.isEmpty()) {
                    placed.leftVal = tile.val1;
                    placed.rightVal = tile.val2;
                    this.leftEnd = tile.val1;
                    this.rightEnd = tile.val2;
                    this.tiles.push(placed);
                } else if (side === 'left') {
                    if (tile.val2 === this.leftEnd) { placed.leftVal = tile.val1; placed.rightVal = tile.val2; }
                    else { placed.leftVal = tile.val2; placed.rightVal = tile.val1; }
                    this.leftEnd = placed.leftVal;
                    this.tiles.unshift(placed);
                } else {
                    if (tile.val1 === this.rightEnd) { placed.leftVal = tile.val1; placed.rightVal = tile.val2; }
                    else { placed.leftVal = tile.val2; placed.rightVal = tile.val1; }
                    this.rightEnd = placed.rightVal;
                    this.tiles.push(placed);
                }
            }
        }

        class Game {
            constructor(modeString, soundEngine) {
                this.sound = soundEngine;
                this.mode = modeString; // 'pvp', 'pvai-easy', 'pvai-medium', 'pvai-hard'
                
                this.players = [];
                this.players[0] = new Player("Player 1");
                
                if (this.mode === 'pvp') {
                    this.players[1] = new Player("Player 2");
                    document.getElementById('btn-undo').classList.remove('hidden');
                } else {
                    const diff = this.mode.split('-')[1];
                    this.players[1] = new AIPlayer("AI (" + diff + ")", diff);
                    document.getElementById('btn-undo').classList.add('hidden');
                }

                this.boneyard = [];
                this.board = new Board();
                this.turn = 0; // 0 for p1, 1 for p2
                this.passCount = 0;
                this.active = false;
                
                this.pendingTile = null;
                this.history = []; // For undo in PvP

                // Score setup
                this.scores = JSON.parse(localStorage.getItem('dominoScores')) || { p1: 0, p2: 0 };
                this.updateScoreUI();

                this.initDeck();
                this.determineFirstPlayer();
            }

            initDeck() {
                let deck = [];
                let id = 0;
                for (let i = 0; i <= 6; i++) {
                    for (let j = i; j <= 6; j++) {
                        deck.push(new Tile(i, j, id++));
                    }
                }
                // Shuffle
                for (let i = deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [deck[i], deck[j]] = [deck[j], deck[i]];
                }

                this.players[0].hand = deck.splice(0, 7);
                this.players[1].hand = deck.splice(0, 7);
                this.boneyard = deck;
            }

            saveState() {
                if (this.mode !== 'pvp') return;
                // Deepish clone of state
                const state = {
                    p0Hand: [...this.players[0].hand],
                    p1Hand: [...this.players[1].hand],
                    boneyard: [...this.boneyard],
                    boardTiles: [...this.board.tiles],
                    leftEnd: this.board.leftEnd,
                    rightEnd: this.board.rightEnd,
                    turn: this.turn,
                    passCount: this.passCount
                };
                this.history.push(state);
            }

            undoMove() {
                if (this.mode !== 'pvp' || this.history.length === 0 || !this.active) return;
                
                const state = this.history.pop();
                this.players[0].hand = state.p0Hand;
                this.players[1].hand = state.p1Hand;
                this.boneyard = state.boneyard;
                this.board.tiles = state.boardTiles;
                this.board.leftEnd = state.leftEnd;
                this.board.rightEnd = state.rightEnd;
                this.turn = state.turn;
                this.passCount = state.passCount;
                
                this.renderAll();
                this.setTurnMessage("Undid move. " + this.players[this.turn].name + "'s turn.");
            }

            determineFirstPlayer() {
                let p1Max = this.players[0].getHighestDouble();
                let p2Max = this.players[1].getHighestDouble();

                let firstTile = null;

                if (p1Max || p2Max) {
                    let v1 = p1Max ? p1Max.val1 : -1;
                    let v2 = p2Max ? p2Max.val1 : -1;
                    
                    if (v1 > v2) { this.turn = 0; firstTile = p1Max; }
                    else { this.turn = 1; firstTile = p2Max; }
                } else {
                    let p1H = this.players[0].getHighestWeightTile();
                    let p2H = this.players[1].getHighestWeightTile();
                    if (p1H.weight >= p2H.weight) { this.turn = 0; firstTile = p1H; }
                    else { this.turn = 1; firstTile = p2H; }
                }

                this.active = true;
                
                // Play first tile automatically
                const cp = this.players[this.turn];
                cp.hand = cp.hand.filter(t => t.id !== firstTile.id);
                this.board.addTile(firstTile, 'right');
                
                this.setTurnMessage(`${cp.name} started with [${firstTile.val1}|${firstTile.val2}]`);
                this.sound.playWoodKnock();
                this.switchTurn();
            }

            renderAll() {
                this.renderOpponent();
                this.renderPlayer();
                this.renderBoard();
                this.renderBoneyard();
                this.checkDrawOrPassUI();
            }

            renderBoard() {
                const bCont = document.getElementById('board');
                bCont.innerHTML = '';
                
                this.board.tiles.forEach(placed => {
                    const isHoriz = !placed.isDouble;
                    const el = placed.tile.createDOM(false, isHoriz);
                    
                    if (!isHoriz) el.style.margin = '0 5px';
                    
                    // Orient logic:
                    // standard tile creation is val1 top, val2 bottom. For horizontal, val1 left, val2 right.
                    // We need to flip via CSS rotate if the orientation is inverted based on board placement.
                    if (isHoriz) {
                        if (placed.leftVal !== placed.tile.val1) {
                            el.style.transform = 'rotate(180deg)';
                        }
                    } else {
                        // Vertical double, doesn't matter visually
                    }
                    
                    bCont.appendChild(el);
                });

                // Scroll to end logic (keep focus centered on latest action typically, but scrollRight is fine)
                const scrollCont = document.getElementById('board-container');
                scrollCont.scrollLeft = (scrollCont.scrollWidth - scrollCont.clientWidth) / 2;
            }

            renderOpponent() {
                const oppArea = document.getElementById('opponent-area');
                oppArea.innerHTML = '';
                
                const isPvP = this.mode === 'pvp';
                const p = this.players[1];
                
                if (isPvP && this.turn === 1) {
                    // Show face up if it's player 2's turn in PvP
                    this._renderHandToContainer(p, oppArea, true);
                } else {
                    // Show face down
                    p.hand.forEach(() => {
                        const el = document.createElement('div');
                        el.className = 'domino hidden-tile';
                        el.style.transform = 'scale(0.8)';
                        oppArea.appendChild(el);
                    });
                }
            }

            renderPlayer() {
                const pArea = document.getElementById('player-hand');
                pArea.innerHTML = '';
                
                const p = this.players[0];
                document.getElementById('ui-player-name').innerText = this.players[this.turn].name + "'s Turn";
                
                if (this.mode === 'pvp' && this.turn === 1) {
                    // Hide Player 1 hand during P2 turn
                    p.hand.forEach(() => {
                        const el = document.createElement('div');
                        el.className = 'domino hidden-tile';
                        pArea.appendChild(el);
                    });
                } else {
                    this._renderHandToContainer(this.players[this.turn === 0 ? 0 : (this.mode==='pvp'?1:0)], pArea, false);
                }
            }

            _renderHandToContainer(player, container, isTop) {
                // Sort for UI convenience
                const sortedHand = [...player.hand].sort((a,b) => a.weight - b.weight);
                const validMoves = this.active && this.players[this.turn] === player ? player.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty()) : [];
                const validIds = validMoves.map(t => t.id);

                sortedHand.forEach(tile => {
                    const el = tile.createDOM(false, false);
                    el.classList.add('in-hand');
                    if (isTop) el.style.transform = 'scale(0.8)';
                    
                    const isPlayable = validIds.includes(tile.id);
                    if (isPlayable) {
                        el.classList.add('playable');
                    } else if (this.active && this.players[this.turn] === player && !this.board.isEmpty()) {
                        el.classList.add('unplayable');
                    }

                    el.onclick = () => this.handleTileClick(tile, player);
                    container.appendChild(el);
                });
            }

            renderBoneyard() {
                const count = document.getElementById('ui-boneyard-count');
                const pile = document.getElementById('ui-boneyard');
                count.innerText = this.boneyard.length;
                
                if (this.boneyard.length === 0) {
                    pile.classList.add('empty');
                } else {
                    pile.classList.remove('empty');
                }
            }

            checkDrawOrPassUI() {
                if (!this.active) return;
                const p = this.players[this.turn];
                if (p.isAI) return;

                const valid = p.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                const btnPass = document.getElementById('btn-pass');
                const pile = document.getElementById('ui-boneyard');
                
                if (valid.length === 0) {
                    if (this.boneyard.length > 0) {
                        this.setTurnMessage("No valid moves. Draw from boneyard.");
                        pile.style.boxShadow = "0 0 20px var(--highlight-color)";
                        btnPass.classList.add('hidden');
                    } else {
                        this.setTurnMessage("No moves & Boneyard empty. Must Pass.");
                        btnPass.classList.remove('hidden');
                        pile.style.boxShadow = "";
                    }
                } else {
                    btnPass.classList.add('hidden');
                    pile.style.boxShadow = "";
                }
            }

            setTurnMessage(msg) {
                const el = document.getElementById('ui-turn-msg');
                el.innerText = msg;
                el.style.animation = 'none';
                void el.offsetWidth; // trigger reflow
                el.style.animation = 'pulse 2s infinite';
            }

            handleTileClick(tile, playerOwner) {
                if (!this.active) return;
                if (playerOwner !== this.players[this.turn]) return;

                const validMoves = playerOwner.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                if (!validMoves.find(t => t.id === tile.id)) {
                    this.sound.playError();
                    return;
                }

                this.saveState(); // Save before move

                const canLeft = tile.val1 === this.board.leftEnd || tile.val2 === this.board.leftEnd;
                const canRight = tile.val1 === this.board.rightEnd || tile.val2 === this.board.rightEnd;

                if (this.board.isEmpty()) {
                    this._commitPlay(tile, playerOwner, 'right');
                } else if (canLeft && canRight && this.board.leftEnd !== this.board.rightEnd) {
                    this.pendingTile = tile;
                    this.showChoiceModal(tile);
                } else if (canLeft) {
                    this._commitPlay(tile, playerOwner, 'left');
                } else {
                    this._commitPlay(tile, playerOwner, 'right');
                }
            }

            showChoiceModal(tile) {
                const m = document.getElementById('choice-modal');
                const prev = document.getElementById('choice-preview');
                prev.innerHTML = '';
                prev.appendChild(tile.createDOM());
                m.classList.remove('hidden');
            }

            executePlay(side) {
                document.getElementById('choice-modal').classList.add('hidden');
                if (this.pendingTile) {
                    this._commitPlay(this.pendingTile, this.players[this.turn], side);
                    this.pendingTile = null;
                }
            }

            cancelPlay() {
                document.getElementById('choice-modal').classList.add('hidden');
                this.pendingTile = null;
                this.history.pop(); // Remove state save since cancelled
            }

            _commitPlay(tile, player, side) {
                player.hand = player.hand.filter(t => t.id !== tile.id);
                this.board.addTile(tile, side);
                this.sound.playWoodKnock();
                this.passCount = 0; // reset pass count
                this.switchTurn();
            }

            handleBoneyardClick() {
                if (!this.active || this.boneyard.length === 0) return;
                const p = this.players[this.turn];
                if (p.isAI) return;

                const valid = p.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                if (valid.length > 0) {
                    this.sound.playError();
                    this.setTurnMessage("You have playable tiles!");
                    return;
                }

                this.saveState();
                const drawn = this.boneyard.pop();
                p.hand.push(drawn);
                this.sound.playDraw();
                
                const newValid = p.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                if (newValid.length > 0) {
                    this.setTurnMessage("You drew a playable tile!");
                } else {
                    this.setTurnMessage("Still no moves. Draw again.");
                }
                this.renderAll();
            }

            passTurn() {
                if (!this.active) return;
                this.saveState();
                this.passCount++;
                this.sound.playError();
                document.getElementById('btn-pass').classList.add('hidden');
                this.switchTurn();
            }

            showHint() {
                if(!this.active || this.players[this.turn].isAI) return;
                const p = this.players[this.turn];
                const valid = p.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                if (valid.length > 0) {
                    // Highlight first valid tile
                    const id = valid[0].id;
                    const el = document.querySelector(`.domino[data-id='${id}']`);
                    if(el) {
                        el.classList.add('hinted');
                        setTimeout(() => el.classList.remove('hinted'), 2000);
                    }
                }
            }

            switchTurn() {
                this.renderAll();
                
                if (this.checkGameOver()) return;

                this.turn = this.turn === 0 ? 1 : 0;
                
                if (this.players[this.turn].isAI) {
                    this.setTurnMessage(`${this.players[this.turn].name} is thinking...`);
                    this.doAITurn();
                } else {
                    this.setTurnMessage(`${this.players[this.turn].name}'s Turn`);
                    this.renderAll(); // Rerender to show correct hand in PvP
                }
            }

            async doAITurn() {
                const ai = this.players[this.turn];
                
                // AI Draw loop
                let valid = ai.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                while(valid.length === 0 && this.boneyard.length > 0) {
                    await sleep(600);
                    ai.hand.push(this.boneyard.pop());
                    this.sound.playDraw();
                    this.renderAll();
                    valid = ai.getValidMoves(this.board.leftEnd, this.board.rightEnd, this.board.isEmpty());
                }

                if (valid.length === 0) {
                    await sleep(800);
                    this.passCount++;
                    this.setTurnMessage("AI passed.");
                    this.sound.playError();
                    this.switchTurn();
                    return;
                }

                const move = await ai.calculateMove(this.board, this);
                if (move) {
                    this._commitPlay(move.tile, ai, move.side);
                }
            }

            checkGameOver() {
                let p1HandWeight = this.players[0].hand.reduce((sum, t) => sum + t.weight, 0);
                let p2HandWeight = this.players[1].hand.reduce((sum, t) => sum + t.weight, 0);

                let winner = -1; // -1 none, 0 p1, 1 p2, 2 draw
                let reason = "";

                if (this.players[0].hand.length === 0) {
                    winner = 0; reason = "Player 1 Dominoed!";
                } else if (this.players[1].hand.length === 0) {
                    winner = 1; reason = `${this.players[1].name} Dominoed!`;
                } else if (this.passCount >= 2) {
                    reason = "Game Blocked!";
                    if (p1HandWeight < p2HandWeight) winner = 0;
                    else if (p2HandWeight < p1HandWeight) winner = 1;
                    else winner = 2; // Draw
                }

                if (winner !== -1) {
                    this.active = false;
                    this.endGame(winner, reason, p1HandWeight, p2HandWeight);
                    return true;
                }
                return false;
            }

            endGame(winner, reason, p1W, p2W) {
                this.sound.playWin();
                
                const m = document.getElementById('game-over-modal');
                const t = document.getElementById('go-title');
                
                if (winner === 0) {
                    t.innerText = "Player 1 Wins! 🎉";
                    t.style.color = "var(--highlight-color)";
                    this.scores.p1++;
                    app.fireConfetti();
                } else if (winner === 1) {
                    t.innerText = `${this.players[1].name} Wins!`;
                    t.style.color = "var(--danger-color)";
                    this.scores.p2++;
                } else {
                    t.innerText = "It's a Draw! 🤝";
                    t.style.color = "#fcd34d";
                }

                document.getElementById('go-desc').innerText = reason;
                document.getElementById('go-p1-score').innerText = p1W;
                document.getElementById('go-p2-score').innerText = p2W;
                
                this.saveScore();
                this.updateScoreUI();
                
                setTimeout(() => m.classList.remove('hidden'), 1000);
            }

            saveScore() {
                localStorage.setItem('dominoScores', JSON.stringify(this.scores));
            }

            updateScoreUI() {
                document.getElementById('ui-p1-score').innerText = this.scores.p1;
                document.getElementById('ui-p2-score').innerText = this.scores.p2;
            }
        }

        /* =========================================
           APP CONTROLLER
           ========================================= */
        const app = {
            game: null,
            soundEngine: new SoundEngine(),
            isDark: false,

            init() {
                // Set initial theme if localstorage has it
                if (localStorage.getItem('dominoDark') === 'true') {
                    this.toggleTheme(true);
                }
            },

            startGame() {
                document.getElementById('menu-screen').classList.add('hidden');
                document.getElementById('game-over-modal').classList.add('hidden');
                document.getElementById('game-screen').classList.remove('hidden');
                
                // Clear confetti
                const cvs = document.getElementById('confetti-canvas');
                cvs.classList.add('hidden');
                const ctx = cvs.getContext('2d');
                ctx.clearRect(0,0, cvs.width, cvs.height);

                const mode = document.getElementById('mode-select').value;
                this.game = new Game(mode, this.soundEngine);
            },

            quitToMenu() {
                this.game.active = false;
                document.getElementById('game-screen').classList.add('hidden');
                document.getElementById('game-over-modal').classList.add('hidden');
                document.getElementById('menu-screen').classList.remove('hidden');
            },

            toggleSound() {
                this.soundEngine.enabled = !this.soundEngine.enabled;
                document.getElementById('btn-sound').innerText = this.soundEngine.enabled ? "🔊" : "🔇";
            },

            toggleTheme(forceDark = null) {
                this.isDark = forceDark !== null ? forceDark : !this.isDark;
                if (this.isDark) {
                    document.body.classList.add('dark-mode');
                    document.getElementById('btn-theme').innerText = "☀️";
                } else {
                    document.body.classList.remove('dark-mode');
                    document.getElementById('btn-theme').innerText = "🌙";
                }
                localStorage.setItem('dominoDark', this.isDark);
            },

            // Simple Confetti implementation
            fireConfetti() {
                const cvs = document.getElementById('confetti-canvas');
                cvs.classList.remove('hidden');
                cvs.width = window.innerWidth;
                cvs.height = window.innerHeight;
                const ctx = cvs.getContext('2d');
                
                let particles = [];
                const colors = ['#fcd34d', '#4ade80', '#60a5fa', '#f87171', '#c084fc'];
                
                for(let i=0; i<100; i++) {
                    particles.push({
                        x: Math.random() * cvs.width,
                        y: Math.random() * cvs.height - cvs.height,
                        w: Math.random() * 10 + 5,
                        h: Math.random() * 5 + 5,
                        vy: Math.random() * 3 + 2,
                        vx: Math.random() * 2 - 1,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        rot: Math.random() * 360,
                        rotS: Math.random() * 10 - 5
                    });
                }

                function draw() {
                    if (!app.game || app.game.active) return; // Stop if game restarted
                    ctx.clearRect(0, 0, cvs.width, cvs.height);
                    let active = false;
                    
                    particles.forEach(p => {
                        p.y += p.vy;
                        p.x += p.vx;
                        p.rot += p.rotS;
                        if(p.y < cvs.height) active = true;

                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rot * Math.PI / 180);
                        ctx.fillStyle = p.color;
                        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
                        ctx.restore();
                    });

                    if(active) requestAnimationFrame(draw);
                    else cvs.classList.add('hidden');
                }
                draw();
            }
        };

        // Init
        app.init();


