"use strict";

let moveDistance = 10;
let refreshRate = 100;
let multiplier = 0.1;
let enemySpawnTime = 1000;
let stage = 1;
let enemiesList = [];
let playerList = [];
let obstacleList = [];
let keys = {
    axes: {
        mainStickVertical: 0,
        mainStickHorizontal: 0
    },
    buttons: {
        buttonA: false
    }
}
let controllerOption;
let lastButtonA = [false, false, false, false];
// imported from music.js
let audioPlayer = new PlayAudio();
// imported from gameStages.js
let game = new GameStages(1, 1, beginStage);
// intervals to be cleared on game end and at the end of each stage
let intervals = { checkPosition: null, checkEnemies: null, enemyTimer: null }

// 
window.onload = function () {
    let playButton = document.getElementById("music");
    playButton.addEventListener("click", () => audioPlayer.playMusic());
    let fullButton = document.getElementById("fullscreen");
    fullButton.addEventListener("click", () => {
        document.body.requestFullscreen();
    });
    startingGame();
}

function endPlay() {
    console.log("game over");
}

function getInputs() {
    fetch("http://localhost:8080").then((response) => {
        return response.json();
    }).then((data) => {
        data.forEach((player, index) => {
            if (index < playerList.length) {
                playerList[index].moveCharacter(player, index);
            }
        })
    });
}

function setStatus() {
    let status = document.getElementById("indicator");
    let countdown = document.getElementById("countdown");
    let overallStatus = document.getElementById("game-status");
    let count = 3;
    countdown.innerText = count;
    overallStatus.classList.remove("hide");
    status.innerText = game.getStage();
    let timer = setInterval(() => {
        countdown.innerText = count;
        count -= 1;
        if (count < 0) {
            overallStatus.classList.add("hide");
            countdown.innerText = "";
            clearInterval(timer);
        }
    }, 1000);
}

function createEnemies() {
    let types = [
        { name: "soldier", attack: 10, health: 100, speed: 10 },
        { name: "assassin", attack: 15, health: 60, speed: 15 },
        { name: "heavy", attack: 20, health: 140, speed: 5 },
        { name: "knight", attack: 12, health: 120, speed: 15 }
    ];
    let field = document.getElementById("game-area");
    let width = field.clientWidth;
    let height = field.clientHeight;
    intervals.enemyTimer = setInterval(() => {
        let enemies = enemiesList.length;
        let enemiesLeft = game.getCount();
        if (enemies < enemiesLeft) {
            let type = types[Math.floor(Math.random() * types.length)];
            let el = document.createElement("div");
            let healthBar = document.createElement("progress");
            healthBar.value = type.health;
            healthBar.max = type.health;
            healthBar.min = 0;
            healthBar.classList.add("health");
            el.appendChild(healthBar);
            el.classList.add("enemy");
            let notAllowed = true;
            let x;
            let y;
            while (notAllowed) {
                x = Math.random() * (width - 75);
                y = Math.random() * (height - 75);
                let allowed = true;
                obstacleList.forEach((obstacle) => {
                    let test = obstacle.checkBoundary(x, y, 50, 50);
                    if (test) {
                        allowed = false;
                    }
                });
                if (allowed) {
                    notAllowed = false;
                }
            }
            el.style.top = x + "px";
            el.style.left = y + "px";
            let enemyObj = new Enemy(type.name, el, type.health, healthBar, x, y, type.attack, type.speed);
            el.classList.add(type.name);
            enemiesList.push(enemyObj);
            field.appendChild(el);
        }
    }, enemySpawnTime * decay());
}

function decay() {
    let decayValue = Math.pow(Math.E, - multiplier * (game.getStage() - 1));
    return decayValue;
}

function beginStage() {
    let box = new Obstacle(216, 104, 202, 50);
    let box2 = new Obstacle(634, 226, 262, 318);
    let box3 = new Obstacle(0, 396, 132, 148);
    let box4 = new Obstacle(0, 0, 150, 78);
    let box5 = new Obstacle(708, 56, 120, 40);
    let box6 = new Obstacle(412, 484, 230, 60);
    let box7 = new Obstacle(144, 0, 82, 36);
    let box8 = new Obstacle(0, 360, 44, 44);
    let box9 = new Obstacle(404, 64, 46, 42);
    let box10 = new Obstacle(458, 412, 192, 72);
    let box11 = new Obstacle(576, 292, 72, 120);
    let box12 = new Obstacle(546, 0, 30, 17);
    let box13 = new Obstacle(540, 80, 36, 80);
    let box14 = new Obstacle(576, 130, 70, 18);
    let box15 = new Obstacle(272, 334, 68, 74);
    obstacleList.push(box, box2, box3, box4, box5, box6, box7, box8, box9, box10, box11, box12, box13, box14, box15);
    setStatus();
    setTimeout(() => {
        if (intervals.checkEnemies !== null && intervals.enemyTimer !== null) {
            clearInterval(intervals.enemyTimer);
            clearInterval(intervals.checkPosition);
            clearInterval(intervals.checkEnemies);
        }
        if (controllerOption == "keyboard" && game.getStage() == 1) {
            setKeys();
        }
        intervals.checkPosition = setInterval(() => {
            if (controllerOption == "controller") {
                getInputs();
            } else {
                readKeys();
            }
        }, refreshRate);
        createEnemies();
        intervals.checkEnemies = setInterval(() => {
            enemiesCheck();
        }, refreshRate * 2);
    }), 4000;
}

function readKeys() {
    playerList[0].moveCharacter(keys, 0);
}

function setKeys() {
    document.addEventListener("keydown", (ev) => {
        let { mainStickVertical, mainStickHorizontal } = keys.axes;
        if (ev.repeat == false) {
            if (ev.key == "w" && mainStickVertical != 1) {
                keys.axes.mainStickVertical += 1;
            } else if (ev.key == "a" && mainStickHorizontal != -1) {
                keys.axes.mainStickHorizontal += -1;
            } else if (ev.key == "s" && mainStickVertical != -1) {
                keys.axes.mainStickVertical += -1;
            } else if (ev.key == "d" && mainStickHorizontal != 1) {
                keys.axes.mainStickHorizontal += 1;
            } else if (ev.key == "Enter") {
                keys.buttons.buttonA = true;
            }
        }
    }, false);
    document.addEventListener("keyup", (ev) => {
        if (ev.key == "w") {
            keys.axes.mainStickVertical -= 1;
        } else if (ev.key == "a") {
            keys.axes.mainStickHorizontal += 1;
        } else if (ev.key == "s") {
            keys.axes.mainStickVertical += 1;
        } else if (ev.key == "d") {
            keys.axes.mainStickHorizontal -= 1;
        } else if (ev.key == "Enter") {
            keys.buttons.buttonA = false;
        }
    }, false);
}

function startingGame() {
    let startScreen = document.getElementById("startup");
    let controller = document.getElementById("controller");
    let keyboard = document.getElementById("keyboard");
    let options = [controller, keyboard];
    options.forEach((option) => {
        option.addEventListener(("click"), () => {
            controllerOption = option.id;
            startScreen.classList.add("hide");
            chooseCharacter();
        });
    });
}

function createCharacters(players) {
    players.forEach((player, index) => {
        let character = document.getElementById(`player${index + 1}`);
        let healthBar = document.createElement("progress");
        healthBar.value = 100;
        healthBar.max = 100;
        healthBar.min = 0;
        healthBar.classList.add("health");
        character.appendChild(healthBar);
        character.classList.add(player);
        playerList[index] = new Player(100, 100, character, healthBar);
    });
    beginStage();
}

// Allows the user to decide on which character to play
// Creates the characters once there are more than one selected
function chooseCharacter() {
    let charsEl = document.getElementById("characters");
    charsEl.classList.remove("hide");
    let chars = []
    let characters = document.querySelectorAll(".character");
    let confirm = document.getElementById("start");
    confirm.addEventListener("click", () => {
        if (chars.length > 0) {
            createCharacters(chars);
            charsEl.classList.add("hide");
        }
    });
    characters.forEach((character) => {
        character.addEventListener("click", () => {
            if (chars.indexOf(character.id) >= 0) {
                let index = chars.indexOf(character.id);
                chars.splice(index, 1);
                let img = character.childNodes[1];
                img.src = `assets/${character.id}Portrait1.png`;
                img.classList.remove("selected");
            } else {
                let img = character.childNodes[1];
                img.src = `assets/${character.id}Portrait2.png`;
                img.classList.add("selected");
                chars.push(character.id);
            }
        });
    })
}

// [hope to change] - Does an enemy attack round
function enemiesCheck() {
    // do randomization
    enemiesList.forEach((enemy) => {
        let randomPattern = getRandomInt(10);
        if (randomPattern > 6) {
            enemy.attackPlayer();
        } else {
            let closestPlayer;
            let closestDistance;
            let { x, y } = enemy.getLocation();
            playerList.forEach((player) => {
                let playerValues = player.getLocation();
                let distance = distanceCalculation(x, y, playerValues.x, playerValues.y);
                if (closestPlayer == null) {
                    closestPlayer = player;
                    closestDistance = distance;
                } else {
                    if (distance < closestDistance) {
                        closestPlayer = player;
                        closestDistance = distance;
                    }
                }
            });
            let playerXY = closestPlayer.getLocation();
            let { diffX, diffY } = differenceXY(x, y, playerXY.x, playerXY.y);
            let moveX = 0;
            let moveY = 0;
            if (diffX > 0) {
                moveX += 1;
            } else if (diffX < 0) {
                moveX -= 1;
            }
            if (diffY > 0) {
                moveY += 1;
            } else if (diffY < 0) {
                moveY -= 1;
            }
            x = x + enemy.speed * moveX;
            y = y + enemy.speed * moveY;
            enemy.choosePicture(moveX, moveY, enemy.el);
            enemy.moveEnemy(x, y);
        }
    });
}

/* 
 * Helper functions
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function differenceXY(x1, y1, x2, y2) {
    return { diffX: x2 - x1, diffY: y2 - y1 };
}

function distanceCalculation(x1, y1, x2, y2) {
    let term1 = Math.pow((x2 - x1), 2);
    let term2 = Math.pow((y2 - y1), 2);
    return Math.sqrt(term1 + term2);
}

function chooseDirection() {
    let amount = Math.random();
    let direction = getRandomInt(2);
    return direction == 0 ? amount : -1 * amount;
}