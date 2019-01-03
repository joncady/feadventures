let pxMult = 49.2;

/*
 * Base class for a character
 */
class Character {

    constructor() {
        this.frameNumber = 0;
        this.spriteFrame = 0;
    }

    checkBounds(x, y, enemyX, enemyY) {
        return (x + 50 > enemyX && x < enemyX) && (y + 50 > enemyY && y < enemyY);
    }

    checkMap(x, y) {
        let hitObs = false;
        obstacleList.forEach((obstacle) => {
            let hit = obstacle.checkBoundary(x, y, 50, 50);
            if (hit) {
                hitObs = true;
            }
        });
        if (hitObs) {
            return false;
        }
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

    choosePicture(xData, yData, character, attacking) {
        if (Math.abs(xData) < 0.1) {
            xData = 0;
        }
        if (Math.abs(yData) < 0.1) {
            yData = 0;
        }
        // standing
        if (attacking) {
            if (xData > 0) {
                character.classList.add("flipped");
            } else {
                character.classList.remove("flipped");
            }
            character.style.backgroundPositionY = -1 * pxMult + "px";            
            // diagRightDown
        } else if (xData > 0 && yData > 0) {
            character.style.backgroundPositionY = -6 * pxMult + "px";
            // diagRightUp
        } else if (xData > 0 && yData < 0) {
            character.style.backgroundPositionY = -5 * pxMult + "px";
            // diagLeftUp
        } else if (xData < 0 && yData < 0) {
            character.style.backgroundPositionY =  -9 * pxMult + "px";
            // diagLeftDown
        } else if (xData < 0 && yData > 0) {
            character.style.backgroundPositionY = -7 * pxMult + "px";
            // left
        } else if (xData > 0 && yData == 0) {
            character.style.backgroundPositionY = -3 * pxMult + "px";
            // right
        } else if (xData < 0 && yData == 0) {
            character.style.backgroundPositionY = -2 * pxMult + "px";
            // up
        } else if (xData == 0 && yData < 0) {
            character.style.backgroundPositionY = 5 * pxMult + "px";
            // down
        } else if (xData == 0 && yData > 0) {
            character.style.backgroundPositionY = -4 * pxMult + "px";
        // standing
        } else {
            character.style.backgroundPositionY = 0 * pxMult + "px";
        }
        character.style.backgroundPositionX = this.spriteFrame * pxMult + "px";
        this.frameNumber += 1;
        if (this.frameNumber > 3) {
            this.spriteFrame += 1;
            if (this.spriteFrame > 3) {
                this.spriteFrame = 0;
            }
            this.frameNumber = 0;
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