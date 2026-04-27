const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let enemies = [];

// --- CARDS SYSTEM ---
const cards = [
  { name: "Light Body", hp: 10, cost: 1 },
  { name: "Heavy Body", hp: 30, cost: 3 },
  { name: "Laser Gun", damage: 1, range: 120, cost: 2 },
  { name: "Cannon", damage: 3, range: 80, cost: 3 }
];

let selectedCards = [];

// bottom hand UI
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
  if (selectedCards.length >= 2) return;
  selectedCards.push(cards[index]);
  updateRobot();
}

// --- ROBOT ---
let robot = {
  x: 100,
  y: 200,
  hp: 10,
  damage: 1,
  range: 100
};

function updateRobot() {
  robot.hp = 10;
  robot.damage = 1;
  robot.range = 100;

  selectedCards.forEach(c => {
    if (c.hp) robot.hp += c.hp;
    if (c.damage) robot.damage += c.damage;
    if (c.range) robot.range = c.range;
  });
}

// --- ENEMIES ---
function spawnEnemy() {
  enemies.push({
    x: 800,
    y: 200,
    hp: 5,
    speed: 1
  });
}

function updateEnemies() {
  enemies.forEach(e => {
    e.x -= e.speed;
  });
}

function attack() {
  enemies.forEach(e => {
    if (Math.abs(e.x - robot.x) < robot.range) {
      e.hp -= robot.damage;
    }
  });

  enemies = enemies.filter(e => e.hp > 0);
}

// --- DRAW ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Robot
  ctx.fillStyle = 'cyan';
  ctx.fillRect(robot.x, robot.y, 20, 20);

  // Enemies
  ctx.fillStyle = 'red';
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, 20, 20);
  });

  // Cards bottom
  const cardUI = getCardUI();

  cardUI.forEach(ui => {
    const card = cards[ui.index];

    ctx.strokeStyle = 'white';
    ctx.strokeRect(ui.x, ui.y, ui.width, ui.height);

    ctx.fillStyle = 'white';
    ctx.fillText(card.name, ui.x + 10, ui.y + 30);
    ctx.fillText(`Cost: ${card.cost}`, ui.x + 10, ui.y + 60);
  });

  ctx.fillText("Selected: " + selectedCards.map(c => c.name).join(', '), 10, 20);
}

// --- INPUT ---
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const cardUI = getCardUI();

  cardUI.forEach(ui => {
    if (
      mouseX >= ui.x &&
      mouseX <= ui.x + ui.width &&
      mouseY >= ui.y &&
      mouseY <= ui.y + ui.height
    ) {
      selectCard(ui.index);
    }
  });
});

// --- LOOP ---
function gameLoop() {
  updateEnemies();
  attack();
  draw();
  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 2000);

gameLoop();