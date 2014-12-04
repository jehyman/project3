// Miscellaneous global variables encapsulated in an object
var GameValues = {
    "rowHeight": 83,            // size of each row and col in the game grid
    "colWidth": 101,
    "canvasWidth": 505,
    "numRows": 6,               // number of rows and columns in the game grid
    "numCols": 5,
    "collisionTolerance": 25,   // bug must be "slightly" inside the player's col for a collision
    "rowCombinations": [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], // see "stopAndResetAllEntities()"
    "firstGame": true,          // for displying "initial" game modal
    "totalTries": 0,            // for keeping score
    "wins": 0
};

// Enemies our player must avoid
var Enemy = function (x, row, step, sprite) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.initX = this.x = x;            // save initial values for reset before each new game
    this.initRow = this.row = row;
    this.initStep = this.step = step;   // step < 0 means bug travels right to left,
                                        // step will be reset in "Enemy.reset()"
    this.stopped = true;                // bugs don't move until start button clicked

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    // The string name of the sprite
    this.sprite = sprite;
};

// "static" constant - stored once, shared by ALL instances of Enemy
// This "vertical" offset is needed to place the bug appropriately
Enemy.bugOffset = -25;

// After each game, all entities are "stopped", a modal is displayed.
// When the user presses the "start button", all entities are "started"
Enemy.prototype.stop = function () {
    this.stopped = true;
};

Enemy.prototype.start = function () {
    this.stopped = false;
};

// called before the start of each game
Enemy.prototype.reset = function () {
    this.x = this.initX;
    // slightly modify, randomly, the speed of the bug for each game
    if (this.initStep > 0) {
        this.step = Math.floor((this.initStep - 50) + Math.random() * 300);
    } else {
        this.step = -Math.floor((Math.abs(this.initStep) - 50) + Math.random() * 300);
    }
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.stopped) {
        return;
    }
    this.x += this.step * dt;
    if (this.x > GameValues.canvasWidth) {
        this.x = -GameValues.colWidth;
    } else if (this.x < -GameValues.colWidth) { // some bugs travel right to left
        this.x = GameValues.canvasWidth;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    if (this.stopped) {
        return;
    }
    ctx.drawImage(Resources.get(this.sprite), this.x, Enemy.bugOffset + this.row * GameValues.rowHeight);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (col, row) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.initCol = this.col = col;  // save initial values for reset
    this.initRow = this.row = row;
    this.moves = [];                // store user input - produced by arrow key
    this.stopped = true;
    this.loverCol = 0;  // "loverCol" initialized in "reset(), row for lover is 0 - in the water!
    this.won = false;
    this.passiveLover = "images/char-boy.png";
    this.activeLover = "images/char-princess-girl.png";
    this.isBoyActiveLover = false;  // princess is the initial "active lover" - I'm not sexist!
};

// "static" constants for "class" Player - stored once, shared by ALL instances of Player
// These "vertical" offsets are needed to place the boy and princess appropriately.
// Since the two sprites are different sizes, the offsets are different.
// The water offsets are different so that the sprites don't extend off the canvas.
Player.boyOffset = -30;
Player.princessOffset = -22;
Player.boyWaterOffset = -10;
Player.princessWaterOffset = -2;

Player.prototype.stop = function () {
    this.stopped = true;
};

Player.prototype.start = function () {
    this.stopped = false;
};

Player.prototype.reset = function () {
    this.col = this.initCol;
    this.row = this.initRow;
    // randomly change column for each game
    this.loverCol = Math.floor(Math.random() * 5);
};

Player.prototype.handleInput = function (input) {
    if (this.stopped) {
        return;
    }
    if (input) {
        this.moves.push(input);
    }
};

// Update the player's position, required method for game
Player.prototype.update = function () {
    if (this.stopped) {
        return;
    }
    if (this.moves.length > 0) {
        var theMove = this.moves.shift();
        if (theMove === "up") {
            if (this.row > 0) {
                this.row--;
            }
        } else if (theMove === "down") {
            if (this.row < GameValues.numRows - 1) {
                this.row++;
            }
        } else if (theMove === "left") {
            if (this.col > 0) {
                this.col--;
            }
        } else if (theMove === "right") {
            if (this.col < GameValues.numCols - 1) {
                this.col++;
            }
        }
    }
};

// Draw the player on the screen, required method for game
// As described above, the "water" offsets, row 0, are different.
// The drawing depends upon which lover, boy or princess, is the active lover.
Player.prototype.render = function () {
    if (this.row === 0) {
        if (this.isBoyActiveLover) {
            ctx.drawImage(Resources.get(this.activeLover), this.col * GameValues.colWidth, Player.boyWaterOffset);  // row is 0
        } else {
            ctx.drawImage(Resources.get(this.activeLover), this.col * GameValues.colWidth, Player.princessWaterOffset);
        }
    } else {
        if (this.isBoyActiveLover) {
            ctx.drawImage(Resources.get(this.activeLover), this.col * GameValues.colWidth, this.row * GameValues.rowHeight + Player.boyOffset);
        } else {
            ctx.drawImage(Resources.get(this.activeLover), this.col * GameValues.colWidth, this.row * GameValues.rowHeight + Player.princessOffset);
        }
    }
};

Player.prototype.renderPassiveLover = function () { // drawn in row 0, the water
    if (this.isBoyActiveLover) {
        ctx.drawImage(Resources.get(this.passiveLover), this.loverCol * GameValues.colWidth, Player.princessWaterOffset);
    } else {
        ctx.drawImage(Resources.get(this.passiveLover), this.loverCol * GameValues.colWidth, Player.boyWaterOffset);
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];

var slowBug = new Enemy(0, 2, 200, 'images/enemy-bug.png');
var fastBug = new Enemy(-500, 1, 350, 'images/enemy-bug.png');
var reverseBug = new Enemy(700, 3, -200, 'images/enemy-bug-reverse.png');

allEnemies.push(slowBug);
allEnemies.push(fastBug);
allEnemies.push(reverseBug);

var player = new Player(2, 5);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

//-------------------------------------------------------------
// called in Engine.js after a game has ended
function stopAndResetAllEntities() {
    player.stop();
    player.reset();
    // randomly change the rows for the bugs each game, "rowCombinations" has all possible combinations for 3 bugs on 3 different rows
    var oneCombination = GameValues.rowCombinations[Math.floor(Math.random() * 6)];
    var i = 0;
    allEnemies.forEach(function (enemy) {
        enemy.row = oneCombination[i++];
        if (i === 3) {                   // in case there are more than 3 bugs
            i = 0;
        }
        enemy.stop();
        enemy.reset();
    });
}

// called in Engine.js after a game has ended
function drawAppropriateModal() {
    if (GameValues.firstGame) {
        GameValues.firstGame = false;
        $('#StartModal').modal('show');
    } else if (player.won) {
        GameValues.totalTries++;
        GameValues.wins++;
        $('.score').text("Score:   wins: " + GameValues.wins + " Total Games: " + GameValues.totalTries);
        $('#WonModal a:last').tab('show');
        $('#WonModal').modal('show');
    } else {
        GameValues.totalTries++;
        $('.score').text("Score:   wins: " + GameValues.wins + " Total Games: " + GameValues.totalTries);
        $('#LostModal a:last').tab('show');
        $('#LostModal').modal('show');
    }
}
//--------------------------------------------

// called when start button in modal clicked
function StartAllEntities() {
    player.start();
    allEnemies.forEach(function (enemy) {
        enemy.start();
    });
}

// StartGame Button - in modal for the first game
$('#StartGame').on("click", function () {
    StartAllEntities();
    $('#StartModal').modal('hide');
});

// StartGameWon Button - in modal after the player has won
$('#StartGameWin').on("click", function () {
    StartAllEntities();
    $('#WonModal').modal('hide');
});

// StartGameLost Button - in modal after player has lost
$('#StartGameLost').on("click", function () {
    StartAllEntities();
    $('#LostModal').modal('hide');
});

//----------------------------
// Selective active lover - used in "settings" tab in modals
// when user clicks on boy
$('.boy').on("click", function () {
    player.activeLover = "images/char-boy.png";
    player.passiveLover = "images/char-princess-girl.png";
    player.isBoyActiveLover = true;
    $('.boy').css("border", "10px solid #14b0b0");
    $('.princess').css("border", "none");
});

// when user clicks on princess
$('.princess').on("click", function () {
    player.activeLover = "images/char-princess-girl.png";
    player.passiveLover = "images/char-boy.png";
    player.isBoyActiveLover = false;
    $('.princess').css("border", "10px solid #14b0b0");
    $('.boy').css("border", "none");
});