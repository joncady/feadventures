import Obstacle from "../obstacles/obstacle";
import Enemy from "../characters/enemy";
import Player from "../characters/player";
import Hitbox from "../hitboxes/hitbox";
import HealthItem from "../items/healthItem";
import GameStages from "./gameStages";

interface KeysProps {
    axes: {
        mainStickVertical:number;
        mainStickHorizontal: number;
    };
    buttons: {
        buttonA:boolean;
    }
}

interface Intervals {
    checkPosition:number;
    checkEnemies:number;
    healthTimer:number;
    enemyTimer:number;
}

class GameState {

    public playerList:Player[] = [];
    public enemiesList:Enemy[] = [];
    public playerKeys:KeysProps[];
    public obstacleList:Obstacle[] = [];
    public healthItemList:HealthItem[] = [];
    public projectileList:Hitbox[] = [];
    public intervals:Intervals;
    public gameGrid:number[][];
    public game:GameStages;

    constructor() {
        this.playerKeys = [
            {
                axes: {
                    mainStickVertical: 0,
                    mainStickHorizontal: 0
                },
                buttons: {
                    buttonA: false
                }
            },
            {
                axes: {
                    mainStickVertical: 0,
                    mainStickHorizontal: 0
                },
                buttons: {
                    buttonA: false
                }
            }
        ];
        this.intervals = {
            checkEnemies: null,
            checkPosition: null,
            healthTimer: null,
            enemyTimer: null
        }
    }
}

let singletonState = new GameState();

export default singletonState;