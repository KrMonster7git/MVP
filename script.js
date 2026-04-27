const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let enemies = [];

// ---------------- CARDS ----------------
const cards = [
  { name: "Fire Head", type: "head", damage: 1, cost: 1, ability: "burn" },
  { name: "Tank Body", type: "body", hp: 30, cost: 3 },
  { name: "Laser Gun", type: "weapon", damage: 2, range: 120, cost: 2, ability: "burn" },
  { name: "Cannon", type: "weapon", damage: 4, range: 80, cost: 3, ability: "splash" }
];

let selected = { head: null, body: null, weapon: null };
let hoveredCard = null;

// ---------------- ENERGY ----------------
let maxEnergy = 5;

// ---------------- WAVES ----------------
let wave = 1;
let waveEnemiesLeft = 0;

// ---------------- ROBOT ----------------
let robot = { x: 100, y: 200, hp: 10, damage: 1, range: 100 };

// ---------------- ENEMY TYPES ----------------
const enemyTypes = {
  normal: {
    hp: 5,
    speed: 1,
    burnMult: 1,
    splashMult: 1,
    color: "red"
  },

  fast: {
    hp: 3,
    speed: 2,
    burnMult: 1.2,
    splashMult: 1,
    color: "orange"
  },

  tank: {
    hp: 15,
    speed: 0.6,
    burnMult: 0.5,
    splashMult: 0.8,
    color: "gray"
  },

  volatile: {
    hp: 4,
    speed: 1.2,
    burnMult: 1,
    splashMult: 1.8,
    color: "purple"
  }
};

// ---------------- WAVES ----------------
function startWave() {
  waveEnemiesLeft = 5 + wave * 2;
}

function randomEnemyType() {
  const types = ["normal", "fast", "tank", "volatile"];
  return types[Math.floor(Math.random() * types.length)];
}

function spawnEnemy() {
  if (waveEnemiesLeft <= 0) return;

  const type = randomEnemyType();
  const t = enemyTypes[type];

  enemies.push({
    x: 800,
    y: 200,
    type,
    hp: t.hp + wave,
    speed: t.speed + wave * 0.05,
    burnTimer: 0,
    burnDamage: 0
  });

  waveEnemiesLeft--;
}

// ---------------- CARDS UI ----------------
function getCardUI() {
  const w = 100, h = 140, gap = 20;
  const total = cards.length * w + (cards.length - 1) * gap;
  const startX = (canvas.width - total) / 2;

  return cards.map((c, i) => ({
    x: startX + i * (w + gap),
    y: canvas.height - h - 10,
    width: w,
    height: h,
    index: i
  }));
}

function selectCard(index) {
  const card = cards[index];
  selected[card.type] = card;
  updateRobot();
}

// ---------------- ROBOT ----------------
function updateRobot() {
  robot.hp = 10;
  robot.damage = 1;
  robot.range = 100;

  Object.values(selected).forEach(c => {
    if (!c) return;
    if (c.hp) robot.hp += c.hp;
    if (c.damage) robot.damage += c.damage;
    if (c.range) robot.range = c.range;
  });
}

// ---------------- ENEMIES ----------------
function updateEnemies() {
  enemies.forEach(e => {
    e.x -= e.speed;

    // burn
    if (e.burnTimer > 0) {
      const mult = enemyTypes[e.type].burnMult;
      e.hp -= e.burnDamage * mult;
      e.burnTimer--;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ---------------- ATTACK + EFFECTS ----------------
function attack() {
  const weapon = selected.weapon;

  enemies.forEach(e => {
    if (Math.abs(e.x - robot.x) < robot.range) {
      e.hp -= robot.damage;

      if (!weapon) return;

      const typeData = enemyTypes[e.type];

      // 🔥 BURN
      if (weapon.ability === "burn") {
        e.burnTimer = 60;
        e.burnDamage = 0.2 * typeData.burnMult;
      }

      // 💥 SPLASH
      if (weapon.ability === "splash") {
        enemies.forEach(o => {
          if (o !== e && Math.abs(o.x - e.x) < 40) {
            const mult = enemyTypes[o.type].splashMult;
            o.hp -= robot.damage * 0.5 * mult;
          }
        });
      }
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ---------------- DRAW ----------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // robot
  ctx.fillStyle = "cyan";
  ctx.fillRect(robot.x, robot.y, 20, 20);

  // enemies
  enemies.forEach(e => {
    ctx.fillStyle = enemyTypes[e.type].color;
    ctx.fillRect(e.x, e.y, 20, 20);
  });

  const ui = getCardUI();

  ui.forEach(u => {
    const c = cards[u.index];

    let x = u.x, y = u.y;

    if (hoveredCard === u.index) y -= 20;

    ctx.fillStyle =
      c.type === "head" ? "#4aa3ff" :
      c.type === "body" ? "#4aff88" : "#ff4a4a";

    ctx.fillRect(x, y, u.width, u.height);

    ctx.strokeStyle = selected[c.type] === c ? "yellow" : "white";
    ctx.strokeRect(x, y, u.width, u.height);

    ctx.fillStyle = "black";
    ctx.fillText(c.name, x + 10, y + 30);
    ctx.fillText(c.ability || "-", x + 10, y + 60);
  });

  ctx.fillStyle = "white";
  ctx.fillText(`Wave: ${wave}`, 10, 20);
  ctx.fillText(`Enemies: ${enemies.length}`, 10, 40);
}

// ---------------- LOOP ----------------
function loop() {
  updateEnemies();
  attack();
  draw();

  if (waveEnemiesLeft === 0 && enemies.length === 0) {
    wave++;
    startWave();
  }

  requestAnimationFrame(loop);
}

startWave();
setInterval(spawnEnemy, 900);
loop();
