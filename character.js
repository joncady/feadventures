/*
 * Base class for a character
 */
class Character {

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

    choosePicture(xData, yData, character) {
        if (Math.abs(xData) < 0.1) {
            xData = 0
        }
        if (Math.abs(yData) < 0.1) {
            yData = 0;
        }
        // standing
        let flip = character.classList.contains("player") ? -1 : 1;
        if (xData == 0 && yData == 0) {
            character.style.backgroundPositionY = "0px";
            // diagRightDown
        } else if (flip * xData > 0 && yData > 0) {
            character.style.backgroundPositionY = "340px";
            // diagRightUp
        } else if (flip * xData > 0 && yData < 0) {
            character.style.backgroundPositionY = "-440px";
            // diagLeftUp
        } else if (flip * xData < 0 && yData < 0) {
            character.style.backgroundPositionY = "-392px";
            // diagLeftDown
        } else if (flip * xData < 0 && yData > 0) {
            character.style.backgroundPositionY = "-295px";
            // left
        } else if (xData > 0 && yData == 0) {
            character.style.backgroundPositionY = "-145px";
            // right
        } else if (xData < 0 && yData == 0) {
            character.style.backgroundPositionY = "-95px";
            // up
        } else if (xData == 0 && yData < 0) {
            character.style.backgroundPositionY = "-245px";
            // down
        } else {
            character.style.backgroundPositionY = "-195px";
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