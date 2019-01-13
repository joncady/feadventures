/*
 * Enemy class
 */
class Enemy extends Character {

    constructor(type, el, health, healthBar, x, y, attack, speed, attackChance) {
        super(x, y);
		this.attackChance = attackChance;
        this.type = type;
        this.el = el;
        this.speed = speed;
        this.health = health;
        this.healthBar = healthBar;
        this.attack = attack;
        this.fullHealth = health;
        this.attackCounter = 0;
        this.attacking = false;
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
        super.choosePicture(moveX, -1 * moveY, el);
    }

    attackPlayer(horAngle, verAngle, angle) {
        if (this.attacking) {
            this.attackCounter += 1;
            if (this.attackCounter > 3) {
                this.attacking = false;
                this.attackCounter = 0;
            }
        } else {
            this.attacking = true;
            this.hitbox = null;
            if (this.type === "archer") {
                audioPlayer.playArrow();
            } else {
                audioPlayer.playAttack();
            }
            let xRel = this.x;
            let yRel = this.y;
            if (horAngle < 0) {
                xRel = this.x - 30;
            } else if (horAngle > 0) {
                xRel = this.x + 50;
            }
            if (verAngle < 0) {
                yRel = this.y - 30;
            } else if (verAngle > 0) {
                yRel = this.y + 30;
            }
            if (this.type !== "archer") {
                this.hitbox = new Hitbox(xRel, yRel, 50, 50, 1, "enemy", this.attack, horAngle, verAngle, angle);
            } else {
                this.hitbox = new Hitbox(xRel, yRel, 30, 30, 30, "arrow", this.attack, horAngle, verAngle, angle);
            }
        }
    }

    moveEnemy() {
        let newX = this.x;
        let newY = this.y;
        let closestPlayer;
        let closestDistance;
        playerList.forEach((player) => {
            if (!player.dead) {
                let checkPlayerVals = player.getLocation();
                let checkX = checkPlayerVals.x;
                let checkY = checkPlayerVals.y;
                let distance = distanceCalculation(this.x, this.y, checkX, checkY);
                if (closestPlayer == null || distance < closestDistance) {
                    closestPlayer = player;
                    closestDistance = distance;
                }
            }
        });
        let playerXY = closestPlayer.getLocation();
        let { diffX, diffY } = differenceXY(newX, newY, playerXY.x, playerXY.y);
        let angle = returnAngle(newX, newY, playerXY.x, playerXY.y);
        let xAngle = Math.cos(angle);
        let yAngle = Math.sin(angle);
        if (diffX < 0) {
            xAngle *= -1;
            yAngle *= -1;
        }
        let reverse = 1;
        if (this.type === "archer") {
            reverse = -1;
        }
        let randomPattern = getRandomInt(10);
        if (randomPattern > this.attackChance) {
            this.attackPlayer(xAngle, yAngle, angle);
        } else {
            newX = newX + this.speed * xAngle * reverse;
            newY = newY + this.speed * yAngle * reverse;
            this.choosePicture(xAngle, yAngle, this.el);
        }
        super.move(newX, newY);
    }

    getReference() {
        return this.el;
    }

    getLocation() {
        return { x: this.x, y: this.y };
    }

}