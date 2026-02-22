
        /**
         * CORE UTILITIES: Deterministic Randomness & PRNG
         */
        class GeneratorUtils {
            static getSeededRandom(seed) {
                let h = 2166136261 >>> 0;
                for (let i = 0; i < seed.length; i++) {
                    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
                }
                return () => {
                    h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
                    return (h >>> 0) / 4294967296;
                };
            }
        }

        /**
         * CORE ENGINE: 3D NOISE SYSTEM
         * Specialized 3D FBM Noise for procedural generation
         */
        class NoiseEngine {
            constructor(random) {
                this.p = new Uint8Array(512);
                const values = Array.from({length: 256}, (_, i) => i);
                for(let i = 255; i > 0; i--) {
                    const r = Math.floor(random() * (i + 1));
                    [values[i], values[r]] = [values[r], values[i]];
                }
                for(let i = 0; i < 512; i++) this.p[i] = values[i % 256];
            }

            fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
            lerp(t, a, b) { return a + t * (b - a); }
            grad(hash, x, y, z) {
                const h = hash & 15;
                const u = h < 8 ? x : y;
                const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
                return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
            }

            sample(x, y, z) {
                const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
                x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
                const u = this.fade(x), v = this.fade(y), w = this.fade(z);
                const A = this.p[X]+Y, AA = this.p[A]+Z, AB = this.p[A+1]+Z;
                const B = this.p[X+1]+Y, BA = this.p[B]+Z, BB = this.p[B+1]+Z;
                return this.lerp(w, 
                    this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x-1, y, z)),
                               this.lerp(u, this.grad(this.p[AB], x, y-1, z), this.grad(this.p[BB], x-1, y-1, z))),
                    this.lerp(v, this.lerp(u, this.grad(this.p[AA+1], x, y, z-1), this.grad(this.p[BA+1], x-1, y, z-1)),
                               this.lerp(u, this.grad(this.p[AB+1], x, y-1, z-1), this.grad(this.p[BB+1], x-1, y-1, z-1))));
            }

            fbm(x, y, z, octaves = 6) {
                let total = 0, freq = 1, amp = 1, maxAmp = 0;
                for(let i=0; i<octaves; i++) {
                    total += this.sample(x * freq, y * freq, z * freq) * amp;
                    maxAmp += amp;
                    amp *= 0.5;
                    freq *= 2.1;
                }
                return (total / maxAmp + 1) / 2;
            }
        }

        /**
         * PLANETARY ARCHITECT
         * Handles the Three.js scene, geometry deformation, and river logic
         */
        class PlanetArchitect {
            constructor() {
                this.setupThree();
                this.isRotating = true;
                this.mouse = { down: false, x: 0, y: 0 };
                this.addInteractions();
                window.addEventListener('resize', () => this.onResize());
            }

            setupThree() {
                this.wrap = document.getElementById('canvas-wrap');
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.wrap.appendChild(this.renderer.domElement);

                this.camera.position.z = 6;
                
                // Studio Lighting
                this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
                const sun = new THREE.DirectionalLight(0xffffff, 1.2);
                sun.position.set(5, 5, 8);
                this.scene.add(sun);

                // Deep Space Field
                const starGeo = new THREE.BufferGeometry();
                const starPos = [];
                for(let i=0; i<5000; i++) {
                    starPos.push((Math.random()-0.5)*200, (Math.random()-0.5)*200, (Math.random()-0.5)*200);
                }
                starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
                this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x888888, size: 0.05 })));
            }

            addInteractions() {
                this.wrap.addEventListener('mousedown', (e) => {
                    this.mouse.down = true;
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                });
                window.addEventListener('mouseup', () => this.mouse.down = false);
                window.addEventListener('mousemove', (e) => {
                    if(!this.mouse.down || !this.body) return;
                    const dx = e.clientX - this.mouse.x;
                    const dy = e.clientY - this.mouse.y;
                    this.body.rotation.y += dx * 0.005;
                    this.body.rotation.x += dy * 0.005;
                    this.mouse.x = e.clientX;
                    this.mouse.y = e.clientY;
                });
                this.wrap.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    this.camera.position.z = Math.min(12, Math.max(2.5, this.camera.position.z + e.deltaY * 0.005));
                }, { passive: false });
            }

            async construct(config) {
                if(this.body) this.scene.remove(this.body);
                if(this.atmo) this.scene.remove(this.atmo);

                const prng = GeneratorUtils.getSeededRandom(config.seed);
                const noise = new NoiseEngine(prng);
                const mNoise = new NoiseEngine(prng);

                const geo = new THREE.IcosahedronGeometry(config.radius, config.detail);
                const pos = geo.attributes.position;
                const colors = new Float32Array(pos.count * 3);
                
                const surfaceData = { heights: [], moistures: [], riverSet: new Set() };
                let landTotal = 0;

                // 1. Terrain Pass (Height + Moisture)
                for(let i=0; i < pos.count; i++) {
                    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                    let h = noise.fbm(x * config.rough, y * config.rough, z * config.rough, 8);
                    
                    // Polar Influence
                    const lat = Math.abs(y / config.radius);
                    if (lat > 0.85) h += (lat - 0.85) * 0.6; // Cold mountain logic

                    let m = mNoise.fbm(x * 0.8, y * 0.8, z * 0.8, 5);
                    
                    surfaceData.heights[i] = h;
                    surfaceData.moistures[i] = m;
                    if(h > config.sea) landTotal++;
                }

                // 2. Hydrological Flow (Gradient Descent)
                if(config.rivers > 0) {
                    for(let r=0; r < config.rivers; r++) {
                        let current = Math.floor(prng() * pos.count);
                        if(surfaceData.heights[current] < config.sea + 0.1) continue;

                        for(let step=0; step < 80; step++) {
                            surfaceData.riverSet.add(current);
                            let bestNeighbor = current;
                            let minElev = surfaceData.heights[current];

                            // Stochastic neighbor search
                            for(let n=0; n<12; n++) {
                                let neighbor = (current + Math.floor(prng() * 150)) % pos.count;
                                if(surfaceData.heights[neighbor] < minElev) {
                                    minElev = surfaceData.heights[neighbor];
                                    bestNeighbor = neighbor;
                                }
                            }

                            if(bestNeighbor === current || surfaceData.heights[bestNeighbor] < config.sea) break;
                            current = bestNeighbor;
                        }
                    }
                }

                // 3. Meshing & Coloring
                for(let i=0; i < pos.count; i++) {
                    const h = surfaceData.heights[i], m = surfaceData.moistures[i];
                    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                    const lat = Math.abs(y / config.radius);

                    // Deform vertices
                    const isLand = h > config.sea;
                    const displacement = isLand ? (h - config.sea) * 0.5 * config.peaks : 0;
                    const normal = new THREE.Vector3(x, y, z).normalize();
                    pos.setXYZ(i, x + normal.x * displacement, y + normal.y * displacement, z + normal.z * displacement);

                    // Biome Coloring Logic
                    const color = new THREE.Color();
                    if(!isLand) {
                        color.set(h < config.sea - 0.15 ? '#020617' : '#0ea5e9'); // Depth shading
                    } else if (surfaceData.riverSet.has(i)) {
                        color.set('#38bdf8'); // Active rivers
                    } else if (lat > 0.88 || (h > 0.88 && lat > 0.5)) {
                        color.set('#f1f5f9'); // Glacial
                    } else if (h > 0.82) {
                        color.set('#475569'); // Peaks
                    } else if (h < config.sea + 0.03) {
                        color.set('#fde047'); // Coast
                    } else {
                        // Whittaker-inspired Climate matrix
                        const temp = 1.2 - (h * 0.3 + lat * 0.75);
                        if (temp > 0.8) {
                            color.set(m > 0.65 ? '#064e3b' : m > 0.35 ? '#166534' : '#d97706'); 
                        } else if (temp > 0.45) {
                            color.set(m > 0.5 ? '#15803d' : '#84cc16');
                        } else {
                            color.set(m > 0.4 ? '#365314' : '#94a3b8');
                        }
                    }

                    colors[i*3] = color.r;
                    colors[i*3+1] = color.g;
                    colors[i*3+2] = color.b;
                }

                geo.computeVertexNormals();
                geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                
                this.body = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ 
                    vertexColors: true, 
                    shininess: 12,
                    flatShading: config.detail < 70
                }));
                this.scene.add(this.body);

                // Atmosphere
                const atmoGeo = new THREE.SphereGeometry(config.radius * 1.05, 64, 64);
                this.atmo = new THREE.Mesh(atmoGeo, new THREE.MeshPhongMaterial({
                    color: 0x22d3ee,
                    transparent: true,
                    opacity: 0.08,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending
                }));
                this.scene.add(this.atmo);

                // Update Stats
                document.getElementById('stat-rivers').textContent = surfaceData.riverSet.size.toLocaleString();
                document.getElementById('stat-ratio').textContent = `${Math.floor((landTotal / pos.count) * 100)}%`;
                const indices = ['Borealis', 'Zion', 'Helios', 'Terra', 'Delta'];
                document.getElementById('stat-hab').textContent = indices[Math.floor(prng() * indices.length)];
            }

            onResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            animate() {
                requestAnimationFrame(() => this.animate());
                if(this.isRotating && this.body && !this.mouse.down) {
                    this.body.rotation.y += 0.0012;
                }
                this.renderer.render(this.scene, this.camera);
            }
        }

        /**
         * APPLICATION CONTROLLER
         */
        const AstroApp = {
            init() {
                this.engine = new PlanetArchitect();
                this.setupUI();
                this.generate();
                this.engine.animate();

                setTimeout(() => {
                    const loader = document.getElementById('loader');
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 1000);
                }, 1800);
            },

            setupUI() {
                const els = {
                    seed: 'seed-input', detail: 'detail-slider', sea: 'sea-slider', 
                    rough: 'rough-slider', river: 'river-slider', peaks: 'peak-slider',
                    radius: 'size-slider', btn: 'generate-btn', rand: 'random-seed', 
                    pause: 'play-pause', theme: 'theme-toggle', export: 'export-png'
                };
                this.ui = {};
                for(let k in els) this.ui[k] = document.getElementById(els[k]);

                this.ui.btn.onclick = () => this.generate();
                this.ui.rand.onclick = () => {
                    this.ui.seed.value = "CORE-" + Math.floor(Math.random()*9999).toString(16).toUpperCase();
                    this.generate();
                };

                this.ui.pause.onclick = () => {
                    this.engine.isRotating = !this.engine.isRotating;
                    this.ui.pause.textContent = this.engine.isRotating ? "Pause Spin" : "Resume Spin";
                };

                this.ui.theme.onclick = () => {
                    const current = document.body.getAttribute('data-theme');
                    document.body.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
                };

                this.ui.export.onclick = () => {
                    const link = document.createElement('a');
                    link.download = `AstroGen_${this.ui.seed.value}.png`;
                    link.href = this.engine.renderer.domElement.toDataURL("image/png");
                    link.click();
                };

                // Labels Sync
                ['detail', 'sea', 'rough', 'river', 'peaks', 'radius'].forEach(key => {
                    this.ui[key].oninput = (e) => {
                        document.getElementById(key + '-val').textContent = e.target.value;
                    };
                });
            },

            generate() {
                this.engine.construct({
                    seed: this.ui.seed.value,
                    radius: parseFloat(this.ui.radius.value),
                    detail: parseInt(this.ui.detail.value),
                    sea: parseFloat(this.ui.sea.value),
                    rough: parseFloat(this.ui.rough.value),
                    rivers: parseInt(this.ui.river.value),
                    peaks: parseFloat(this.ui.peaks.value)
                });
            }
        };

        window.onload = () => AstroApp.init();
    