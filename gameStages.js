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
        let hitboxes = document.querySelectorAll(".arrow");
        if (hitboxes !== undefined) {
            hitboxes.forEach((hitbox) => {
                hitbox.deleteHitbox();
            });
        }
        obstacleList.forEach((obstacle) => {
            let obEl = obstacle.getReference();
            $(obEl).remove();
        });
        $(".player").remove();
        enemies.forEach((enemy) => {
            let enemyEl = enemy.getReference();
            $(enemyEl).remove();
        });
        reset();
    }

}