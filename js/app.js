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

function resetAll(){
  player.reset();
  allEnemies.forEach((enemy) => {
    enemy.reset();
  });
}

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
      resetAll();
      $("canvas").fadeIn("slow");
      setTimeout(() => {
        player.lives--;

        // If player runs out of lives, game over.
        if (player.lives === 0) {
          gameWindow.render('lose');
          player.lives = 3;
          player.level = 1;
          player.resetDifficulty();
          return;
        }
        gamePause = false;
      }, 1000);

      return;
    }

    // See if player has reached the water,and then increase level and difficulty
    if (player.y <= CHAR_MIN_Y) {
      console.log("Increase level");
      player.level++;
      console.log("Increase difficulty");
      player.increaseDifficulty();
      console.log("Reset player and enemies");
      resetAll();
    }
  }
}

function Window() {
  this.width = 0;
  this.height = 0;
  this.message = "";
  this.buttonCoords = [];
}

Window.prototype.drawWindow = function() {
  gamePause = true;
  ctx.fillStyle = "#000000";
  ctx.globalAlpha = 0.75;
  this.top = (canvas_height / 2) - (this.height / 2);
  this.left = (canvas_width / 2) - (this.width / 2);
  ctx.fillRect(this.left, this.top,
               this.width, this.height);
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.strokeRect(this.left, this.top,
                 this.width, this.height);
}

Window.prototype.drawButton = function(title) {
  let bWidth = 100;
  let bHeight = 40;
  let bLeft = (this.left + (this.width / 2)) - (bWidth / 2);
  let bTop = (this.top + this.height) - (bHeight + 3);
  let grd = ctx.createLinearGradient(0, 0, 0, (bHeight * 2));
  this.buttonCoords.push(
    {'top': bTop,
    'left': bLeft,
    'width': bWidth,
    'height': bHeight,
    'func': function() {
      gamePause = false;
      resetAll();
    }}
  );
  grd.addColorStop(0, '#9dbdf9');
  grd.addColorStop(1, '#2d63d7');
  ctx.fillStyle = grd;
  ctx.fillRect(bLeft, bTop, bWidth, bHeight);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title,
               bLeft + (bWidth / 2),
               bTop + (bHeight / 2));
}

Window.prototype.alert = function() {
  this.width = 300;
  this.height = 200;
  this.drawWindow();
  ctx.font = '30px sans-serif';
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(this.message,
               this.left + (this.width / 2),
               this.top + (this.height / 2));
}

Window.prototype.render = function(type) {
  switch(type) {
    case "lose":
      this.message = "You Lose!";
      this.alert();
      this.drawButton("Play Again?");
      break;
  }
}

const gameWindow = new Window();

// Enemies our player must avoid
function Enemy(startingX, startingY) {
  this.sprite = SPRITES['enemy'];
  this.startX = startingX;
  this.x = startingX;
  this.startY = startingY;
  this.y = startingY;
  this.coefficient = Math.random() * 5;
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

Enemy.prototype.setDifficulty = function() {
  this.coefficient = (Math.random() + player.difficulty) * 5;
}

function Player() {
  this.sprite = SPRITES['player'];
  this.startX = CHAR_STARTING_X;
  this.x = this.startX;
  this.startY = CHAR_STARTING_Y;
  this.y = this.startY;
  this.lives = 1;
  this.level = 1;
  this.difficulty = 0;
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
  this.showStatus();
};

Player.prototype.showStatus = function() {
  for (let i = 0; i < this.lives; i++){
    let pos = (i + 1) * 32;
    ctx.drawImage(Resources.get(SPRITES['heart']), 370 + pos, 0, 32, 48);
  }
  ctx.font = '30px sans-serif';
  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`Level: ${player.level}`, 10, 35);
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

Player.prototype.increaseDifficulty = function(){
  this.difficulty += 10;
  allEnemies.forEach((enemy) => {
    enemy.setDifficulty();
  });
}

Player.prototype.resetDifficulty = function() {
  this.difficulty = 0;
  allEnemies.forEach((enemy) => {
    enemy.setDifficulty();
  });
}

const allEnemies = [
  new Enemy(-50, 50),
  new Enemy(-202, 135),
  new Enemy(-101, 215)
];

const player = new Player();

const checkExist = setInterval(() => {
  if ($('#canvas').length) {
    console.log('Found the canvas');
    clearInterval(checkExist);
    $('#canvas').on('click', (e) => {
      let offset = $('#canvas').offset();
      let left = offset.left;
      let top = offset.top;
      let x = e.pageX - left;
      let y = e.pageY - top;

      console.log(`Click X: ${x} Y: ${y}`);
      gameWindow.buttonCoords.forEach((b) => {

        console.log(`Btn left: ${b['left']} width: ${b['width']} top: ${b['top']} height: ${b['height']}`);
        if (y > b['top'] && y < b['top'] + b['height'] &&
            x > b['left'] && x < b['left'] + b['width']) {
          b['func']();
        }
      });
    });
  }
}, 100);

document.addEventListener('keyup', (e) => {
  const allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // If player hits the P key, then pause.
  if (e.keyCode === 80){
    gamePause = !gamePause;
  }

  console.log("key code: " + e.keyCode);

  if (!gamePause) {
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
