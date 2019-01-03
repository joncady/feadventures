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
            endPlay();
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