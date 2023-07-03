import {AUTO} from "phaser";
import { CONFIG } from "./src/config";
import Farm from "./src/scenes/Farm";
import House from "./src/scenes/House";

const config = {
    width: CONFIG.GAME_WIDTH,
    height: CONFIG.GAME_HEIGHT,
    type: AUTO,
    scene: [Farm , House, ], 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },
    pixelArt: true,
    scale: {
        zoom: CONFIG.GAME_SCALE
    }
}

export default new Phaser.Game(config);