const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let enemies = [];
let robot = {
  x: 100,
  y: 200,
  damage: 1,
  range: 100
};

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
}

function gameLoop() {
  updateEnemies();
  attack();
  draw();
  requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 2000);

gameLoop();