import { MOVE_DISTANCE } from "../gameLogic/constants";
import Hitbox from "../hitboxes/hitbox";
import Character from "./character";
import state from '../gameLogic/gameState';
import audioPlayer from '../gameLogic/music';
import HealthItem from "../items/healthItem";

class Player extends Character {

    public dead:boolean;
    public lastButtonA:boolean[]

    constructor(x, y, el, healthBar) {
        super(x, y);
        this.health = 100;
        this.el = el;
        this.healthBar = healthBar;
        this.attacking = false;
        this.attackCounter = 0;
        this.attack = 10;
        this.dead = false;
        this.lastButtonA = [false, false, false, false];
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
            let everyoneDead = true;
            state.playerList.forEach((player) => {
                if (!player.dead) {
                    everyoneDead = false;
                }
            });
            if (everyoneDead) {
                state.game.endGame(state.intervals , state.enemiesList);
            }
        }
    }

    isDead() {
        return this.dead;
    }

    choosePicture(moveX, moveY, el) {
        super.choosePicture(-1 * moveX, -1 * moveY, el, this.attacking);
    }

    movePlayer(x, y) {
        state.healthItemList.forEach((item) => {
            let hit = item.checkBoundary(x, y, 50, 50);
            if (hit) {
                this.health = this.health + item.value; 
                if (this.health > 100) {
                    this.health = 100;
                }
                item.deleteItem();
                state.healthItemList = state.healthItemList.filter((el:HealthItem) => !(el == item));
                this.healthBar.value = this.health;
            }
        });
        if (this.checkMap(x, y)) {
            this.x = x;
            this.y = y;
            this.el.style.left = x + "px";
            this.el.style.top = y + "px";
        }
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
                x += axes.mainStickHorizontal * MOVE_DISTANCE;
            } else {
                horDirection = 0;
            }
            if (Math.abs(axes.mainStickVertical) > 0.1) {
                verDirection = -1 * axes.mainStickVertical;
                y += -axes.mainStickVertical * MOVE_DISTANCE;
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
                if (buttons.buttonA && !this.lastButtonA[index]) {
                    this.attacking = true;
                    attacking = true;
                    this.lastButtonA[index] = true;
                    this.attackEnemy(horDirection, verDirection);
                } else {
                    if (!buttons.buttonA) {
                        this.lastButtonA[index] = false;
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

export default Player;