"use strict";

let moveDistance = 15;
let refreshRate = 100;
let multiplier = 0.1;
let enemySpawnTime = 10000;
let stage = 1;
let enemiesList = [];
let playerList = [];
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
let lastButtonA = [false, false, false];
// imported from music.js
let audioPlayer = new PlayAudio();
// imported from gameStages.js
let game = new GameStages(1, 1, beginStage);
// intervals to be cleared on game end and at the end of each stage
let intervals = { checkPosition: null, checkEnemies: null, enemyTimer: null }

/*
 * Base class for a character
 */
class Character {

    checkBounds(x, y, enemyX, enemyY) {
        return (x + 50 > enemyX && x < enemyX) && (y + 50 > enemyY && y < enemyY);
    }

    checkMap(x, y) {
        let map = document.getElementById("game-area");
        let mapX = map.offsetWidth;
        let mapY = map.offsetHeight;
        if (x < 0 || y < 0) {
            return false;
        } else if (x > mapX - 50 || y > mapY - 50) {
            return false;
        }
        return true;
    }

    choosePicture(xData, yData, character) {
        if (Math.abs(xData) < 0.1) {
            xData = 0
        }
        if (Math.abs(yData) < 0.1) {
            yData = 0;
        }
        // standing
        let flip = character.classList.contains("player") ? -1 : 1;
        if (xData == 0 && yData == 0) {
            character.style.backgroundPositionY = "0px";
            // diagRightDown
        } else if (flip * xData > 0 && yData > 0) {
            character.style.backgroundPositionY = "340px";
            // diagRightUp
        } else if (flip * xData > 0 && yData < 0) {
            character.style.backgroundPositionY = "-440px";
            // diagLeftUp
        } else if (flip * xData < 0 && yData < 0) {
            character.style.backgroundPositionY = "-392px";
            // diagLeftDown
        } else if (flip * xData < 0 && yData > 0) {
            character.style.backgroundPositionY = "-295px";
            // left
        } else if (xData > 0 && yData == 0) {
            character.style.backgroundPositionY = "-145px";
            // right
        } else if (xData < 0 && yData == 0) {
            character.style.backgroundPositionY = "-95px";
            // up
        } else if (xData == 0 && yData < 0) {
            character.style.backgroundPositionY = "-245px";
            // down
        } else {
            character.style.backgroundPositionY = "-195px";
        }
    }

    move(x, y) {
        if (this.checkMap(x, y)) {
            this.x = x;
            this.y = y;
            this.el.style.left = x + "px";
            this.el.style.top = y + "px";
        }
    }

}

/*
 * Enemy class, 
 */
class Enemy extends Character {

    constructor(type, el, health, healthBar, x, y, attack) {
        super();
        this.type = type;
        this.el = el;
        this.health = health;
        this.healthBar = healthBar;
        this.attack = attack;
        this.fullHealth = health;
        this.x = x;
        this.y = y;
        this.el.style.left = this.x + "px";
        this.el.style.top = this.y + "px";
    }

    subtractHealth(attack) {
        audioPlayer.playDamage();
        this.health = this.health - attack;
        this.healthBar.value = this.healthBar.value - attack;
        if (this.health <= 0) {
            this.el.parentElement.removeChild(this.el);
            enemiesList.splice(enemiesList.indexOf(this), 1);
            game.removeEnemy();
        }
    }

    choosePicture(moveX, moveY, el) {
        super.choosePicture(moveX, moveY, el);
    }

    attackPlayer() {
        audioPlayer.playAttack();
        playerList.forEach((player) => {
            let { x, y } = player.getLocation();
            this.el.style.backgroundPositionY = "-45px";
            if (super.checkBounds(this.x, this.y, x, y)) {
                player.subtractHealth(this.attack);
            }
        });
    }

    moveEnemy(x, y) {
        super.move(x, y);
    }

    getReference() {
        return this.el;
    }

    getLocation() {
        return { x: this.x, y: this.y };
    }

}

class Player extends Character {

    constructor(x, y, el, healthBar) {
        super();
        this.x = x;
        this.y = y;
        this.health = 100;
        this.el = el;
        this.healthBar = healthBar;
    }

    attack() {
        audioPlayer.playAttack();
        enemiesList.forEach((enemy) => {
            let { x, y } = enemy.getLocation();
            if (super.checkBounds(this.x, this.y, x, y)) {
                enemy.subtractHealth(10);
            }
        });
    }

    subtractHealth(attack) {
        audioPlayer.playDamage();
        this.health = this.health - attack;
        this.healthBar.value = this.healthBar.value - attack;
        if (this.health <= 0) {
            audioPlayer.playDeath();
            game.endGame(intervals, enemiesList);
        }
    }

    choosePicture(moveX, moveY, el) {
        super.choosePicture(-1 * moveX, -1 * moveY, el);
    }

    movePlayer(x, y) {
        super.move(x, y);
    }

    moveCharacter(data, index) {
        const { buttons, axes } = data;
        let x = this.x;
        let y = this.y;
        let horDirection, verDirection = 0;
        if (Math.abs(axes.mainStickHorizontal) > 0.1) {
            horDirection = axes.mainStickHorizontal;
            x += axes.mainStickHorizontal * moveDistance;
        } else {
            horDirection = 0;
        }
        if (Math.abs(axes.mainStickVertical) > 0.1) {
            verDirection = -1 * axes.mainStickVertical;
            y += -axes.mainStickVertical * moveDistance;
        } else {
            verDirection = 0;
        }
        this.el.classList.remove("flipped");
        super.choosePicture(horDirection, verDirection, this.el);
        this.movePlayer(x, y);
        if (buttons.buttonA && !lastButtonA[index]) {
            this.el.style.backgroundPositionY = "-47px";
            if (horDirection > 0) {
                this.el.classList.add("flipped");
            }
            lastButtonA[index] = true;
            this.attack();
        } else {
            if (!buttons.buttonA) {
                lastButtonA[index] = false;
            }
        }
    }

    getLocation() {
        return { x: this.x, y: this.y };
    }

}

window.onload = function () {
    let playButton = document.getElementById("music");
    let fullButton = document.getElementById("fullscreen");
    fullButton.addEventListener("click", () => {
        document.body.requestFullscreen();
    });
    playButton.addEventListener("click", () => audioPlayer.playMusic());
    startingGame();
}

function endPlay() {

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
        { name: "soldier", attack: 10, health: 100 },
        { name: "assassin", attack: 20, health: 60 },
        { name: "heavy", attack: 8, health: 140 }
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
            let x = Math.random() * (width - 75);
            let y = Math.random() * (height - 75);
            el.style.top = x + "px";
            el.style.left = y + "px";
            let enemyObj = new Enemy(type.name, el, type.health, healthBar, x, y, type.attack);
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
        playerList[index] = new Player(0, 0, character, healthBar);
    });
    beginStage();
}

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

function enemiesCheck() {
    // do randomization
    enemiesList.forEach((enemy) => {
        let randomPattern = getRandomInt(10);
        if (randomPattern > 6) {
            enemy.attackPlayer();
        } else {
            let moveX = chooseDirection();
            let moveY = chooseDirection();
            let { x, y } = enemy.getLocation();
            x = x + moveDistance * moveX;
            y = y + moveDistance * moveY;
            enemy.choosePicture(moveX, moveY, enemy.el);
            enemy.moveEnemy(x, y);
        }
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function chooseDirection() {
    let amount = Math.random();
    let direction = getRandomInt(2);
    return direction == 0 ? amount : -1 * amount;
}