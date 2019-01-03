class GameStages {

    constructor(stage, multiplier, beginStage) {
        this.stage = stage;
        this.multiplier = multiplier;
        this.enemiesLeft = stage * multiplier;
        this.beginStage = beginStage;
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
        enemies.forEach((enemy) => {
            let enemyEl = enemy.getReference();
            enemyEl.parentElement.removeChild(enemyEl);
        });
    }

}