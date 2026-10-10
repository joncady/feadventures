/* 
 * Helper functions
 */
function getRandomInt(max:number) {
    return Math.floor(Math.random() * Math.floor(max));
}

function returnAngle(x1:number, y1:number, x2:number, y2:number) {
    let equation = (y2 - y1) / (x2 - x1);
    return Math.atan(equation);
}

function differenceXY(x1:number, y1:number, x2:number, y2:number) {
    return { diffX: x2 - x1, diffY: y2 - y1 };
}

function distanceCalculation(x1:number, y1:number, x2:number, y2:number) {
    let term1 = Math.pow((x2 - x1), 2);
    let term2 = Math.pow((y2 - y1), 2);
    return Math.sqrt(term1 + term2);
}

function chooseDirection() {
    let amount = Math.random();
    let direction = getRandomInt(2);
    return direction == 0 ? amount : -1 * amount;
}

function toDegrees(radians:number) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

export {
    returnAngle,
    differenceXY,
    distanceCalculation,
    chooseDirection,
    toDegrees,
    getRandomInt
}