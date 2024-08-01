"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../server/events");
class GameObjectUpdate {
    constructor(gameManager) {
        this.id = Number((0, events_1.generateToken)());
        this.tag = "";
        this.gameManager = gameManager;
    }
    update(deltaTime) { }
    network() { }
}
exports.default = GameObjectUpdate;
