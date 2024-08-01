"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matter_js_1 = require("matter-js");
class WorldGameObject {
    constructor() {
        this.engine = matter_js_1.Engine.create();
        this.world = this.engine.world;
        this.world.gravity.x = 0;
        this.world.gravity.y = 0;
    }
}
exports.default = WorldGameObject;
