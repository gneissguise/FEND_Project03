// These global constants will serve as the bounds for
// our player character.

const CHAR_MIN_X = 0;
const CHAR_MAX_X = 404;
const CHAR_MIN_Y = 0;
const CHAR_MAX_Y = 404;
const CHAR_STARTING_X = 202;
const CHAR_STARTING_Y = 404;
const MOVE_FACTOR = 50.5;
const _DEBUG = true;
const SPRITES = {
  'stone': 'images/stone-block.png',
  'water': 'images/water-block.png',
  'grass': 'images/grass-block.png',
  'enemy': 'images/enemy-bug.png',
  'player': 'images/char-boy.png',
  'heart': 'images/Heart.png'
};
let gamePause = false;

function checkCollisions(player, enemies) {
  for (let enemy of enemies) {
    // Enemy collision box:    0, 112 | 100, 112 |   0, 140 | 100, 140
    // enemy.x + , enemy.y + 11
    // Player collision box:  34, 126 |  68, 126 |  44, 138 |  60, 138

    if ((enemy.x + enemy.collision[0]) < (player.x + player.collision[2]) &&
        (enemy.x + enemy.collision[2]) > (player.x + player.collision[0]) &&
        (enemy.y + enemy.collision[1]) < (player.y + player.collision[5]) &&
        (enemy.y + enemy.collision[5]) > (player.y + player.collision[1])) {

      // Collision detected
      //	    particle_explosion.create(ctx, player.x / 2, player.y / 2, 128);
      //	    particle_explosion.update();
      gamePause = true;
      $("canvas").fadeOut("slow");
      player.reset();
      allEnemies.forEach((enemy) => {
        enemy.reset();
      });
      $("canvas").fadeIn("slow");
      setTimeout(() => {
        gamePause = false;
      }, 1000);

      return;
    }
  }
}

// Enemies our player must avoid
function Enemy(startingX, startingY) {
  this.sprite = 'images/enemy-bug.png';
  this.startX = startingX;
  this.x = startingX;
  this.startY = startingY;
  this.y = startingY;
  this.coefficient = Math.random() * 30;
  this.collision = [
      0, 112,
    100, 112,
      0, 140,
    100, 140
  ];
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  if (this.x < CHAR_MAX_X + 101) {
    this.x += (MOVE_FACTOR + this.coefficient) * dt;
    this.y = this.y + Math.sin(2 * Math.PI * (this.x / 50)) * 1.333;
  } else {
    this.x = this.startX;
    this.y = this.startY;
  }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.reset = function() {
  this.x = this.startX;
  this.y = this.startY;
}

function Player() {
  this.sprite = 'images/char-boy.png';
  this.startX = CHAR_STARTING_X;
  this.x = this.startX;
  this.startY = CHAR_STARTING_Y;
  this.y = this.startY;
  this.lives = 3;
  this.score = 0;
  this.crossings = 0;
  this.collision = [
    34, 126,
    68, 126,
    44, 138,
    60, 138
  ];
};

Player.prototype.update = function() {
  checkCollisions(player, allEnemies);
};

Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.showStatus = function() {
  for (let i = 0; i < this.lives; i++){
    ctx.drawImage(Resources.get(),);
  }
};

Player.prototype.reset = function() {
  this.x = this.startX;
  this.y = this.startY;
};

Player.prototype.handleInput = function(keyInp) {
  switch (keyInp) {
    case 'left':
      if (this.x > CHAR_MIN_X) {
        this.x -= MOVE_FACTOR;
      };
      break;
    case 'up':
      if (this.y > CHAR_MIN_Y) {
        this.y -= MOVE_FACTOR;
      }
      break;
    case 'right':
      if (this.x < CHAR_MAX_X) {
        this.x += MOVE_FACTOR;
      }
      break;
    case 'down':
      if (this.y < CHAR_MAX_Y) {
        this.y += MOVE_FACTOR;
      }
      break;
  };
};

const allEnemies = [
  new Enemy(-50, 50),
  new Enemy(-202, 135),
  new Enemy(-101, 215)
];

const player = new Player();

document.addEventListener('keyup', (e) => {
  const allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  if (e.keyCode === 80){
    gamePause = !gamePause;
  }

  console.log("key code: " + e.keyCode);

  if (!gamePause) {
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
