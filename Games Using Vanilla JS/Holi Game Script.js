// Manthan Vinzuda  //
//<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

// ═══════════════════════════════════════════════════
//  HOLI COLOR BATTLE GAME – Vanilla JS + Three.js
//  Auto-Shooter / Vampire Survivors Style 
// ═══════════════════════════════════════════════════

const COLORS = {
  pink:   0xFF2E63,
  yellow: 0xFFD93D,
  cyan:   0x00EAD3,
  orange: 0xFF6B35,
  purple: 0x845EC2,
  green:  0x00C897,
  blue:   0x4FC3F7,
  red:    0xFF4757,
  white:  0xFFFFFF,
};

const CSS_COLORS = ['#FF2E63','#FFD93D','#00EAD3','#FF6B35','#845EC2','#00C897','#4FC3F7'];

const WEAPONS = [
  { name:'Pink Gulal', color: COLORS.pink,   cssColor:'#FF2E63', ammo:20, dmg:10, speed:18, splash:1.2, type:'gulal', fireRate: 15 },
  { name:'Yellow Cannon', color: COLORS.yellow, cssColor:'#FFD93D', ammo:10, dmg:20, speed:14, splash:2.0, type:'cannon', fireRate: 30 },
  { name:'Rainbow Spray', color: COLORS.cyan, cssColor:'#00EAD3', ammo:30, dmg:8,  speed:22, splash:0.8, type:'spray', fireRate: 8 },
  { name:'Water Bomb',    color: COLORS.blue,  cssColor:'#4FC3F7', ammo:5,  dmg:35, speed:10, splash:3.0, type:'balloon', fireRate: 45 },
];

// ─── Game State ──────────────────────────────────────
let state = {
  mode: 'vs-ai',
  difficulty: 'easy',
  score: 0,
  hits: 0,
  shots: 0,
  combo: 1,
  comboTimer: 0,
  timeLeft: 180,
  running: false,
  currentWeapon: 0,
  ammo: [...WEAPONS.map(w => w.ammo)],
  reloading: false,
  dashtimer: 0,
  playerShootTimer: 0,
  colorBlastTimer: 0
};

// ─── Three.js Setup ──────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x87CEEB);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xE8D5B7, 0.025);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);

// ─── Lighting ────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xfff0e0, 0.8);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xFFE0A0, 1.2);
sunLight.position.set(20, 30, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -40;
sunLight.shadow.camera.right = 40;
sunLight.shadow.camera.top = 40;
sunLight.shadow.camera.bottom = -40;
scene.add(sunLight);

// Festival colored point lights
const festLights = [
  { color: 0xFF2E63, pos: [-15, 5, -10] },
  { color: 0xFFD93D, pos: [15, 5, -10] },
  { color: 0x00EAD3, pos: [0, 5, -20] },
];
festLights.forEach(l => {
  const light = new THREE.PointLight(l.color, 0.5, 30);
  light.position.set(...l.pos);
  scene.add(light);
});

// ─── Ground ──────────────────────────────────────────
const groundGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
const groundMat = new THREE.MeshLambertMaterial({ color: 0xF5E6C8 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Rangoli pattern on ground
function createRangoli(x, z, scale = 1) {
  const cols = [0xFF2E63, 0xFFD93D, 0x00EAD3, 0xFF6B35, 0x845EC2];
  for (let r = 0; r < 5; r++) {
    const ringGeo = new THREE.RingGeometry((r * 0.5 + 0.2) * scale, (r * 0.5 + 0.45) * scale, 8 + r * 4);
    const ringMat = new THREE.MeshLambertMaterial({ color: cols[r % cols.length], side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.01, z);
    scene.add(ring);
  }
}
createRangoli(0, -5, 2);
createRangoli(-20, 10, 1.2);
createRangoli(20, 10, 1.2);
createRangoli(-10, -18, 0.8);
createRangoli(10, -18, 0.8);

// ─── Village Houses ──────────────────────────────────
function createHouse(x, z, colorHex = 0xFFB74D) {
  const group = new THREE.Group();

  // Wall
  const wallGeo = new THREE.BoxGeometry(6, 4, 4);
  const wallMat = new THREE.MeshLambertMaterial({ color: colorHex });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.y = 2;
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  // Roof
  const roofGeo = new THREE.ConeGeometry(4.5, 2, 4);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0xC62828 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 5;
  roof.castShadow = true;
  group.add(roof);

  // Door
  const doorGeo = new THREE.BoxGeometry(1, 2, 0.1);
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 1, 2.05);
  group.add(door);

  // Flags
  for (let i = 0; i < 5; i++) {
    const flagGeo = new THREE.BoxGeometry(0.5, 0.35, 0.05);
    const flagMat = new THREE.MeshLambertMaterial({ color: CSS_COLORS[i % CSS_COLORS.length].replace('#','0x')|0 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(-2 + i, 6.2, 0);
    group.add(flag);
    const strGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.5);
    const str = new THREE.Mesh(strGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    str.position.set(-2 + i, 6.5, 0);
    group.add(str);
  }

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

const houseColors = [0xFFB74D, 0xEF9A9A, 0xA5D6A7, 0x90CAF9, 0xCE93D8, 0xFFCC80];
createHouse(-22, -8, houseColors[0]);
createHouse(-22, 4, houseColors[1]);
createHouse(22, -8, houseColors[2]);
createHouse(22, 4, houseColors[3]);
createHouse(-22, 16, houseColors[4]);
createHouse(22, 16, houseColors[5]);

// ─── Player Character ────────────────────────────────
const playerGroup = new THREE.Group();

function buildCharacter(group, skinColor, shirtColor) {
  // Body
  const bodyGeo = new THREE.BoxGeometry(0.8, 1.0, 0.5);
  const bodyMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.0;
  body.castShadow = true;
  group.add(body);
  // Head
  const headGeo = new THREE.SphereGeometry(0.35, 12, 10);
  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.85;
  head.castShadow = true;
  group.add(head);
  // Eyes
  [-0.12, 0.12].forEach(ex => {
    const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(ex, 1.9, 0.3);
    group.add(eye);
  });
  // Legs
  [-0.2, 0.2].forEach(lx => {
    const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1565C0 });
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, 0.4, 0);
    leg.castShadow = true;
    group.add(leg);
  });
  // Arms
  [-0.55, 0.55].forEach((ax, i) => {
    const armGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
    const armMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(ax, 1.05, 0);
    arm.castShadow = true;
    group.add(arm);
    if (i === 1) { // Pichkari (right arm)
      const gunGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 8);
      const gunMat = new THREE.MeshLambertMaterial({ color: WEAPONS[state.currentWeapon].color });
      const gun = new THREE.Mesh(gunGeo, gunMat);
      gun.rotation.z = Math.PI / 2;
      gun.position.set(ax + 0.5, 1.0, 0.1);
      group.add(gun);
    }
  });
}

buildCharacter(playerGroup, 0xD4A574, WEAPONS[0].color);
playerGroup.position.set(0, 0, 5);
scene.add(playerGroup);

// ─── NPC Enemies ─────────────────────────────────────
const enemies = [];
const enemySkinColors = [0xC68642, 0xF4A460, 0xD2691E, 0xA0522D];
const enemyShirtColors = [0xFF2E63, 0x00C897, 0x845EC2, 0xFF6B35, 0xFFD93D];

function spawnEnemy(x, z) {
  const group = new THREE.Group();
  const skinCol = enemySkinColors[Math.floor(Math.random() * enemySkinColors.length)];
  const shirtCol = enemyShirtColors[Math.floor(Math.random() * enemyShirtColors.length)];
  buildCharacter(group, skinCol, shirtCol);
  group.position.set(x, 0, z);
  scene.add(group);

  const e = {
    group,
    hp: 100,
    maxHp: 100,
    speed: 0.02 + Math.random() * 0.02,
    dir: new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize(),
    shootTimer: Math.random() * 120,
    colorHit: 0,
    alive: true,
    bobTime: Math.random() * Math.PI * 2,
  };
  enemies.push(e);
  return e;
}

function spawnEnemies() {
  enemies.length = 0;
  scene.children.filter(c => c.userData.isEnemy).forEach(c => scene.remove(c));
  const count = state.mode === 'vs-ai' ? 8 : (state.mode === 'multiplayer' ? 12 : 0);
  for(let i=0; i<count; i++) {
     const e = spawnEnemy((Math.random()-0.5)*40, (Math.random()-0.5)*30);
     e.group.userData.isEnemy = true;
  }
}

// ─── Projectiles ─────────────────────────────────────
const projectiles = [];

function shootAt(targetPos) {
  if (state.reloading) return;
  const w = WEAPONS[state.currentWeapon];
  if (state.ammo[state.currentWeapon] <= 0) {
    triggerReload();
    return;
  }
  state.ammo[state.currentWeapon]--;
  state.shots++;
  updateAmmoBar();

  const geo = w.type === 'balloon'
    ? new THREE.SphereGeometry(w.splash * 0.15, 8, 6)
    : new THREE.SphereGeometry(0.12, 6, 5);
  const mat = new THREE.MeshLambertMaterial({
    color: w.color, emissive: w.color, emissiveIntensity: 0.5
  });
  const mesh = new THREE.Mesh(geo, mat);

  const startPos = playerGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0));
  
  // Minor inaccuracy spread
  const spread = new THREE.Vector3((Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8);
  const dir = targetPos.clone().add(spread).sub(startPos).normalize();

  mesh.position.copy(startPos);
  scene.add(mesh);

  projectiles.push({
    mesh,
    dir: dir.multiplyScalar(w.speed * 0.04),
    weapon: w,
    life: 120,
    fromPlayer: true,
    color: w.cssColor,
  });

  addSplashEffect(window.innerWidth/2, window.innerHeight/2 + 20, w.cssColor, 15);
}

function shootEnemy(enemy) {
  const colors = [COLORS.pink, COLORS.yellow, COLORS.cyan, COLORS.orange, COLORS.green];
  const cssC = CSS_COLORS[Math.floor(Math.random() * CSS_COLORS.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const geo = new THREE.SphereGeometry(0.1, 6, 5);
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(enemy.group.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
  const dir = playerGroup.position.clone()
    .sub(enemy.group.position)
    .add(new THREE.Vector3((Math.random()-0.5)*4, (Math.random()-0.5)*2, (Math.random()-0.5)*4))
    .normalize()
    .multiplyScalar(0.15);
  scene.add(mesh);
  projectiles.push({ mesh, dir, weapon: WEAPONS[0], life: 100, fromPlayer: false, color: cssC });
}

// ─── Ground Color Marks ───────────────────────────────
const colorMarks = [];
function addGroundMark(x, z, color) {
  const geo = new THREE.CircleGeometry(0.4 + Math.random() * 0.6, 8);
  const mat = new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide });
  const mark = new THREE.Mesh(geo, mat);
  mark.rotation.x = -Math.PI / 2;
  mark.position.set(x, 0.015, z);
  scene.add(mark);
  colorMarks.push(mark);
  if (colorMarks.length > 250) {
    scene.remove(colorMarks.shift());
  }
}

// ─── Particle System ──────────────────────────────────
const particleSystems = [];

function createParticleBurst(pos, color, count = 30, spread = 2) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i*3] = pos.x;
    positions[i*3+1] = pos.y;
    positions[i*3+2] = pos.z;
    velocities.push({
      x: (Math.random()-0.5) * spread,
      y: Math.random() * spread * 0.8 + 0.2,
      z: (Math.random()-0.5) * spread,
    });
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color, size: 0.15 + Math.random()*0.1, sizeAttenuation: true });
  const system = new THREE.Points(geo, mat);
  scene.add(system);
  particleSystems.push({ system, velocities, life: 60, maxLife: 60 });
}

// ─── CSS Splash FX ───────────────────────────────────
function addSplashEffect(x, y, color, size = 80) {
  const div = document.createElement('div');
  div.className = 'splash';
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  div.style.width = size + 'px';
  div.style.height = size + 'px';
  div.style.background = color;
  div.style.opacity = '0.7';
  document.getElementById('splashLayer').appendChild(div);
  setTimeout(() => div.remove(), 700);
}

function showHitText(x, y, pts, color) {
  const div = document.createElement('div');
  div.className = 'hit-text';
  div.textContent = '+' + pts;
  div.style.left = x + 'px';
  div.style.top = y + 'px';
  div.style.color = color;
  document.getElementById('splashLayer').appendChild(div);
  setTimeout(() => div.remove(), 1000);
}

function flashScreen(color) {
  const f = document.getElementById('hitFlash');
  f.style.background = color + '40';
  f.classList.remove('flash');
  void f.offsetWidth;
  f.classList.add('flash');
}

// ─── UI Updates ───────────────────────────────────────
function updateHUD() {
  document.getElementById('scoreVal').textContent = state.score;
  document.getElementById('hitsVal').textContent = state.hits;
  const acc = state.shots > 0 ? Math.round(state.hits / state.shots * 100) : 0;
  document.getElementById('accVal').textContent = acc + '%';
  document.getElementById('enemyCount').textContent = enemies.filter(e => e.alive).length;
  document.getElementById('combo-display').textContent = 'x' + state.combo;

  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  document.getElementById('timer').textContent =
    String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  if (state.timeLeft <= 30) {
    document.getElementById('timer').style.color = '#FF4757';
  }
}

function updateAmmoBar() {
  const bar = document.getElementById('ammoBar');
  bar.innerHTML = '';
  const w = WEAPONS[state.currentWeapon];
  const total = w.ammo;
  const current = state.ammo[state.currentWeapon];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'ammo-dot' + (i < current ? '' : ' empty');
    dot.style.background = i < current ? w.cssColor : '';
    dot.style.boxShadow = i < current ? `0 0 6px ${w.cssColor}` : '';
    bar.appendChild(dot);
  }
}

function selectWeapon(idx) {
  document.getElementById('w' + state.currentWeapon).classList.remove('active');
  state.currentWeapon = idx;
  document.getElementById('w' + idx).classList.add('active');
  
  // Make the gun mesh match color
  playerGroup.children.forEach(c => {
    if(c.children && c.children.length) c.children.forEach(gc => {
        if(gc.geometry && gc.geometry.type === 'CylinderGeometry') {
            gc.material.color.setHex(WEAPONS[idx].color);
        }
    })
  });
  
  updateAmmoBar();
}

function triggerReload() {
  if (state.reloading) return;
  state.reloading = true;
  document.getElementById('reloadMsg').style.display = 'block';
  setTimeout(() => {
    state.ammo[state.currentWeapon] = WEAPONS[state.currentWeapon].ammo;
    state.reloading = false;
    document.getElementById('reloadMsg').style.display = 'none';
    updateAmmoBar();
  }, 1200);
}

// ─── Input ────────────────────────────────────────────
const keys = {};

document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (!state.running) return;
  if (e.code === 'Digit1') selectWeapon(0);
  if (e.code === 'Digit2') selectWeapon(1);
  if (e.code === 'Digit3') selectWeapon(2);
  if (e.code === 'Digit4') selectWeapon(3);
  if (e.code === 'KeyH') triggerFestivalMode();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// ─── Fireworks & AOE ──────────────────────────────────
const fireworks = [];

function spawnFirework() {
  const colors = Object.values(COLORS);
  const pos = new THREE.Vector3(
    (Math.random()-0.5) * 30,
    10 + Math.random() * 10,
    (Math.random()-0.5) * 20 - 5
  );
  const color = colors[Math.floor(Math.random() * colors.length)];
  createParticleBurst(pos, color, 50, 3);

  // CSS overlay firework
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = window.innerWidth/2 + Math.cos(angle) * (80 + Math.random()*100);
    const y = window.innerHeight/2 + Math.sin(angle) * (80 + Math.random()*100);
    addSplashEffect(x, y, CSS_COLORS[Math.floor(Math.random()*CSS_COLORS.length)], 30+Math.random()*50);
  }
}

let festivalActive = false;
function triggerFestivalMode() {
  if (festivalActive) return;
  festivalActive = true;
  const banner = document.getElementById('festivalBanner');
  banner.style.display = 'flex';
  banner.style.animation = 'none';
  void banner.offsetWidth;
  banner.style.animation = 'bannerIn 0.5s ease forwards';

  for (let i = 0; i < 10; i++) {
    setTimeout(() => spawnFirework(), i * 200);
  }
  setTimeout(() => {
    banner.style.display = 'none';
    festivalActive = false;
  }, 3000);
}

function triggerColorBlast() {
    const colors = [COLORS.pink, COLORS.yellow, COLORS.cyan, COLORS.orange, COLORS.green];
    const cssColors = ['#FF2E63','#FFD93D','#00EAD3','#FF6B35','#00C897'];

    // Visual Burst around player
    for(let i=0; i<8; i++) {
        createParticleBurst(playerGroup.position.clone().add(new THREE.Vector3(0,1,0)), colors[i%colors.length], 40, 6);
    }
    flashScreen('#FFFFFF');
    addGroundMark(playerGroup.position.x, playerGroup.position.z, COLORS.pink);
    addGroundMark(playerGroup.position.x+1, playerGroup.position.z+1, COLORS.cyan);
    addGroundMark(playerGroup.position.x-1, playerGroup.position.z-1, COLORS.yellow);

    for(let i=0; i<5; i++){
       addSplashEffect(window.innerWidth/2 + (Math.random()-0.5)*200, window.innerHeight/2 + (Math.random()-0.5)*200, cssColors[i], 120);
    }

    // Huge damage to all nearby enemies
    enemies.forEach(e => {
        if(e.alive && playerGroup.position.distanceTo(e.group.position) < 8) {
            damageEnemy(e, 80, colors[Math.floor(Math.random()*colors.length)], cssColors[Math.floor(Math.random()*cssColors.length)], WEAPONS[0]);
        }
    });
}

// ─── Shared Damage Logic ──────────────────────────────
function damageEnemy(e, dmg, weaponColor, cssColor, weaponObj) {
    e.hp -= dmg;
    state.hits++;
    state.combo = Math.min(10, state.combo + 1);
    state.comboTimer = 90;

    const pts = Math.floor(dmg * state.combo);
    state.score += pts;

    // Color the enemy
    e.group.children.forEach(child => {
      if (child.material) {
        child.material = new THREE.MeshLambertMaterial({ color: weaponColor });
      }
    });

    // FX
    const screenPos = toScreen(e.group.position.clone().add(new THREE.Vector3(0,1.5,0)));
    createParticleBurst(e.group.position.clone().add(new THREE.Vector3(0,1.5,0)), weaponColor, 40, weaponObj.splash);
    addGroundMark(e.group.position.x, e.group.position.z, weaponColor);
    
    if (screenPos) {
      showHitText(screenPos.x, screenPos.y, pts, cssColor);
      for (let k = 0; k < 3; k++) {
        addSplashEffect(screenPos.x + (Math.random()-0.5)*80, screenPos.y + (Math.random()-0.5)*60, cssColor, 30 + weaponObj.splash * 30);
      }
    }

    // Combo flash
    const combDiv = document.getElementById('combo-display');
    combDiv.classList.remove('pop');
    void combDiv.offsetWidth;
    combDiv.classList.add('pop');
    setTimeout(() => combDiv.classList.remove('pop'), 200);

    if (e.hp <= 0) {
      e.alive = false;
      e.group.visible = false;
      createParticleBurst(e.group.position.clone().add(new THREE.Vector3(0,2,0)), weaponColor, 60, 3);
      
      // Respawn handling based on mode
      if (state.mode === 'vs-ai' || state.mode === 'multiplayer') {
        setTimeout(() => {
          // Spawn away from player
          let rx, rz;
          do {
            rx = (Math.random()-0.5)*40;
            rz = (Math.random()-0.5)*30;
          } while(new THREE.Vector3(rx, 0, rz).distanceTo(playerGroup.position) < 10);

          e.group.position.set(rx, 0, rz);
          buildCharacter(e.group, enemySkinColors[0], enemyShirtColors[Math.floor(Math.random()*enemyShirtColors.length)]);
          e.hp = e.maxHp;
          e.alive = true;
          e.group.visible = true;
        }, state.mode === 'multiplayer' ? 1500 : 3000);
      }
    }
}

// ─── Player Movement & Auto-Aim ───────────────────────
let dashing = false;

function updatePlayer(dt) {
  // Speed normalized
  const speed = dashing ? 0.18 : 0.08;
  const moveDir = new THREE.Vector3(0,0,0);

  // Absolute WASD Controller
  if (keys['KeyW'] || keys['ArrowUp'])    moveDir.z -= 1;
  if (keys['KeyS'] || keys['ArrowDown'])  moveDir.z += 1;
  if (keys['KeyA'] || keys['ArrowLeft'])  moveDir.x -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveDir.x += 1;

  if (moveDir.length() > 0) {
    moveDir.normalize();
    playerGroup.position.addScaledVector(moveDir, speed);
    
    // Bob animation
    playerGroup.children.forEach((c, i) => {
      if (i < 2) c.position.y += Math.sin(Date.now() * 0.01) * 0.003;
    });
  }

  // Clamp to arena
  playerGroup.position.x = Math.max(-25, Math.min(25, playerGroup.position.x));
  playerGroup.position.z = Math.max(-22, Math.min(20, playerGroup.position.z));

  // Dash
  if (keys['Space'] && state.dashtimer <= 0) {
    dashing = true;
    state.dashtimer = 60;
    setTimeout(() => { dashing = false; }, 300);
  }
  if (state.dashtimer > 0) state.dashtimer--;

  // Auto-Aim Logic (Vampire Survivors Style)
  let nearestEnemy = null;
  let minDist = 15; // Max auto-shoot distance

  enemies.forEach(e => {
      if(!e.alive) return;
      const dist = playerGroup.position.distanceTo(e.group.position);
      if(dist < minDist) {
          minDist = dist;
          nearestEnemy = e;
      }
  });

  if (nearestEnemy) {
      // Face nearest enemy
      const toEnemy = nearestEnemy.group.position.clone().sub(playerGroup.position);
      playerGroup.rotation.y = Math.atan2(toEnemy.x, toEnemy.z);

      // Auto Blast (Color Sparde) ONLY if VERY close
      if(minDist < 2.5 && state.colorBlastTimer <= 0) {
          triggerColorBlast();
          state.colorBlastTimer = 240; // 4 seconds cooldown
      }

      // Auto Shoot
      if (state.playerShootTimer <= 0 && !state.reloading) {
          shootAt(nearestEnemy.group.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
          state.playerShootTimer = WEAPONS[state.currentWeapon].fireRate;
      }
  } else if (moveDir.length() > 0) {
      // Look in direction of movement if no enemies are near
      playerGroup.rotation.y = Math.atan2(moveDir.x, moveDir.z);
  }

  // Timers
  if (state.playerShootTimer > 0) state.playerShootTimer--;
  if (state.colorBlastTimer > 0) state.colorBlastTimer--;

  // Camera gracefully follows player
  const camOffset = new THREE.Vector3(0, 14, 12);
  camera.position.lerp(playerGroup.position.clone().add(camOffset), 0.1);
  camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0,0.5,0)));
}

// ─── Enemy AI ─────────────────────────────────────────
function updateEnemies(dt) {
  const diffSpeeds = { easy: 0.015, medium: 0.025, madness: 0.045 };
  const speed = diffSpeeds[state.difficulty] || 0.02;

  enemies.forEach(e => {
    if (!e.alive) return;
    e.bobTime += 0.05;

    // Move
    const toPlayer = playerGroup.position.clone().sub(e.group.position);
    const dist = toPlayer.length();

    if (dist > 5) {
      e.dir.lerp(toPlayer.normalize(), 0.04);
    } else if (dist < 2.5) {
      e.dir.lerp(toPlayer.negate().normalize(), 0.06);
    } else {
      // Wander slightly when near
      if (Math.random() < 0.02) {
        e.dir.set(Math.random()-0.5, 0, Math.random()-0.5).normalize();
      }
    }

    e.group.position.addScaledVector(e.dir, speed);
    e.group.position.x = Math.max(-24, Math.min(24, e.group.position.x));
    e.group.position.z = Math.max(-21, Math.min(19, e.group.position.z));
    e.group.rotation.y = Math.atan2(e.dir.x, e.dir.z) + Math.PI;

    // Bob
    e.group.position.y = Math.sin(e.bobTime) * 0.05;

    // Shoot
    e.shootTimer--;
    const shootRate = { easy: 180, medium: 100, madness: 40 }[state.difficulty] || 150;
    if (e.shootTimer <= 0 && dist < 12) {
      shootEnemy(e);
      e.shootTimer = shootRate + Math.random() * 60;
    }
  });
}

// ─── Update Projectiles ───────────────────────────────
function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.mesh.position.add(p.dir);
    p.life--;

    // Gravity for balloons
    if (p.weapon.type === 'balloon') {
      p.dir.y -= 0.003;
    }

    // Check ground hit
    if (p.mesh.position.y <= 0.1) {
      addGroundMark(p.mesh.position.x, p.mesh.position.z, p.weapon.color);
      createParticleBurst(p.mesh.position.clone(), p.weapon.color, 20, 1.5);
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
      continue;
    }

    // Check player hit by enemy
    if (!p.fromPlayer) {
      const d = p.mesh.position.distanceTo(playerGroup.position.clone().add(new THREE.Vector3(0,1,0)));
      if (d < 1.2) {
        flashScreen(p.color);
        addGroundMark(playerGroup.position.x + (Math.random()-0.5)*2, playerGroup.position.z + (Math.random()-0.5)*2, p.weapon.color);
        createParticleBurst(playerGroup.position.clone().add(new THREE.Vector3(0,1,0)), p.weapon.color, 25, 2);
        scene.remove(p.mesh);
        projectiles.splice(i, 1);
        continue;
      }
    }

    // Check enemy hit by player
    if (p.fromPlayer) {
      let hit = false;
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        if (!e.alive) continue;
        const d = p.mesh.position.distanceTo(e.group.position.clone().add(new THREE.Vector3(0,1,0)));
        if (d < 1.5) {
          damageEnemy(e, p.weapon.dmg, p.weapon.color, p.color, p.weapon);
          hit = true;
          scene.remove(p.mesh);
          projectiles.splice(i, 1);
          break;
        }
      }
      if (!hit && p.life <= 0) {
        scene.remove(p.mesh);
        projectiles.splice(i, 1);
      }
    } else if (p.life <= 0) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
    }
  }
}

// ─── Update Particles ─────────────────────────────────
function updateParticles() {
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    const ps = particleSystems[i];
    ps.life--;
    const pos = ps.system.geometry.attributes.position.array;
    for (let j = 0; j < ps.velocities.length; j++) {
      pos[j*3]   += ps.velocities[j].x * 0.1;
      pos[j*3+1] += ps.velocities[j].y * 0.1;
      pos[j*3+2] += ps.velocities[j].z * 0.1;
      ps.velocities[j].y -= 0.02;
    }
    ps.system.geometry.attributes.position.needsUpdate = true;
    ps.system.material.opacity = ps.life / ps.maxLife;
    ps.system.material.transparent = true;
    if (ps.life <= 0) {
      scene.remove(ps.system);
      particleSystems.splice(i, 1);
    }
  }
}

// ─── World Animation ──────────────────────────────────
let worldTime = 0;
function animateWorld() {
  worldTime += 0.01;
  // Gently rotate flags
  scene.children.forEach(child => {
    if (child.isGroup) {
      child.children.forEach(c => {
        if (c.geometry && c.geometry.type === 'BoxGeometry' && c.position.y > 6) {
          c.rotation.y = Math.sin(worldTime + c.position.x) * 0.3;
        }
      });
    }
  });
}

// ─── Screen Projection ────────────────────────────────
function toScreen(pos3d) {
  const v = pos3d.clone().project(camera);
  if (v.z > 1) return null;
  return {
    x: (v.x + 1) / 2 * window.innerWidth,
    y: -(v.y - 1) / 2 * window.innerHeight,
  };
}

// ─── Timer ────────────────────────────────────────────
let timerInterval;
function startTimer() {
  clearInterval(timerInterval);
  state.timeLeft = state.mode === 'freeplay' ? 9999 : 180;
  timerInterval = setInterval(() => {
    if (!state.running) return;
    if (state.mode !== 'freeplay') {
      state.timeLeft--;
      if (state.timeLeft <= 0) {
        endGame();
      }
    }
    // Combo decay
    if (state.comboTimer > 0) {
      state.comboTimer--;
      if (state.comboTimer <= 0) {
        state.combo = 1;
      }
    }
    // Random fireworks in freeplay
    if (state.mode === 'freeplay' && Math.random() < 0.05) {
      spawnFirework();
    }
  }, 1000);
}

// ─── Menu Functions ───────────────────────────────────
function selectMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.style.borderColor = '');
  event.currentTarget.style.borderColor = 'var(--yellow)';
  document.getElementById('diffRow').style.display = (mode === 'vs-ai' || mode === 'multiplayer') ? 'flex' : 'none';
}

function selectDiff(diff, el) {
  state.difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

function startGame() {
  document.getElementById('menuScreen').style.display = 'none';
  document.getElementById('endScreen').style.display = 'none';
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('weaponBar').style.display = 'flex';
  document.getElementById('controlsHint').style.display = 'block';

  // Reset state
  state.score = 0;
  state.hits = 0;
  state.shots = 0;
  state.combo = 1;
  state.comboTimer = 0;
  state.ammo = [...WEAPONS.map(w => w.ammo)];
  state.reloading = false;
  state.running = true;
  state.playerShootTimer = 0;
  state.colorBlastTimer = 0;

  // Reset player
  playerGroup.position.set(0, 0, 5);
  camera.position.set(0, 14, 17);

  // Clear old color marks
  colorMarks.forEach(m => scene.remove(m));
  colorMarks.length = 0;

  spawnEnemies();
  updateAmmoBar();
  startTimer();
}

function endGame() {
  state.running = false;
  clearInterval(timerInterval);
  const acc = state.shots > 0 ? Math.round(state.hits / state.shots * 100) : 0;
  document.getElementById('finalScore').textContent = state.score;
  document.getElementById('finalAcc').textContent = acc + '%';
  document.getElementById('finalHits').textContent = state.hits;
  document.getElementById('endScreen').style.display = 'flex';
  document.getElementById('controlsHint').style.display = 'none';

  for (let i = 0; i < 15; i++) {
    setTimeout(() => spawnFirework(), i * 200);
  }
}

function changeMode() {
  document.getElementById('endScreen').style.display = 'none';
  document.getElementById('menuScreen').style.display = 'flex';
  document.getElementById('hud').style.display = 'none';
  state.running = false;
}

// ─── Menu Particles ───────────────────────────────────
function initMenuParticles() {
  const container = document.getElementById('menuParticles');
  container.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const div = document.createElement('div');
    div.className = 'menu-particle';
    const size = 6 + Math.random() * 20;
    div.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${CSS_COLORS[Math.floor(Math.random() * CSS_COLORS.length)]};
      animation-duration: ${5 + Math.random() * 10}s;
      animation-delay: ${-Math.random() * 10}s;
    `;
    container.appendChild(div);
  }
}
initMenuParticles();

// ─── Resize ───────────────────────────────────────────
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ─── Main Loop ────────────────────────────────────────
let lastTime = 0;
function animate(time) {
  requestAnimationFrame(animate);
  const dt = time - lastTime;
  lastTime = time;

  if (state.running) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateProjectiles();
  }

  updateParticles();
  animateWorld();
  updateHUD();

  renderer.render(scene, camera);
}

animate(0);
