const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let enemies = [];

// --- CARDS WITH TYPES + COST ---
const cards = [
  { name: "Light Head", type: "head", damage: 1, cost: 1 },
  { name: "Heavy Body", type: "body", hp: 30, cost: 3 },
  { name: "Laser Gun", type: "weapon", damage: 2, range: 120, cost: 2 },
  { name: "Cannon", type: "weapon", damage: 4, range: 80, cost: 3 }
];

let selected = { head: null, body: null, weapon: null };
let hoveredCard = null;

// ENERGY
let maxEnergy = 5;
let currentEnergy = 5;

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

function selectCard(index) {
  const card = cards[index];
  const cost = getTotalCost(card);

  if (cost > maxEnergy) return;

  selected[card.type] = card;
  currentEnergy = maxEnergy - getTotalCost();
  updateRobot();
}

let robot = { x: 100, y: 200, hp: 10, damage: 1, range: 100 };

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

function spawnEnemy() {
  enemies.push({ x: 800, y: 200, hp: 5, speed: 1 });
}

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

function getColor(type) {
  if (type === 'head') return '#4aa3ff';
  if (type === 'body') return '#4aff88';
  if (type === 'weapon') return '#ff4a4a';
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'cyan';
  ctx.fillRect(robot.x, robot.y, 20, 20);

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

    const canUse = getTotalCost(card) <= maxEnergy;
    ctx.globalAlpha = canUse ? 1 : 0.4;

    ctx.fillStyle = getColor(card.type);
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = selected[card.type] === card ? 'yellow' : 'white';
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = 'black';
    ctx.fillText(card.name, x + 10, y + 30);
    ctx.fillText(`Cost: ${card.cost}`, x + 10, y + 50);

    ctx.globalAlpha = 1;
  });

  ctx.fillStyle = 'white';
  ctx.fillText(`Energy: ${currentEnergy}/${maxEnergy}`, 10, 20);
  ctx.fillText(`Head: ${selected.head?.name || '-'}`, 10, 40);
  ctx.fillText(`Body: ${selected.body?.name || '-'}`, 10, 60);
  ctx.fillText(`Weapon: ${selected.weapon?.name || '-'}`, 10, 80);
}

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

function gameLoop() {
  updateEnemies();
  attack();
  draw();
  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 2000);

gameLoop();