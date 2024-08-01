import { Body } from "matter-js";
import GameManager from "../managers/GameManager";
import { generateToken } from "../server/events";

export default class GameObjectUpdate {
    id: number;
    tag: string;
    gameManager: GameManager;

    constructor(gameManager: GameManager) {
        this.id = Number(generateToken());
        this.tag = "";
        this.gameManager = gameManager;
    }

    update(deltaTime: number) {}

    network(): any {}
}
