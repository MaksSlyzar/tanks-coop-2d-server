"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SAT_1 = require("../../modules/SAT");
const GameObject_1 = __importDefault(require("../GameObject"));
class Wall extends GameObject_1.default {
    constructor(gameManager, posX, posY, width, height) {
        super(gameManager);
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.collision = false;
        this.collidingProps = {
            activeShape: [],
            shape: (0, SAT_1.quadColliderMesh)(this.width, this.height),
        };
    }
    update() {
        if (this.collidingProps)
            this.collidingProps.activeShape = (0, SAT_1.updateShape)(this.posX + this.width / 2, this.posY + this.height / 2, this.rotation, this.collidingProps.shape);
    }
}
exports.default = Wall;
