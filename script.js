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

// ---------------- SHOP ----------------
let inShop = false;
let shopCards = [];

// ---------------- ROBOT ----------------
let robot = { x: 100, y: 200, hp: 10, damage: 1, range: 100 };

// ---------------- ENEMY TYPES ----------------
const enemyTypes = {
  normal: { hp: 5, speed: 1, burnMult: 1, splashMult: 1, color: "red" },
  fast: { hp: 3, speed: 2, burnMult: 1.2, splashMult: 1, color: "orange" },
  tank: { hp: 15, speed: 0.6, burnMult: 0.5, splashMult: 0.8, color: "gray" },
  volatile: { hp: 4, speed: 1.2, burnMult: 1, splashMult: 1.8, color: "purple" }
};

// ---------------- WAVE SYSTEM ----------------
function startWave() {
  waveEnemiesLeft = 5 + wave * 2;
}

function randomType() {
  const t = ["normal", "fast", "tank", "volatile"];
  return t[Math.floor(Math.random() * t.length)];
}

function spawnEnemy() {
  if (waveEnemiesLeft <= 0 || inShop) return;

  const type = randomType();
  const data = enemyTypes[type];

  enemies.push({
    x: 800,
    y: 200,
    type,
    hp: data.hp + wave,
    speed: data.speed + wave * 0.05,
    burnTimer: 0,
    burnDamage: 0
  });

  waveEnemiesLeft--;
}

// ---------------- SHOP ----------------
function generateShop() {
  shopCards = [];

  while (shopCards.length < 3) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!shopCards.includes(c)) shopCards.push(c);
  }

  inShop = true;
}

function buyCard(card) {
  selected[card.type] = card;
  updateRobot();

  maxEnergy += 1;
  inShop = false;
  startWave();
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

// ---------------- ATTACK ----------------
function attack() {
  const weapon = selected.weapon;

  enemies.forEach(e => {
    if (Math.abs(e.x - robot.x) < robot.range) {
      e.hp -= robot.damage;

      if (!weapon) return;

      const t = enemyTypes[e.type];

      if (weapon.ability === "burn") {
        e.burnTimer = 60;
        e.burnDamage = 0.2 * t.burnMult;
      }

      if (weapon.ability === "splash") {
        enemies.forEach(o => {
          if (o !== e && Math.abs(o.x - e.x) < 40) {
            const m = enemyTypes[o.type].splashMult;
            o.hp -= robot.damage * 0.5 * m;
          }
        });
      }
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ---------------- UPDATE ----------------
function updateEnemies() {
  enemies.forEach(e => {
    e.x -= e.speed;

    if (e.burnTimer > 0) {
      e.hp -= e.burnDamage;
      e.burnTimer--;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ---------------- UI ----------------
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

// ---------------- DRAW ----------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ---------------- ROBOT ----------------
  ctx.fillStyle = "cyan";
  ctx.fillRect(robot.x, robot.y, 20, 20);

  // ---------------- ENEMIES ----------------
  enemies.forEach(e => {
    ctx.fillStyle = enemyTypes[e.type].color;
    ctx.fillRect(e.x, e.y, 20, 20);
  });

  // ---------------- CARDS ----------------
  const ui = getCardUI();

  ui.forEach(u => {
    const c = cards[u.index];

    let x = u.x, y = u.y;
    if (hoveredCard === u.index) y -= 20;

    const canUse = getTotalCost(c) <= maxEnergy;

    ctx.globalAlpha = canUse ? 1 : 0.4;

    ctx.fillStyle =
      c.type === "head" ? "#4aa3ff" :
      c.type === "body" ? "#4aff88" : "#ff4a4a";

    ctx.fillRect(x, y, u.width, u.height);

    ctx.strokeStyle = selected[c.type] === c ? "yellow" : "white";
    ctx.strokeRect(x, y, u.width, u.height);

    // ---------------- TEXT ----------------
    ctx.fillStyle = "black";
    ctx.fillText(c.name, x + 8, y + 25);

    ctx.fillText(`Cost: ${c.cost}`, x + 8, y + 45);

    if (c.ability) {
      ctx.fillText(`Ability: ${c.ability}`, x + 8, y + 65);
    }

    ctx.globalAlpha = 1;
  });

  // ---------------- SHOP ----------------
  if (inShop) {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.fillText("SHOP - choose 1 card", 300, 100);

    shopCards.forEach((c, i) => {
      const x = 300 + i * 150;
      const y = 200;

      ctx.fillStyle =
        c.type === "head" ? "#4aa3ff" :
        c.type === "body" ? "#4aff88" : "#ff4a4a";

      ctx.fillRect(x, y, 120, 160);

      ctx.fillStyle = "black";
      ctx.fillText(c.name, x + 10, y + 40);
      ctx.fillText(`Cost: ${c.cost}`, x + 10, y + 60);

      if (c.ability) {
        ctx.fillText(c.ability, x + 10, y + 80);
      }

      ctx.fillStyle = "white";
      ctx.fillText("CLICK", x + 10, y + 130);
    });
  }

  // ---------------- HUD ----------------
  ctx.fillStyle = "white";
  ctx.fillText(`Wave: ${wave}`, 10, 20);
  ctx.fillText(`Enemies: ${enemies.length}`, 10, 40);
  ctx.fillText(`Energy: ${maxEnergy}`, 10, 60);
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

  if (inShop) {
    shopCards.forEach((c, i) => {
      const x = 300 + i * 150;
      const y = 200;

      if (mx > x && mx < x + 120 && my > y && my < y + 160) {
        buyCard(c);
      }
    });
    return;
  }

  getCardUI().forEach(u => {
    if (mx > u.x && mx < u.x + u.width && my > u.y && my < u.y + u.height) {
      const card = cards[u.index];
      selected[card.type] = card;
      updateRobot();
    }
  });
});

// ---------------- LOOP ----------------
function loop() {
  if (!inShop) {
    updateEnemies();
    attack();
  }

  draw();

  if (!inShop && waveEnemiesLeft === 0 && enemies.length === 0) {
    wave++;
    maxEnergy++;
    generateShop();
  }

  requestAnimationFrame(loop);
}

startWave();
setInterval(spawnEnemy, 900);
loop();
