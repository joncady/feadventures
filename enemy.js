/*
 * Enemy class, 
 */
class Enemy extends Character {

    constructor(type, el, health, healthBar, x, y, attack, speed) {
        super();
        this.type = type;
        this.el = el;
        this.speed = speed;
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