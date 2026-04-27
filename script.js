const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let enemies = [];

// --- CARDS ---
const cards = [
  { name: "Light Head", type: "head", damage: 1, cost: 1 },
  { name: "Heavy Body", type: "body", hp: 30, cost: 3 },
  { name: "Laser Gun", type: "weapon", damage: 2, range: 120, cost: 2 },
  { name: "Cannon", type: "weapon", damage: 4, range: 80, cost: 3 }
];

let selected = { head: null, body: null, weapon: null };
let hoveredCard = null;

// --- ENERGY ---
let maxEnergy = 5;
let currentEnergy = 5;

// --- WAVES ---
let wave = 1;
let waveEnemiesLeft = 0;

// robot
let robot = { x: 100, y: 200, hp: 10, damage: 1, range: 100 };

// ---------- WAVE SYSTEM ----------
function startWave() {
  waveEnemiesLeft = 5 + wave * 2;
}

function spawnEnemy() {
  if (waveEnemiesLeft <= 0) return;

  enemies.push({
    x: 800,
    y: 200,
    hp: 3 + wave * 2,
    speed: 1 + wave * 0.1
  });

  waveEnemiesLeft--;
}

// ---------- CARDS ----------
function getCardUI() {
  const width = 100;
  const height = 140;
  const gap = 20;
  const totalWidth = cards.length * width + (cards.length - 1) * gap;
  const startX = (canvas.width - totalWidth) / 2;

  return cards.map((c, i) => ({
    x: startX + i * (width + gap),
    y: canvas.height - height - 10,
    width,
    height,
    index: i
  }));
}

function getTotalCost(nextCard=null) {
  let total = 0;
  Object.values(selected).forEach(c => { if (c) total += c.cost; });

  if (nextCard) {
    const existing = selected[nextCard.type];
    if (existing) total -= existing.cost;
    total += nextCard.cost;
  }

  return total;
}

function selectCard(index) {
  const card = cards[index];
  const cost = getTotalCost(card);

  if (cost > maxEnergy) return;

  selected[card.type] = card;
  currentEnergy = maxEnergy - getTotalCost();
  updateRobot();
}

// ---------- ROBOT ----------
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

// ---------- GAME ----------
function updateEnemies() {
  enemies.forEach(e => e.x -= e.speed);
}

function attack() {
  enemies.forEach(e => {
    if (Math.abs(e.x - robot.x) < robot.range) {
      e.hp -= robot.damage;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// ---------- DRAW ----------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // robot
  ctx.fillStyle = 'cyan';
  ctx.fillRect(robot.x, robot.y, 20, 20);

  // enemies
  ctx.fillStyle = 'red';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, 20, 20));

  const cardUI = getCardUI();

  cardUI.forEach(ui => {
    const card = cards[ui.index];

    let x = ui.x;
    let y = ui.y;
    let w = ui.width;
    let h = ui.height;

    if (hoveredCard === ui.index) {
      y -= 20;
      w *= 1.1;
      h *= 1.1;
    }

    ctx.fillStyle =
      card.type === 'head' ? '#4aa3ff' :
      card.type === 'body' ? '#4aff88' : '#ff4a4a';

    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = selected[card.type] === card ? 'yellow' : 'white';
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = 'black';
    ctx.fillText(card.name, x + 10, y + 30);
    ctx.fillText(`Cost: ${card.cost}`, x + 10, y + 50);
  });

  ctx.fillStyle = 'white';
  ctx.fillText(`Wave: ${wave}`, 10, 20);
  ctx.fillText(`Enemies left: ${waveEnemiesLeft}`, 10, 40);
}

// ---------- INPUT ----------
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  hoveredCard = null;
  const cardUI = getCardUI();

  cardUI.forEach(ui => {
    if (mx >= ui.x && mx <= ui.x + ui.width && my >= ui.y && my <= ui.y + ui.height) {
      hoveredCard = ui.index;
    }
  });
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const cardUI = getCardUI();

  cardUI.forEach(ui => {
    if (mx >= ui.x && mx <= ui.x + ui.width && my >= ui.y && my <= ui.y + ui.height) {
      selectCard(ui.index);
    }
  });
});

// ---------- LOOP ----------
function gameLoop() {
  updateEnemies();
  attack();
  draw();

  if (waveEnemiesLeft === 0 && enemies.length === 0) {
    wave++;
    startWave();
  }

  requestAnimationFrame(gameLoop);
}

// start
startWave();
setInterval(spawnEnemy, 1000);

gameLoop();
