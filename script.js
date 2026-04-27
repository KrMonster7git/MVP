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

  // Cards UI
  ctx.fillStyle = 'white';
  cards.forEach((card, i) => {
    ctx.fillText(`${i}: ${card.name}`, 10, 20 + i * 20);
  });

  ctx.fillText("Press 0-3 to select cards", 10, 120);
}

// --- INPUT ---
document.addEventListener('keydown', (e) => {
  const index = parseInt(e.key);
  if (!isNaN(index) && cards[index]) {
    selectCard(index);
  }
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