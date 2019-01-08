class Player extends Character {

    constructor(x, y, el, healthBar) {
        super();
        this.x = x;
        this.y = y;
        this.health = 100;
        this.el = el;
        this.healthBar = healthBar;
        this.attacking = false;
        this.attackCounter = 0;
        this.attack = 10;
        this.dead = false;
    }

    attackEnemy(horAngle, verAngle) {
        this.hitbox = null;
        audioPlayer.playAttack();
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
        this.hitbox = new Hitbox(xRel, yRel, 50, 50, 1, "player", this.attack, horAngle, verAngle);
    }

    subtractHealth(attack) {
        audioPlayer.playDamage();
        this.health = this.health - attack;
        this.healthBar.value = this.healthBar.value - attack;
        if (this.health <= 0) {
            audioPlayer.playDeath();
            this.dead = true;
            let dead = true;
            playerList.forEach((player) => {
                if (!player.dead) {
                    dead = false;
                }
            });
            if (dead) {
                game.endGame(intervals , enemiesList);
            }
        }
    }

    isDead() {
        return this.dead;
    }

    choosePicture(moveX, moveY, el) {
        super.choosePicture(-1 * moveX, -1 * moveY, el);
    }

    movePlayer(x, y) {
        super.move(x, y);
    }

    moveCharacter(data, index) {
        if (!this.dead) {
            const { buttons, axes } = data;
            let x = this.x;
            let y = this.y;
            let horDirection, verDirection = 0;
            let attacking = false;
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
            if (this.attacking) {
                this.attackCounter += 1;
                if (this.attackCounter > 3) {
                    this.attackCounter = 0;
                    this.attacking = false;
                } else {
                    attacking = true;
                }
            } else {
                this.el.classList.remove("flipped");
                if (buttons.buttonA && !lastButtonA[index]) {
                    this.attacking = true;
                    attacking = true;
                    lastButtonA[index] = true;
                    this.attackEnemy(horDirection, verDirection);
                } else {
                    if (!buttons.buttonA) {
                        lastButtonA[index] = false;
                    }
                }
            }
            super.choosePicture(horDirection, verDirection, this.el, attacking);
            this.movePlayer(x, y);
        }
    }

    getLocation() {
        return { x: this.x, y: this.y };
    }

}