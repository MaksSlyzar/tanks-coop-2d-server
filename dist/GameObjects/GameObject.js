"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../server/events");
class GameObject {
    constructor(gameManager) {
        this.posX = -1;
        this.posY = -1;
        this.rotation = 0;
        this.collidingProps = null;
        this.width = 1;
        this.height = 1;
        this.id = Number((0, events_1.generateToken)());
        this.tag = "";
        this.gameManager = gameManager;
    }
    update(deltaTime) { }
    network() { }
    onCollide(posX, posY, gameObject) { }
}
exports.default = GameObject;
