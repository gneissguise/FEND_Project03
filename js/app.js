const VERSION = "0.50";
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

// This value controls the animation and player movement
let gamePause = false;

// Reset player and enemies back to starting positions
function resetAll(){
  player.reset();
  allEnemies.forEach((enemy) => {
    enemy.reset();
  });
}

// Reset player state and enemies back to starting position
function fullReset(){
  resetAll();
  player.lives = 3;
  player.level = 1;
  player.resetDifficulty();
}

// Draws a triangle based on points passed to the function as:
// { x1, y1, x2, y2, x3, y3 }
function drawTriangle(points, fillStyle = "#FFFFFF") {
  ctx.fillStyle = fillStyle
  ctx.beginPath();
  ctx.moveTo(points.x1, points.y1);
  ctx.lineTo(points.x2, points.y2);
  ctx.lineTo(points.x3, points.y3);
  ctx.fill();
}

// Allows word wrapped paragraphs to render on screen.
function fillParagraph(message, left, top, width) {
  let words = message.split(' ');
  let rowHeight = 18;
  let row = '';

  ctx.font = '16px sans-serif';
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for(let word of words) {
    let testRow = row + word + ' ';
    let rowWidth = ctx.measureText(testRow).width;

    if (rowWidth > width) {
      ctx.fillText(row, left, top);
      row = word + ' ';
      top += rowHeight;
    }
    else {
      row = testRow;
    }
  }

  ctx.fillText(row, left, top);
  return top;
}

// Does the collision detection between enemies and the player
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
      $("canvas").fadeOut("fast");
      resetAll();
      $("canvas").fadeIn("fast");
      setTimeout(() => {
        player.lives--;

        // If player runs out of lives, game over.
        if (player.lives === 0) {
          render();
          gameWindow.render('lose');
          return;
        }
        gamePause = false;
      }, 500);

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

// Class for a basic windowing system
function Window() {
  this.width = 0;
  this.height = 0;
  this.message = "";
  this.buttonCoords = [];
  this.displayed = false;
}

// Draws the window to the screen
Window.prototype.drawWindow = function() {
  gamePause = true;
  this.displayed = true;
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

// Draws a button to the screen with options passed into params
Window.prototype.drawButton = function(params, callback) {
/* params.title = "Window Title" // required
  params.size = small/large
  params.row = position
  callback = function to call when clicked. //required
*/
  let bWidth, bHeight, bLeft, bTop, bBuffer, grd;
  let bTitle = params.title;
  let bRow = params.row || 5;
  let bSize = params.size || "small";

  switch(bSize){
    case "large":
      bBuffer = bRow === 5 ? 80 :
                bRow === 4 ? 140 :
                bRow === 3 ? 200 :
                bRow === 2 ? 260 :
                bRow === 1 ? 320 : 80;
      bWidth = 300;
      bHeight = 48;
      bLeft = (this.left + (this.width / 2)) - (bWidth / 2);
      bTop = (this.top + this.height) - (bHeight + bBuffer);
      grd = ctx.createLinearGradient(0, bTop, 0, bTop + bHeight);
      ctx.font = '36px sans-serif';
      break;
    case "small":
    default:
      bBuffer = bRow === 5 ? 5 :
                bRow === 4 ? 45 :
                bRow === 3 ? 90 :
                bRow === 2 ? 135 :
                bRow === 1 ? 180 : 5;
      bWidth = 100;
      bHeight = 36;
      bLeft = (this.left + (this.width / 2)) - (bWidth / 2);
      bTop = (this.top + this.height) - (bHeight + bBuffer);
      grd = ctx.createLinearGradient(0, bTop, 0, bTop + bHeight);
      ctx.font = '16px sans-serif';
      break;
  }

  this.buttonCoords.push(
    {'row': bRow,
    'top': bTop,
    'left': bLeft,
    'width': bWidth,
    'height': bHeight,
    'func': callback}
  );

  grd.addColorStop(0, '#9dbdf9');
  grd.addColorStop(1, '#2d63d7');
  ctx.fillStyle = grd;
  ctx.fillRect(bLeft, bTop, bWidth, bHeight);
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(bTitle,
               bLeft + (bWidth / 2),
               bTop + (bHeight / 2));
}

// creates an window that displays an alert to the user
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
  this.displayed = false;
}

// Creates a window with a dialog message, allowing for yes, no answer
Window.prototype.dialog = function() {
  this.width = 300;
  this.height = 200;
  this.drawWindow();
  ctx.font = '30px sans-serif';
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(this.message,
               this.left + (this.width / 2),
               this.top + 30);
}

// General information display window, used for help and credits
Window.prototype.information = function(inf) {
  // inf.title
  // inf.message
  // inf.back = callback to go back to calling screen

  this.width = 400;
  this.height = 450;
  this.drawWindow();
  ctx.font = '30px sans-serif';
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(inf.title,
               this.left + (this.width / 2),
               this.top + 30);
  fillParagraph(inf.message, this.left + 30, this.top + 75, this.width - 30);
  drawTriangle({
    x1: this.left + 15, y1: this.top + this.height - 40,
    x2: this.left + 31, y2: this.top + this.height - 32,
    x3: this.left + 31, y3: this.top + this.height - 48
  });
  ctx.font = '16px sans-serif';
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Back", this.left + 43, this.top + this.height - 34);
  this.buttonCoords = [];
  this.buttonCoords.push(
    {'top': this.top + this.height - 48,
    'left': this.left + 15,
    'width': 64,
    'height': 16,
    'func': inf.back}
  );
}

// Initial start menu
Window.prototype.startMenu = function() {
  this.width = 400;
  this.height = 450;
  this.drawWindow();
  ctx.font = "700 48px sans-serif"
  let grd = ctx.createLinearGradient(0, this.top + 24, 0, this.top + 72);
  grd.addColorStop(0, '#b4e391');
  grd.addColorStop(0.5, '#61c419');
  grd.addColorStop(1, '#b4e391');
  ctx.fillStyle = grd;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(this.message, this.left + (this.width / 2), this.top + 48);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`Version: ${VERSION}`, this.left + this.width - 15, this.top + this.height - 15);
}

// Back to start menu
Window.prototype.exitGame = function() {
  this.buttonCoords = [];
  render();
  this.render('start');
}

// Clears the window, goes back to game
Window.prototype.clearWindow = function() {
  gamePause = false;
  this.displayed = false;
  this.buttonCoords = [];
}

// special window implementations:
// lose, pause, start, help, credits, exit
Window.prototype.render = function(type) {
  let callback;

  switch(type) {
    case "lose":
      this.message = "You Lose!";
      this.dialog();
      callback = () => {
        fullReset();
        this.clearWindow();
      };
      this.drawButton({ title: "Play Again?",
                        row: 3 }, callback);
      this.drawButton({ title: "Exit",
                        row: 4}, () => { this.exitGame(); });
      break;
    case "pause":
      this.message = "Game Paused."
      this.alert();
      break;
    case "start":
      this.message = "BUGGER";
      this.startMenu();
      callback = () => {
        fullReset();
        this.clearWindow();
      }
      this.drawButton({ title: "Start Game",
                        size: "large",
                        row: 2 }, callback);
      callback = () => {
        render();
        let msg = `This is a clone of the classic arcade game, Frogger!
        To start a new game, you may click the "Start Game" button from the
        main menu.  This will take you to the character selection screen where
        you may choose the character that you would like to play as.
        Use the left and right arrows to scroll through the list of characters,
        then click "OK" to start the game.  To play, simply move your character
        around using the arrow keys on your keyboard.  The goal is to guide your
        character to the water without hitting a bug!`;
        this.information({ title: "Help",
                           message: msg,
                           back: () => { this.exitGame(); }});
      };
      this.drawButton({ title: "Help",
                        size: "large",
                        row: 3 }, callback);
      callback = () => {
        render();
        let msg = `Game assets and starting game engine template provided by Udacity.
        Game implementation, windowing system, and enhancements to rendering system by Justin Frost.
        A little bit of jQuery was sprinkled in too for good measure!`;
        this.information({ title: "Credits",
                           message: msg,
                           back: () => { this.exitGame(); }});
      };
      this.drawButton({ title: "Credits",
                        size: "large",
                        row: 4 }, callback);
      break;
    case "exit":
      this.message = "Do you want to exit?";
      this.dialog();
      this.drawButton({ title: "Yes",
                        row: 3 }, () => { this.exitGame(); });
      this.drawButton({ title: "No",
                        row: 4 }, () => { this.clearWindow(); });
      break;
  }
}

// Constructs a new Window object
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

// Reset enemy position back to start
Enemy.prototype.reset = function() {
  this.x = this.startX;
  this.y = this.startY;
}

// Increases enemy difficulty
Enemy.prototype.setDifficulty = function() {
  this.coefficient = (Math.random() + player.difficulty) * 5;
}

// Player class
function Player() {
  this.sprite = SPRITES['player'];
  this.startX = CHAR_STARTING_X;
  this.x = this.startX;
  this.startY = CHAR_STARTING_Y;
  this.y = this.startY;
  this.lives = 3;
  this.level = 1;
  this.difficulty = 0;
  this.collision = [
    34, 126,
    68, 126,
    44, 138,
    60, 138
  ];
};

// Check for collisions
Player.prototype.update = function() {
  checkCollisions(player, allEnemies);
};

// update player movement and stats at top of screen
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  this.showStatus();
};

// Current level and lives
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

// resets player back to start
Player.prototype.reset = function() {
  this.x = this.startX;
  this.y = this.startY;
};

// controls for player movement
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

// Sets difficulty
Player.prototype.increaseDifficulty = function(){
  this.difficulty += 10;
  allEnemies.forEach((enemy) => {
    enemy.setDifficulty();
  });
}

// resets difficulty back to 0
Player.prototype.resetDifficulty = function() {
  this.difficulty = 0;
  allEnemies.forEach((enemy) => {
    enemy.setDifficulty();
  });
}

// Instantiate enemy objects
const allEnemies = [
  new Enemy(-50, 50),
  new Enemy(-202, 135),
  new Enemy(-101, 215)
];

// instantiate player object
const player = new Player();

// Wait until canvas is rendered to screen, then start
// listening for mouse clicks.  If a button is clicked,
// launch the button callback.
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

// Register keyboard lisener and map arrow keys to movement commands.
// Block movement when windows are displayed.  If P or ENTER are hit on the keyboard,
// then pause the gameplay.  If ESC is hit on the keyboard, show the exit dialog.
document.addEventListener('keyup', (e) => {
  const allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // Don't allow user keys when in game menus are displayed
  if (!gameWindow.displayed) {
    // If player hits the P key, or enter, then pause.
    if (e.keyCode === 80 || e.keyCode === 13){
      gamePause = !gamePause;
      if (gamePause) {
        gameWindow.render('pause');
      }
    }

    // If player hits ESC, then show exit dialog
    if (e.keyCode === 27) {
      gameWindow.render('exit');
    }
  }
  console.log("key code: " + e.keyCode);

  // Only allow player to control character when not Paused
  // (When menus are displayed, the game is paused by default and
  // cannot be unpaused unless a menu item is clicked)
  if (!gamePause) {
    player.handleInput(allowedKeys[e.keyCode]);
  }
});
