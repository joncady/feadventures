"use strict";

let moveDistance = 10;
let refreshRate = 100;
let multiplier = 0.1;
let enemySpawnTime = 5000;
let stage = 1;
let enemiesList = [];
let playerList = [];
let obstacleList = [];
let chars = [];
let gameStarted = false;
let keyDown;
let keyUp;
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
let game = new GameStages(1, 3, beginStage);
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
        { name: "soldier", attack: 10, health: 100, speed: 10, attackChance: 6 },
        { name: "assassin", attack: 15, health: 60, speed: 13, attackChance: 8 },
        { name: "heavy", attack: 20, health: 140, speed: 5, attackChance: 12 },
        { name: "knight", attack: 12, health: 120, speed: 13, attackChance: 6 },
        { name: "archer", attack: 10, health: 90, speed: 8, attackChance: 8 }
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

function reset() {
    lastButtonA = [false, false, false, false];
    keys = {
        axes: {
            mainStickVertical: 0,
            mainStickHorizontal: 0
        },
        buttons: {
            buttonA: false
        }
    }
    playerList = [];
    enemiesList = [];
    // document.removeEventListener("keydown", keyDown);
    // document.removeEventListener("keyup", keyUp);
    // keyDown = null;
    // keyUp = null;
    let selected = document.querySelectorAll(".selected");
    selected.forEach((it) => {
        it.classList.remove("selected");
    })
    startingGame();
}

function beginStage() {
    obstacleList = [];
    // let stage = stages[game.getStage() - 1];
    let stage = stages[0];
    let obstacles = stage.obstacles;
    let gameArea = document.getElementById("game-area");
    gameArea.style.backgroundImage = stage.mapTitle;
    obstacles.forEach((obstacle) => {
        let newObs = new Obstacle(obstacle[0], obstacle[1], obstacle[2], obstacle[3]);
        obstacleList.push(newObs);
        gameArea.appendChild(newObs.obj);
    });
    setStatus();
    setTimeout(() => {
        if (intervals.checkEnemies !== null && intervals.enemyTimer !== null) {
            clearInterval(intervals.enemyTimer);
            clearInterval(intervals.checkPosition);
            clearInterval(intervals.checkEnemies);
        }
        if (controllerOption == "keyboard" && game.getStage() == 1 && !gameStarted) {
            setKeys();
        }
        // player check
        intervals.checkPosition = setInterval(() => {
            if (controllerOption == "controller") {
                getInputs();
            } else {
                readKeys();
            }
        }, refreshRate);
        createEnemies();
        // enemies
        intervals.checkEnemies = setInterval(() => {
            enemiesCheck();
        }, refreshRate * 2);
    }), 4000;
}

function readKeys() {
    playerList[0].moveCharacter(keys, 0);
}

function setKeys() {
    keyDown = (ev) => {
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
            } else if (ev.key == " ") {
                ev.preventDefault();
                keys.buttons.buttonA = true;
            }
        }
    };
    keyUp = (ev) => {
        if (ev.key == "w") {
            keys.axes.mainStickVertical -= 1;
        } else if (ev.key == "a") {
            keys.axes.mainStickHorizontal += 1;
        } else if (ev.key == "s") {
            keys.axes.mainStickVertical += 1;
        } else if (ev.key == "d") {
            keys.axes.mainStickHorizontal -= 1;
        } else if (ev.key == " ") {
            ev.preventDefault();
            keys.buttons.buttonA = false;
        }
    };
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
}

function startingGame() {
    let startScreen = document.getElementById("startup");
    let gameArea = document.getElementById("game-area");
    gameArea.style.backgroundImage = "url('assets/titleScreen.png')";
    startScreen.classList.remove("hide");
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
        let playerEl = document.createElement("div");
        playerEl.id = `player${index + 1}`;
        let healthBar = document.createElement("progress");
        healthBar.value = 100;
        healthBar.max = 100;
        healthBar.min = 0;
        healthBar.classList.add("health");
        playerEl.appendChild(healthBar);
        playerEl.classList.add(player);
        playerEl.classList.add("player");
        $("#game-area").append(playerEl);
        playerList[index] = new Player(100, 100, playerEl, healthBar);
    });
    beginStage();
}

// Allows the user to decide on which character to play
// Creates the characters once there are more than one selected
function chooseCharacter() {
    let charsEl = document.getElementById("characters");
    charsEl.classList.remove("hide");
    chars = [];
    let characters = document.querySelectorAll(".character");
    let confirm = document.getElementById("start");
    if (!gameStarted) {
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
        });
    }
}

// [hope to change] - Does an enemy attack round
function enemiesCheck() {
    // do randomization
    enemiesList.forEach((enemy) => {
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
            let playerXY = closestPlayer.getLocation();
            let { diffX, diffY } = differenceXY(x, y, playerXY.x, playerXY.y);
            let angle = returnAngle(x, y, playerValues.x, playerValues.y);
            let xAngle = Math.cos(angle);
            let yAngle = Math.sin(angle);
            if (diffX < 0) {
                xAngle *= -1;
                yAngle *= -1;
            }
            let reverse = 1;
            if (enemy.type === "archer") {
                reverse = -1;
            }
            let randomPattern = getRandomInt(10);
            if (randomPattern > 6) {
                enemy.attackPlayer(xAngle, yAngle, angle);
            } else {
                x = x + enemy.speed * xAngle * reverse;
                y = y + enemy.speed * yAngle * reverse;
                enemy.choosePicture(xAngle, yAngle, enemy.el);
                enemy.moveEnemy(x, y);
            }
        });
    });
}

/* 
 * Helper functions
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function returnAngle(x1, y1, x2, y2) {
    let equation = (y2 - y1) / (x2 - x1);
    return Math.atan(equation);
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

function toDegrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}