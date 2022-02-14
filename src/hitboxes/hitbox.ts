import { REFRESH_RATE } from '../gameLogic/constants';
import $ from 'jquery';
import Player from "../characters/player";
import state from '../gameLogic/gameState';
import Enemy from '../characters/enemy';
import { toDegrees } from '../gameLogic/helpers';
import Obstacle from '../obstacles/obstacle';

class Hitbox extends Obstacle {

    private type:string;
    private count:number;
    private life:number;
    private xAngle:number;
    private yAngle:number;
    private attack:number;
    private playersHit:(Player|Enemy)[]
    private interval?:number;

    constructor(x:number, y:number, width:number, height:number, life:number, type:string, attack:number, xAngle = 0, yAngle = 0, angle = 0) {
        super(x, y, width, height);
        this.type = type;
        this.count = 1;
        this.life = life;
        this.xAngle = xAngle;
        this.yAngle = yAngle;
        this.attack = attack;
        this.playersHit = [];
        let cleanedAngle = toDegrees(angle);
        if ((cleanedAngle < 0 && xAngle > 0) || (xAngle > 0 && yAngle > 0)) {
            cleanedAngle = 180 + cleanedAngle;
        }
        if (this.type === "arrow") {
            this.obj.classList.add("arrow");
        } else {
            this.obj.classList.add("slash");
            if (xAngle == 0 && yAngle == 0) {
                cleanedAngle = 180;
            } else {
                let rads = Math.atan(yAngle / xAngle);
                cleanedAngle = toDegrees(rads);
                if (xAngle < 0) {
                    cleanedAngle += 180;
                }
            }
        }
        this.obj.style.transform = "rotate(" + cleanedAngle + "deg)";
        document.getElementById("game-area").appendChild(this.obj)
        this.interval = window.setInterval(() => {
            if (this.type === "arrow") {
                this.arrow();
            }
            this.check();
        }, REFRESH_RATE);
    }

    deleteHitbox() {
        clearInterval(this.interval);
        $(this.obj).remove();
    }

    arrow() {
        this.x += this.xAngle * 10;
        this.obj.style.left = this.x + "px";
        this.y += this.yAngle * 10;
        this.obj.style.top = this.y + "px";
    }

    check() {
        if (this.count === this.life) {
            this.obj.parentNode.removeChild(this.obj);
            clearInterval(this.interval);
        }
        this.count += 1;
        if (this.type === "player") {
            state.enemiesList.forEach((enemy) => {
                let { x, y } = enemy.getLocation();
                if (super.checkBoundary(x, y, 50, 50) && this.playersHit.indexOf(enemy) === -1) {
                    this.playersHit.push(enemy);
                    enemy.subtractHealth(this.attack);
                }
            })
        } else if (this.type === "enemy" || this.type === "arrow") {
            state.playerList.forEach((player) => {
                let { x, y } = player.getLocation();
                if (super.checkBoundary(x, y, 50, 50) && this.playersHit.indexOf(player) === -1) {
                    this.playersHit.push(player);
                    player.subtractHealth(this.attack);
                    if (this.type === "arrow") {
                        this.deleteHitbox();
                        state.projectileList = state.projectileList.filter((el) => el != this);
                    }
                }
            });
        }
    }

}

export default Hitbox;