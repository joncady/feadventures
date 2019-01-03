class Obstacle {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.obj = document.createElement("div");
        this.obj.classList.add("obstacle");
        this.obj.style.width = width + "px";
        this.obj.style.height = height + "px";
        this.obj.style.left = x + "px";
        this.obj.style.top = y + "px";
    }

    checkBoundary(x1, y1, width1, height1) {
        // console.log({ x1, y1, width1, height1, x2: this.x, y2: this.y, width2: this.width, height2: this.height});
        let bound = (x1 + width1 > this.x && x1 < this.x + this.width && y1 + height1 > this.y && y1 < this.y + this.height);
        return bound;
    }

}