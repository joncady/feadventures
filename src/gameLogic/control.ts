import state from './gameState';
import { MULTIPLIER, REFRESH_RATE, HEALTH_SPAWN_TIME, ENEMY_SPAWN_TIME } from './constants';
import Player from '../characters/player';
import $ from 'jquery';
import Enemy from '../characters/enemy';
import { differenceXY, distanceCalculation, getRandomInt, returnAngle } from './helpers';
import HealthItem from '../items/healthItem';
import audioPlayer from './music';
import stages from '../stageScripts/stages';
import GameStages from './gameStages';
import Obstacle from '../obstacles/obstacle';

let stage = 1;
let chars = [];
let gameStarted = false;
let keyDown;
let keyUp;
let controllerOption;
// imported from gameStages.js
state.game = new GameStages(1, 1, beginStage, reset);

window.onload = function () {
    let playButton = document.getElementById("music");
    playButton.addEventListener("click", () => audioPlayer.playMusic());
    let fullButton = document.getElementById("fullscreen");
    fullButton.addEventListener("click", () => {
        document.body.requestFullscreen();
    });
    startingGame();
    console.log('loaded')
}

function getInputs() {
    fetch("http://localhost:8080").then((response) => {
        return response.json();
    }).then((data) => {
        data.forEach((player, index) => {
            if (index < state.playerList.length) {
                state.playerList[index].moveCharacter(player, index);
            }
        })
    });
}

function setStatus() {
    let status = document.getElementById("indicator");
    let countdown = document.getElementById("countdown");
    let overallStatus = document.getElementById("game-status");
    let count = 3;
    countdown.innerText = String(count);
    overallStatus.classList.remove("hide");
    status.innerText = String(state.game.getStage());
    let timer = setInterval(() => {
        countdown.innerText = String(count);
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
    state.intervals.enemyTimer = window.setInterval(() => {
        let field = document.getElementById("game-area");
        let enemies = state.enemiesList.length;
        let enemiesLeft = state.game.getCount();
        if (enemies < enemiesLeft) {
            let type = types[Math.floor(Math.random() * types.length)];
            let el = document.createElement("div");
            let healthBar = document.createElement("progress");
            healthBar.value = type.health;
            healthBar.max = type.health;
            healthBar.classList.add("health");
            el.appendChild(healthBar);
            el.classList.add("enemy");
            let { x, y } = chooseRandomSpawn();
            el.style.top = x + "px";
            el.style.left = y + "px";
            let enemyObj = new Enemy(type.name, el, type.health, healthBar, x, y, type.attack, type.speed, type.attackChance);
            el.classList.add(type.name);
            state.enemiesList.push(enemyObj);
            field.appendChild(el);
        }
    }, ENEMY_SPAWN_TIME * decay());
}

function decay() {
    let decayValue = Math.pow(Math.E, - MULTIPLIER * (state.game.getStage() - 1));
    return decayValue;
}

function reset() {
    state.playerKeys[0] = {
        axes: {
            mainStickVertical: 0,
            mainStickHorizontal: 0
        },
        buttons: {
            buttonA: false
        }
    }

    state.playerList = [];
    state.enemiesList = [];
    let selected = document.querySelectorAll(".selected");
    selected.forEach((it) => {
        it.classList.remove("selected");
    });
    showGameOver();
}

function showGameOver() {
    let gameOverArea = document.getElementById("gameover"); 
    gameOverArea.classList.remove("hide");
    let startOverButton = document.getElementById("gameover-button");
    let gameArea = document.getElementById("game-area");
    gameArea.classList.add("hide");
    startOverButton.addEventListener("click", () => {
        startingGame();
        gameOverArea.classList.add("hide");
    });
}

function beginStage() {
    state.obstacleList = [];
    state.projectileList = [];
    // let stage = stages[game.getStage() - 1];
    let stage = stages[0];
    let obstacles = stage.obstacles;
    let gameArea = document.getElementById("game-area");
    gameArea.style.backgroundImage = stage.mapTitle;
    let localGameGrid = new Array();
    for (let i = 0; i < gameArea.offsetHeight; i++) {
        localGameGrid.push(new Array(gameArea.offsetWidth).fill(0));
    }
    state.gameGrid = localGameGrid;
    obstacles.forEach((obstacle) => {
        let [x, y, width, height] = obstacle;
        console.log(x, y, width, height)
        for (let i = x; i < x + width; i++) {
            for (let j = y; j < y + height; j++) {
                state.gameGrid[j][i] = 1;
            }
        }
        let newObs = new Obstacle(x, y, width, height);
        state.obstacleList.push(newObs);
        gameArea.appendChild(newObs.obj);
    });
    setStatus();
    setTimeout(() => {
        if (state.intervals.checkEnemies !== null && state.intervals.enemyTimer !== null) {
            clearInterval(state.intervals.enemyTimer);
            clearInterval(state.intervals.checkPosition);
            clearInterval(state.intervals.checkEnemies);
            clearInterval(state.intervals.healthTimer);
        }
        if (controllerOption == "keyboard" && state.game.getStage() == 1 && !gameStarted) {
            gameStarted = true;
            setKeys();
        }
        // player check
        state.intervals.checkPosition = window.setInterval(() => {
            if (controllerOption == "controller") {
                getInputs();
            } else {
                readKeys();
            }
        }, (controllerOption == "controller") ? REFRESH_RATE / 2 : REFRESH_RATE * .75);
        state.intervals.healthTimer = window.setInterval(shouldSpawnHealthItem, HEALTH_SPAWN_TIME);
        createEnemies();
        // enemies
        state.intervals.checkEnemies = window.setInterval(() => {
            enemiesCheck();
        }, REFRESH_RATE * 2);
    }), 4000;
}

function readKeys() {
    state.playerList.forEach((player, i) => {
        player.moveCharacter(state.playerKeys[i], 0);
    })
}

function setKeys() {
    keyDown = (ev) => {
        if (ev.repeat == false) {
            // player 1
            let { mainStickVertical: mainStickVertical1, mainStickHorizontal: mainStickHorizontal1 } = state.playerKeys[0].axes;
            if (ev.key == "w" && mainStickVertical1 != 1) {
                state.playerKeys[0].axes.mainStickVertical += 1;
            } else if (ev.key == "a" && mainStickHorizontal1 != -1) {
                state.playerKeys[0].axes.mainStickHorizontal += -1;
            } else if (ev.key == "s" && mainStickVertical1 != -1) {
                state.playerKeys[0].axes.mainStickVertical += -1;
            } else if (ev.key == "d" && mainStickHorizontal1 != 1) {
                state.playerKeys[0].axes.mainStickHorizontal += 1;
            } else if (ev.key == " ") {
                ev.preventDefault();
                state.playerKeys[0].buttons.buttonA = true;
            }

            // player 2
            if (state.playerList[1]) {
                let { mainStickVertical: mainStickVertical2, mainStickHorizontal: mainStickHorizontal2 } = state.playerKeys[1].axes;
                if (ev.key == "ArrowUp" && mainStickVertical2 != 1) {
                    state.playerKeys[1].axes.mainStickVertical += 1;
                } else if (ev.key == "ArrowLeft" && mainStickHorizontal2 != -1) {
                    state.playerKeys[1].axes.mainStickHorizontal += -1;
                } else if (ev.key == "ArrowDown" && mainStickVertical2 != -1) {
                    state.playerKeys[1].axes.mainStickVertical += -1;
                } else if (ev.key == "ArrowRight" && mainStickHorizontal2 != 1) {
                    state.playerKeys[1].axes.mainStickHorizontal += 1;
                } else if (ev.key == "Enter") {
                    ev.preventDefault();
                    state.playerKeys[1].buttons.buttonA = true;
                }
            }
        }
    };
    keyUp = (ev) => {
        ev.preventDefault();
        // player 1
        if (ev.key == "w") {
            state.playerKeys[0].axes.mainStickVertical -= 1;
        } else if (ev.key == "a") {
            state.playerKeys[0].axes.mainStickHorizontal += 1;
        } else if (ev.key == "s") {
            state.playerKeys[0].axes.mainStickVertical += 1;
        } else if (ev.key == "d") {
            state.playerKeys[0].axes.mainStickHorizontal -= 1;
        } else if (ev.key == " ") {
            ev.preventDefault();
            state.playerKeys[0].buttons.buttonA = false;
        }

        // player 2
        if (state.playerList[1]) {
            if (ev.key == "ArrowUp") {
                state.playerKeys[1].axes.mainStickVertical -= 1;
            } else if (ev.key == "ArrowLeft") {
                state.playerKeys[1].axes.mainStickHorizontal += 1;
            } else if (ev.key == "ArrowDown") {
                state.playerKeys[1].axes.mainStickVertical += 1;
            } else if (ev.key == "ArrowRight") {
                state.playerKeys[1].axes.mainStickHorizontal -= 1;
            } else if (ev.key == "Enter") {
                state.playerKeys[1].buttons.buttonA = false;
            }
        }
    };
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
}

function startingGame() {
    let startScreen = document.getElementById("startup");
    let gameArea = document.getElementById("game-area");
    gameArea.classList.remove("hide");
    gameArea.style.backgroundImage = "url('assets/titleScreen.png')";
    startScreen.classList.remove("hide");
    let controller = document.getElementById("controller");
    let keyboard = document.getElementById("keyboard");
    // removed controller from options
    let options = [keyboard];
    if (!gameStarted) {
        options.forEach((option) => {
            option.addEventListener(("click"), () => {
                controllerOption = option.id;
                startScreen.classList.add("hide");
                chooseCharacter();
            });
        });
    }
}

function createCharacters(players) {
    players.forEach((player, index) => {
        let playerEl = document.createElement("div");
        playerEl.id = `player${index + 1}`;
        let healthBar = document.createElement("progress");
        healthBar.value = 100;
        healthBar.max = 100;
        healthBar.classList.add("health");
        playerEl.appendChild(healthBar);
        playerEl.classList.add(player);
        playerEl.classList.add("player");
        $("#game-area").append(playerEl);
        state.playerList[index] = new Player(100, 100, playerEl, healthBar);
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
                    let img = character.childNodes[1] as HTMLImageElement;
                    img.src = `assets/${character.id}Portrait1.png`;
                    img.classList.remove("selected");
                } else {
                    let img = character.childNodes[1] as HTMLImageElement;
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
    state.enemiesList.forEach((enemy) => {
        let closestPlayer;
        let closestDistance;
        let { x, y } = enemy.getLocation();
        state.playerList.forEach((player) => {
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

function shouldSpawnHealthItem() {
    let randomNum = getRandomInt(100);
    if (state.healthItemList.length === 0 && randomNum > 95) {
        let { x, y } = chooseRandomSpawn();
        let item = new HealthItem(x, y, 15, 15, 25);
        state.healthItemList.push(item);
        let field = document.getElementById("game-area");
        field.appendChild(item.obj);
    }
}

function chooseRandomSpawn() {
    let field = document.getElementById("game-area");
    let width = field.clientWidth;
    let height = field.clientHeight;
    let notAllowed = true;
    let x;
    let y;
    // Shold this be refactored to use gameGrid?
    while (notAllowed) {
        x = Math.random() * (width - 75);
        y = Math.random() * (height - 75);
        let allowed = true;

        state.obstacleList.forEach((obstacle) => {
            let test = obstacle.checkBoundary(x, y, 50, 50);
            if (test) {
                allowed = false;
            }
        });
        if (allowed) {
            notAllowed = false;
        }
    }
    return {
        x,
        y
    }
}


