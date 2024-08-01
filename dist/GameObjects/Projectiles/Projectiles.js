"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
const SAT_1 = require("../../modules/SAT");
const GameObject_1 = __importDefault(require("../GameObject"));
class Projectile extends GameObject_1.default {
    constructor(gameManager, speed, position, rotation, tankBodyId) {
        super(gameManager);
        this.tag = "projectile";
        this.speed = speed;
        this.posX = position.x;
        this.posY = position.y;
        this.rotation = rotation;
        this.tankBodyId = tankBodyId;
        this.gameManager = gameManager;
        this.startX = position.x;
        this.startY = position.y;
        this.width = 20;
        this.height = 6;
        this.collidingProps = {
            activeShape: [],
            shape: (0, SAT_1.quadColliderMesh)(this.width, this.height),
        };
    }
    update(deltaTime) {
        if (this.collidingProps == null)
            return;
        this.collidingProps.activeShape = (0, SAT_1.updateShape)(this.posX + this.width / 2, this.posY + this.height / 2, this.rotation, this.collidingProps.shape);
        this.posX += Math.cos(this.rotation) * (this.speed * deltaTime);
        this.posY += Math.sin(this.rotation) * (this.speed * deltaTime);
        const distance = Math.sqrt(Math.pow(Math.abs(this.posY - this.startY), 2) +
            Math.pow(Math.abs(this.startX - this.posX), 2));
        if (distance > 1000) {
            this.destroyObject();
        }
    }
    destroyObject() {
        const projectile = this.gameManager.gameObjects.projectiles.findIndex((_projectile) => _projectile.id == this.id);
        if (projectile != null)
            this.gameManager.gameObjects.projectiles.splice(projectile, 1);
    }
    onCollide(posX, posY, gameObject) { }
    render() { }
    network() {
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            rotation: this.rotation,
            tankBodyId: this.tankBodyId,
        };
    }
}
exports.Projectile = Projectile;
