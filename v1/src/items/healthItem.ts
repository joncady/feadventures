import $ from 'jquery';
import Obstacle from '../obstacles/obstacle';

class HealthItem extends Obstacle {

    public value:number;

    constructor(x, y, width, height, value) {
        super(x, y, width, height);
        this.obj.classList.add("healthItem");
        this.value = value;
    }

    deleteItem() {
        $(this.obj).remove();
    }
}

export default HealthItem;