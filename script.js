const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
let currentEnergy = 5;

// ---------------- WAVES ----------------
let wave = 1;
let waveEnemiesLeft = 0;

// ---------------- ROBOT ----------------
let robot = { x: 100, y: 200, hp: 10, damage: 1, range: 100 };

// ---------------- WAVES ----------------
function startWave() {
  waveEnemiesLeft = 5 + wave * 2;
}

function spawnEnemy() {
  if (waveEnemiesLeft <= 0) return;

  enemies.push({
    x: 800,
    y: 200,
    hp: 3 + wave * 2,
    speed: 1 + wave * 0.1,
    burnTimer: 0,
    burnDamage: 0
  });

  waveEnemiesLeft--;
}

// ---------------- CARDS ----------------
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

function getTotalCost(nextCard = null) {
  let total = 0;
  Object.values(selected).forEach(c => { if (c) total += c.cost; });

  if (nextCard) {
    const ex = selected[nextCard.type];
    if (ex) total -= ex.cost;
    total += nextCard.cost;
  }

  return total;
}

function selectCard(index) {
  const card = cards[index];
  if (getTotalCost(card) > maxEnergy) return;

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

    // 🔥 burn effect
    if (e.burnTimer > 0) {
      e.hp -= e.burnDamage;
      e.burnTimer--;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ---------------- ATTACK + ABILITIES ----------------
function attack() {
  enemies.forEach(e => {
    if (Math.abs(e.x - robot.x) < robot.range) {
      e.hp -= robot.damage;

      const weapon = selected.weapon;
      if (!weapon) return;

      // 🔥 BURN
      if (weapon.ability === "burn") {
        e.burnTimer = 60; // ~1 sec
        e.burnDamage = 0.2;
      }

      // 💥 SPLASH
      if (weapon.ability === "splash") {
        enemies.forEach(o => {
          if (o !== e && Math.abs(o.x - e.x) < 40) {
            o.hp -= robot.damage * 0.5;
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

  ctx.fillStyle = "cyan";
  ctx.fillRect(robot.x, robot.y, 20, 20);

  enemies.forEach(e => {
    ctx.fillStyle = e.burnTimer > 0 ? "orange" : "red";
    ctx.fillRect(e.x, e.y, 20, 20);
  });

  const ui = getCardUI();

  ui.forEach(u => {
    const c = cards[u.index];

    let x = u.x, y = u.y;

    if (hoveredCard === u.index) y -= 20;

    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, u.width, u.height);

    ctx.strokeStyle = selected[c.type] === c ? "yellow" : "white";
    ctx.strokeRect(x, y, u.width, u.height);

    ctx.fillStyle = "white";
    ctx.fillText(c.name, x + 10, y + 30);
    ctx.fillText(c.ability || "-", x + 10, y + 60);
  });

  ctx.fillStyle = "white";
  ctx.fillText(`Wave: ${wave}`, 10, 20);
}

// ---------------- INPUT ----------------
canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;

  hoveredCard = null;

  getCardUI().forEach(u => {
    if (mx > u.x && mx < u.x + u.width && my > u.y && my < u.y + u.height) {
      hoveredCard = u.index;
    }
  });
});

canvas.addEventListener("click", e => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;

  getCardUI().forEach(u => {
    if (mx > u.x && mx < u.x + u.width && my > u.y && my < u.y + u.height) {
      selectCard(u.index);
    }
  });
});

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
