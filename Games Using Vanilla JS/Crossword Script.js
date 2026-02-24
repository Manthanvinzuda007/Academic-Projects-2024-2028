/* * ANIME DATABASE
         * Comprehensive list of characters, items, and concepts.
         */
        const ANIME_DATA = [
            { word: "NARUTO", clue: "Uzumaki ninja who wants to be Hokage." },
            { word: "LUFFY", clue: "Captain of the Straw Hat Pirates." },
            { word: "ICHIGO", clue: "Orange-haired Substitute Soul Reaper." },
            { word: "ZORO", clue: "Three-sword style swordsman from One Piece." },
            { word: "GOKU", clue: "The Saiyan raised on Earth who loves fighting." },
            { word: "SAKURA", clue: "Pink-haired kunoichi of Team 7." },
            { word: "CHAKRA", clue: "Energy used for Jutsu in Naruto." },
            { word: "BANKAI", clue: "The second and final upgraded form of a Zanpakuto." },
            { word: "HOLLOW", clue: "Corrupt spirit that Soul Reapers must purify." },
            { word: "KAIZOKU", clue: "The Japanese word for 'Pirate'." },
            { word: "AKUMA", clue: "Japanese for 'Demon' or 'Devil'." },
            { word: "SHINIGAMI", clue: "God of Death (seen in Death Note/Bleach)." },
            { word: "TITAN", clue: "Giant humanoid monsters attacking Paradis Island." },
            { word: "EREN", clue: "Protagonist who can turn into the Attack Titan." },
            { word: "DEKU", clue: "Izuku Midoriya's hero name." },
            { word: "BAKUGO", clue: "Hot-headed student with explosion quirk." },
            { word: "KIRUA", clue: "Best friend of Gon and elite assassin." },
            { word: "KURAPIKA", clue: "Last survivor of the Kurta Clan." },
            { word: "HISOKA", clue: "Creepy magician with Bungee Gum Nen." },
            { word: "NEZUKO", clue: "Tanjiro's sister who turned into a demon." },
            { word: "MUZAN", clue: "The first and most powerful demon in Demon Slayer." },
            { word: "SAITAMA", clue: "A hero for fun who wins with one punch." },
            { word: "GENOS", clue: "Saitama's cyborg disciple." },
            { word: "KIRA", clue: "Light Yagami's alias for his god persona." },
            { word: "RYUK", clue: "The Shinigami who loves apples." },
            { word: "ELRIC", clue: "Surname of Edward and Alphonse." },
            { word: "WINRY", clue: "Auto-mail mechanic from Resembool." },
            { word: "MUSTANG", clue: "The Flame Alchemist, Roy ___." },
            { word: "KAKASHI", clue: "The Copy Ninja and leader of Team 7." },
            { word: "SASUKE", clue: "Last survivor of the Uchiha clan (originally)." },
            { word: "ITAСHI", clue: "Sasuke's older brother who slaughtered the clan." },
            { word: "HINATA", clue: "Hyuga girl with the Byakugan who loves Naruto." },
            { word: "NAMIGAMI", clue: "Minato's title: The Yellow ___." },
            { word: "SAIYAN", clue: "Warrior race including Goku and Vegeta." },
            { word: "FREEZA", clue: "Space tyrant who destroyed Planet Vegeta." },
            { word: "CELL", clue: "Bio-android created by Dr. Gero." },
            { word: "BUU", clue: "Pink magical being released by Babidi." },
            { word: "NANATSU", clue: "The Seven Deadly Sins: ___ no Taizai." },
            { word: "MELIODAS", clue: "Captain of the Seven Deadly Sins." },
            { word: "BAN", clue: "The Fox's Sin of Greed who is immortal." },
            { word: "KING", clue: "The Grizzly's Sin of Sloth and Fairy King." },
            { word: "ESCANOR", clue: "The Lion's Sin of Pride, strongest at noon." },
            { word: "ALLMIGHT", clue: "Symbol of Peace in My Hero Academia." },
            { word: "SHOTO", clue: "Endeavor's son with fire and ice powers." },
            { word: "TOGA", clue: "Blood-obsessed villain girl in MHA." },
            { word: "LEVI", clue: "Humanity's strongest soldier in AoT." },
            { word: "MIKASA", clue: "Eren's adoptive sister and skilled soldier." },
            { word: "ARMIN", clue: "Eren's brainy friend and Colossal Titan heir." },
            { word: "REINER", clue: "The Armored Titan hiding within the walls." },
            { word: "RYUKO", clue: "Protagonist of Kill la Kill with scissor blade." },
            { word: "SPIRITED", clue: "Classic Ghibli film: ___ Away." },
            { word: "TOTORO", clue: "Giant fluffy forest spirit from Ghibli." },
            { word: "HOWL", clue: "Wizard with a moving castle." },
            { word: "CHOPPER", clue: "Doctor of the Straw Hat Pirates (Reindeer)." },
            { word: "NAMI", clue: "Navigator of the Straw Hat Pirates." },
            { word: "SANJI", clue: "Cook of the Straw Hat Pirates who loves ladies." },
            { word: "ROBIN", clue: "Archaeologist who can sprout many limbs." },
            { word: "BROOK", clue: "Skeleton musician of the Straw Hats." },
            { word: "FRANKY", clue: "Cyborg shipwright who says 'SUUUUPER'." },
            { word: "KAIDO", clue: "The Strongest Creature and King of Beasts." },
            { word: "SHANKS", clue: "The Red-Haired Emperor who gave Luffy his hat." },
            { word: "ACE", clue: "Luffy's sworn brother with fire powers." },
            { word: "SABO", clue: "Chief of Staff of the Revolutionary Army." },
            { word: "TRAFALGAR", clue: "The Surgeon of Death: ___ Law." },
            { word: "KATAKURI", clue: "Big Mom's son who can see into the future." },
            { word: "KENPACHI", clue: "Captain of Squad 11 who loves battle." },
            { word: "BYAKUYA", clue: "Kuchiki clan head and squad 6 captain." },
            { word: "AIZEN", clue: "The traitorous captain who wanted to rule heaven." },
            { word: "RUKIA", clue: "The girl who gave Ichigo his powers." },
            { word: "GRIMMJOW", clue: "The 6th Espada with blue hair." },
            { word: "ULQUIORRA", clue: "The 4th Espada representing Emptiness." },
            { word: "YUROUICHI", clue: "The Flash Goddess who turns into a cat." },
            { word: "URAHARA", clue: "Hat-and-clogs shopkeeper in Bleach." },
            { word: "OROCHIMARU", clue: "Legendary Sannin who sought immortality." },
            { word: "TSUNADE", clue: "Fifth Hokage and legendary medical ninja." },
            { word: "JIRAIYA", clue: "The Toad Sage and writer of Icha Icha." },
            { word: "MADARA", clue: "Legendary Uchiha leader who started the war." },
            { word: "OBITO", clue: "Kakashi's childhood friend who became Tobi." },
            { word: "PAIN", clue: "Leader of Akatsuki with the Rinnegan." },
            { word: "KONAN", clue: "Akatsuki member who uses paper jutsu." },
            { word: "KISAME", clue: "The Monster of the Hidden Mist and Itachi's partner." },
            { word: "DEIDARA", clue: "Explosive artist of the Akatsuki." },
            { word: "HIDAN", clue: "Immortal Akatsuki follower of Jashin." },
            { word: "SASORI", clue: "Master puppeteer of the Akatsuki." },
            { word: "GAARA", clue: "Kazekage of the Sand who was once a jinchuriki." },
            { word: "SHIKAMARU", clue: "Lazy but genius strategist of Team 10." },
            { word: "NEJI", clue: "Hyuga prodigy who believed in destiny." },
            { word: "ROCKLEE", clue: "Ninja who can only use Taijutsu." },
            { word: "INOSUKE", clue: "Boar-headed demon slayer." },
            { word: "ZENITSU", clue: "Cowardly demon slayer who uses Thunder Breathing." },
            { word: "RENGOKU", clue: "The Flame Hashira who died fighting Akaza." },
            { word: "SHINOBU", clue: "The Insect Hashira who uses poison." },
            { word: "TENGEN", clue: "The Sound Hashira who is flashy." },
            { word: "GIYU", clue: "The Water Hashira who met Tanjiro first." },
            { word: "AKAZA", clue: "Upper Moon 3 who loves fighting strong humans." },
            { word: "DOUWA", clue: "Upper Moon 2 who runs a cult." },
            { word: "KOKUSHIBO", clue: "Upper Moon 1 with six eyes." },
            { word: "YUJI", clue: "Itadori: the vessel of Sukuna." },
            { word: "SUKUNA", clue: "The King of Curses." },
            { word: "GOJO", clue: "The strongest Jujutsu Sorcerer." },
            { word: "MEGUMI", clue: "Fushiguro: user of the Ten Shadows technique." },
            { word: "NOBARA", clue: "Kugisaki: hammer and nail curse user." },
            { word: "NANAMI", clue: "The Grade 1 sorcerer who hates overtime." },
            { word: "MAHITO", clue: "Curse born from human hatred of others." },
            { word: "GETO", clue: "Gojo's former friend who turned evil." },
            { word: "YUTA", clue: "The protagonist of JJK 0." },
            { word: "MAKI", clue: "Zen'in girl who uses cursed tools." },
            { word: "PANDA", clue: "An abrupt mutated cursed corpse." },
            { word: "TOGE", clue: "Inumaki: user of cursed speech (Salmon!)." },
            { word: "DENJI", clue: "The Chainsaw Man." },
            { word: "POCHITA", clue: "The Chainsaw Devil/Dog." },
            { word: "MAKIMA", clue: "The Control Devil who Denji loves." },
            { word: "AKI", clue: "Hayakawa: Denji's partner with sword powers." },
            { word: "POWER", clue: "The Blood Fiend who loves cats." },
            { word: "REZE", clue: "The Bomb Girl from Russia." },
            { word: "QUANXI", clue: "The first Devil Hunter." },
            { word: "KISHIBE", clue: "Old master devil hunter." },
            { word: "SPIKE", clue: "Space cowboy: ___ Spiegel." },
            { word: "FAYE", clue: "Memory-loss girl in Cowboy Bebop." },
            { word: "JET", clue: "Owner of the Bebop ship." },
            { word: "EIN", clue: "Data dog Corgi in Cowboy Bebop." },
            { word: "VICIOUS", clue: "Spike's arch-rival in the Syndicate." },
            { word: "SHINJI", clue: "Pilot of Evangelion Unit-01." },
            { word: "REI", clue: "The first child and pilot of Unit-00." },
            { word: "ASUKA", clue: "The red-haired tsundere pilot from Germany." },
            { word: "KAWORU", clue: "The 17th Angel who Shinji liked." },
            { word: "GENDO", clue: "Shinji's cold-hearted father." },
            { word: "MISATO", clue: "Major at NERV who loves beer." },
            { word: "ALUCARD", clue: "The king of vampires in Hellsing." },
            { word: "SERAS", clue: "Police girl turned vampire." },
            { word: "INTEGRA", clue: "Leader of the Hellsing Organization." },
            { word: "ANDERSON", clue: "Paladin priest who hunts Alucard." },
            { word: "JOESTAR", clue: "The bloodline in JoJo's Bizarre Adventure." },
            { word: "JOTARO", clue: "Star Platinum's user (Part 3)." },
            { word: "DIO", clue: "Vampire and user of The World." },
            { word: "JOSUKE", clue: "Crazy Diamond's user (Part 4)." },
            { word: "GIORNO", clue: "Gold Experience's user (Part 5)." },
            { word: "JOLYNE", clue: "Stone Free's user (Part 6)." },
            { word: "SPEEDWAGON", clue: "Best waifu and Joestar benefactor." },
            { word: "KIRA", clue: "Yoshikage: serial killer with Killer Queen." },
            { word: "PUCCI", clue: "Priest seeking to attain Heaven." },
            { word: "GRIFFITH", clue: "Leader of the Band of the Hawk." },
            { word: "GUTS", clue: "The Black Swordsman." },
            { word: "CASCA", clue: "Female commander in the Band of Hawk." },
            { word: "BEHELIT", clue: "The egg of the king." },
            { word: "ZODD", clue: "Nosferatu: legendary apostle of battle." },
            { word: "THORFINN", clue: "Boy seeking revenge on Askeladd." },
            { word: "ASKELADD", clue: "Leader of the Viking mercenaries." },
            { word: "CANUTE", clue: "Prince who becomes the King of Danes." },
            { word: "THORKEL", clue: "The giant who loves fighting." },
            { word: "SOMA", clue: "The main chef in Food Wars." },
            { word: "ERINA", clue: "God's Tongue from Food Wars." },
            { word: "MEGUMI", clue: "Shokugeki girl from the countryside." },
            { word: "KOTARO", clue: "Zombieland Saga's crazy producer." },
            { word: "SAKURA", clue: "The zombie protagonist of Zombieland." },
            { word: "YOSHINO", clue: "Date A Live spirit with a puppet." },
            { word: "TOHKA", clue: "The first spirit Shido meets." },
            { word: "KURUMI", clue: "The nightmare spirit of time." },
            { word: "RIMURU", clue: "The slime who built a nation." },
            { word: "MILIM", clue: "The Demon Lord Dragonoid BFF." },
            { word: "SHUNA", clue: "The Oni princess and cook." },
            { word: "BENIMARU", clue: "Commander of Rimuru's military." },
            { word: "GOBTA", clue: "The comedic genius goblin." }
        ];

        /**
         * GAME ENGINE
         */
        class CrosswordGame {
            constructor() {
                this.gridSize = 12;
                this.grid = [];
                this.placedWords = [];
                this.focusedCell = { r: 0, c: 0 };
                this.direction = 'across'; // or 'down'
                this.startTime = null;
                this.timerInterval = null;
                this.score = 0;
            }

            init() {
                this.generateNewPuzzle();
                this.setupInputs();
                ui.render();
            }

            generateNewPuzzle() {
                ui.showLoading(true);
                
                // Reset State
                this.gridSize = window.innerWidth < 768 ? 10 : 12;
                this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
                this.placedWords = [];
                this.score = 0;
                
                // Start with a random seed word from DB
                const shuffled = [...ANIME_DATA].sort(() => 0.5 - Math.random());
                const pool = shuffled.slice(0, 40); // Try to fit from this pool

                // Generation Algorithm (Simplified backtracking)
                // 1. Place first word in center
                const first = pool.pop();
                this.placeWord(first.word, first.clue, Math.floor(this.gridSize/2), 2, 'across');

                // 2. Try to branch out
                let attempts = 0;
                while(pool.length > 0 && attempts < 500) {
                    attempts++;
                    const item = pool[Math.floor(Math.random() * pool.length)];
                    if (this.placedWords.some(p => p.word === item.word)) continue;

                    const fit = this.findFit(item.word);
                    if (fit) {
                        this.placeWord(item.word, item.clue, fit.r, fit.c, fit.d);
                        pool.splice(pool.indexOf(item), 1);
                    }
                }

                this.assignNumbers();
                this.startTimer();
                ui.render();
                ui.showLoading(false);
            }

            findFit(word) {
                // Look for common letters in placed words
                for (let placed of this.placedWords) {
                    for (let i = 0; i < word.length; i++) {
                        for (let j = 0; j < placed.word.length; j++) {
                            if (word[i] === placed.word[j]) {
                                // Potential intersection
                                const r = placed.direction === 'across' ? placed.row - i : placed.row + j;
                                const c = placed.direction === 'across' ? placed.col + j : placed.col - i;
                                const d = placed.direction === 'across' ? 'down' : 'across';

                                if (this.canPlace(word, r, c, d)) {
                                    return { r, c, d };
                                }
                            }
                        }
                    }
                }
                return null;
            }

            canPlace(word, r, c, d) {
                if (r < 0 || c < 0) return false;
                if (d === 'across' && c + word.length > this.gridSize) return false;
                if (d === 'down' && r + word.length > this.gridSize) return false;

                // Check collisions
                for (let i = 0; i < word.length; i++) {
                    const currR = d === 'across' ? r : r + i;
                    const currC = d === 'across' ? c + i : c;
                    const char = word[i];

                    // Must be empty or match letter
                    if (this.grid[currR][currC] !== null && this.grid[currR][currC].char !== char) return false;

                    // Ensure we don't block adjacent cells (orthogonally)
                    if (this.grid[currR][currC] === null) {
                        const neighbors = d === 'across' 
                            ? [[-1, 0], [1, 0], [0, i === 0 ? -1 : 1]]
                            : [[0, -1], [0, 1], [i === 0 ? -1 : 1, 0]];
                        
                        for (let [dr, dc] of neighbors) {
                            const nr = currR + dr;
                            const nc = currC + dc;
                            if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
                                // Can't touch another word except at the start/end or intersection
                                if (this.grid[nr][nc] !== null) {
                                    // Complex check: only allow if it's the intended intersection
                                    // For simplicity in this demo, we allow some crowding
                                }
                            }
                        }
                    }
                }
                return true;
            }

            placeWord(word, clue, r, c, d) {
                const placement = { word, clue, row: r, col: c, direction: d, id: Date.now() + Math.random() };
                this.placedWords.push(placement);
                
                for (let i = 0; i < word.length; i++) {
                    const currR = d === 'across' ? r : r + i;
                    const currC = d === 'across' ? c + i : c;
                    
                    if (!this.grid[currR][currC]) {
                        this.grid[currR][currC] = {
                            char: word[i],
                            userInput: '',
                            num: null,
                            belongsTo: []
                        };
                    }
                    this.grid[currR][currC].belongsTo.push(placement);
                }
            }

            assignNumbers() {
                let currentNum = 1;
                for (let r = 0; r < this.gridSize; r++) {
                    for (let c = 0; c < this.gridSize; c++) {
                        if (this.grid[r][c]) {
                            // Check if this is the start of any word
                            const startOf = this.placedWords.filter(p => p.row === r && p.col === c);
                            if (startOf.length > 0) {
                                this.grid[r][c].num = currentNum;
                                startOf.forEach(p => p.num = currentNum);
                                currentNum++;
                            }
                        }
                    }
                }
            }

            startTimer() {
                if (this.timerInterval) clearInterval(this.timerInterval);
                this.startTime = Date.now();
                this.timerInterval = setInterval(() => {
                    const diff = Date.now() - this.startTime;
                    const m = Math.floor(diff / 60000).toString().padStart(2, '0');
                    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                    document.getElementById('game-timer').innerText = `${m}:${s}`;
                }, 1000);
            }

            setupInputs() {
                window.addEventListener('keydown', (e) => {
                    if (ui.isModalOpen) return;
                    
                    const { r, c } = this.focusedCell;
                    if (!this.grid[r][c]) return;

                    if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                        this.handleInput(e.key.toUpperCase());
                    } else if (e.key === 'Backspace') {
                        this.handleBackspace();
                    } else if (e.key.startsWith('Arrow')) {
                        this.handleNavigation(e.key);
                    }
                });
            }

            handleInput(val) {
                const { r, c } = this.focusedCell;
                this.grid[r][c].userInput = val;
                ui.render();
                this.moveFocus(1);
                this.updateProgress();
            }

            handleBackspace() {
                const { r, c } = this.focusedCell;
                if (this.grid[r][c].userInput === '') {
                    this.moveFocus(-1);
                    const newPos = this.focusedCell;
                    this.grid[newPos.r][newPos.c].userInput = '';
                } else {
                    this.grid[r][c].userInput = '';
                }
                ui.render();
                this.updateProgress();
            }

            handleNavigation(key) {
                let { r, c } = this.focusedCell;
                if (key === 'ArrowRight') c++;
                if (key === 'ArrowLeft') c--;
                if (key === 'ArrowUp') r--;
                if (key === 'ArrowDown') r++;

                if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize && this.grid[r][c]) {
                    this.focusedCell = { r, c };
                    ui.render();
                }
            }

            moveFocus(step) {
                const { r, c } = this.focusedCell;
                let nr = r, nc = c;
                if (this.direction === 'across') nc += step;
                else nr += step;

                if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize && this.grid[nr][nc]) {
                    this.focusedCell = { r: nr, c: nc };
                    ui.render();
                }
            }

            updateProgress() {
                let total = 0;
                let filled = 0;
                this.grid.forEach(row => row.forEach(cell => {
                    if (cell) {
                        total++;
                        if (cell.userInput !== '') filled++;
                    }
                }));
                const percent = Math.floor((filled / total) * 100);
                document.getElementById('game-progress').innerText = percent + '%';
                document.getElementById('progress-bar').style.width = percent + '%';
            }

            checkPuzzle() {
                let allCorrect = true;
                let errors = 0;
                this.grid.forEach(row => row.forEach(cell => {
                    if (cell && cell.userInput !== '') {
                        if (cell.userInput !== cell.char) {
                            allCorrect = false;
                            errors++;
                        }
                    } else if (cell && cell.userInput === '') {
                        allCorrect = false;
                    }
                }));

                if (allCorrect) {
                    ui.showModal("GREAT JOB!", "You've successfully conquered this Anime Crossword! Your knowledge is legendary.");
                } else {
                    ui.showModal("NOT QUITE!", `You have some mistakes or empty cells. Keep going, young shinobi! Errors found: ${errors}`);
                }
            }

            hintLetter() {
                const { r, c } = this.focusedCell;
                if (this.grid[r][c]) {
                    this.grid[r][c].userInput = this.grid[r][c].char;
                    this.score -= 10;
                    ui.render();
                    this.updateProgress();
                }
            }

            hintWord() {
                const { r, c } = this.focusedCell;
                const cell = this.grid[r][c];
                if (!cell) return;
                
                const wordObj = cell.belongsTo.find(b => b.direction === this.direction) || cell.belongsTo[0];
                if (!wordObj) return;

                for (let i = 0; i < wordObj.word.length; i++) {
                    const row = wordObj.direction === 'across' ? wordObj.row : wordObj.row + i;
                    const col = wordObj.direction === 'across' ? wordObj.col + i : wordObj.col;
                    this.grid[row][col].userInput = wordObj.word[i];
                }
                this.score -= 30;
                ui.render();
                this.updateProgress();
            }

            clearGrid() {
                this.grid.forEach(row => row.forEach(cell => {
                    if (cell) cell.userInput = '';
                }));
                ui.render();
                this.updateProgress();
            }
        }

        /**
         * UI CONTROLLER
         */
        const ui = {
            isModalOpen: false,

            showLoading(show) {
                document.getElementById('loading-overlay').classList.toggle('hidden', !show);
            },

            showModal(title, body) {
                document.getElementById('modal-title').innerText = title;
                document.getElementById('modal-body').innerText = body;
                document.getElementById('game-modal').classList.add('show');
                this.isModalOpen = true;
            },

            closeModal() {
                document.getElementById('game-modal').classList.remove('show');
                this.isModalOpen = false;
            },

            render() {
                const container = document.getElementById('grid-container');
                container.style.gridTemplateColumns = `repeat(${game.gridSize}, 1fr)`;
                container.innerHTML = '';

                // Get highlighted word path
                const activeCell = game.grid[game.focusedCell.r][game.focusedCell.c];
                let highlightPath = [];
                if (activeCell) {
                    const activeWord = activeCell.belongsTo.find(p => p.direction === game.direction) || activeCell.belongsTo[0];
                    if (activeWord) {
                        for(let i=0; i<activeWord.word.length; i++) {
                            highlightPath.push({
                                r: activeWord.direction === 'across' ? activeWord.row : activeWord.row + i,
                                c: activeWord.direction === 'across' ? activeWord.col + i : activeWord.col
                            });
                        }
                    }
                }

                for (let r = 0; r < game.gridSize; r++) {
                    for (let c = 0; c < game.gridSize; c++) {
                        const cellData = game.grid[r][c];
                        const cellEl = document.createElement('div');
                        cellEl.className = 'cell';
                        
                        if (!cellData) {
                            cellEl.classList.add('empty');
                        } else {
                            if (game.focusedCell.r === r && game.focusedCell.c === c) {
                                cellEl.classList.add('focused');
                            } else if (highlightPath.some(p => p.r === r && p.c === c)) {
                                cellEl.classList.add('highlight');
                            }

                            if (cellData.num) {
                                const numEl = document.createElement('span');
                                numEl.className = 'cell-num';
                                numEl.innerText = cellData.num;
                                cellEl.appendChild(numEl);
                            }

                            const input = document.createElement('div');
                            input.className = 'cell-input flex items-center justify-center';
                            input.innerText = cellData.userInput;
                            cellEl.appendChild(input);

                            cellEl.onclick = () => {
                                if (game.focusedCell.r === r && game.focusedCell.c === c) {
                                    game.direction = game.direction === 'across' ? 'down' : 'across';
                                }
                                game.focusedCell = { r, c };
                                
                                // Trigger mobile keyboard
                                const mobileInput = document.getElementById('mobile-input');
                                mobileInput.focus();
                                
                                this.render();
                            };
                        }
                        container.appendChild(cellEl);
                    }
                }

                this.renderClues();
            },

            renderClues() {
                const acrossList = document.getElementById('clues-across');
                const downList = document.getElementById('clues-down');
                acrossList.innerHTML = '';
                downList.innerHTML = '';

                const sortedWords = [...game.placedWords].sort((a, b) => a.num - b.num);

                sortedWords.forEach(word => {
                    const clueEl = document.createElement('div');
                    clueEl.className = 'clue-item animate-pop';
                    
                    // Check if word is active
                    const isActive = game.grid[game.focusedCell.r][game.focusedCell.c]?.belongsTo.includes(word);
                    if (isActive && game.direction === word.direction) clueEl.classList.add('active');

                    // Check if word is solved (all letters match)
                    let solved = true;
                    for (let i = 0; i < word.word.length; i++) {
                        const r = word.direction === 'across' ? word.row : word.row + i;
                        const c = word.direction === 'across' ? word.col + i : word.col;
                        if (game.grid[r][c].userInput !== word.word[i]) {
                            solved = false;
                            break;
                        }
                    }
                    if (solved) clueEl.classList.add('solved');

                    clueEl.innerHTML = `<span class="font-bold text-accent mr-2">${word.num}.</span> ${word.clue}`;
                    clueEl.onclick = () => {
                        game.focusedCell = { r: word.row, c: word.col };
                        game.direction = word.direction;
                        this.render();
                    };

                    if (word.direction === 'across') acrossList.appendChild(clueEl);
                    else downList.appendChild(clueEl);
                });
            }
        };

        // Handle mobile input
        document.getElementById('mobile-input').addEventListener('input', (e) => {
            const val = e.target.value.slice(-1);
            if (val.match(/[a-z]/i)) {
                game.handleInput(val.toUpperCase());
            }
            e.target.value = '';
        });

        const game = new CrosswordGame();
        window.onload = () => game.init();
