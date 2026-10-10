import $ from 'jquery';
import state from './gameState';

class GameStages {

    public multiplier:number;
    public enemiesLeft:number;
    public beginStage:() => void;
    public reset:() => void;
    public stage:number;

    constructor(stage:number, multiplier:number, beginStage:() => void, reset:() => void) {
        this.stage = stage;
        this.multiplier = multiplier;
        this.enemiesLeft = stage * multiplier;
        this.beginStage = beginStage;
        this.reset = reset;
    }

    getCount() {
        return this.enemiesLeft;
    }

    getStage() {
        return this.stage;
    }

    removeEnemy() {
        this.enemiesLeft = this.enemiesLeft - 1;
        if (this.enemiesLeft == 0) {
            this.incrementStage();
        }
    }

    incrementStage() {
        this.stage += 1;
        this.enemiesLeft = this.stage * this.multiplier;
        this.beginStage();
    }

    endGame(timers, enemies) {
        let keys = Object.keys(timers);
        keys.forEach((key) => {
            clearInterval(timers[key]);
        });
        state.projectileList.forEach((projectile) => {
            let projEl = projectile.getReference();
            $(projEl).remove();
        });
        state.obstacleList.forEach((obstacle) => {
            let obEl = obstacle.getReference();
            $(obEl).remove();
        });
        $(".player").remove();
        enemies.forEach((enemy) => {
            let enemyEl = enemy.getReference();
            $(enemyEl).remove();
        });

        this.reset();
    }

}

export default GameStages;