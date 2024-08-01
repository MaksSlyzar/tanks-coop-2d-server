"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBuild = exports.GoldBuild = exports.Build = void 0;
const SAT_1 = require("../../modules/SAT");
const GameObject_1 = __importDefault(require("../GameObject"));
// import { TankBody } from "../TankBody";
const Wall_1 = __importDefault(require("../Walls/Wall"));
class Build extends GameObject_1.default {
    constructor(gameManager) {
        super(gameManager);
        this.width = 0;
        this.height = 0;
        this.hp = 1;
        this.maxHp = 1;
        this.type = "none";
    }
    decraseHp(damage) {
        this.hp -= damage;
        if (this.hp < 0) {
            this.hp = this.maxHp;
            this.posX = 0;
            this.posY = 0;
            this.destroyObject();
        }
    }
    destroyObject() {
        const build = this.gameManager.gameObjects.builds.findIndex((_build) => _build.id == this.id);
        if (build != null)
            this.gameManager.gameObjects.builds.splice(build, 1);
    }
    network() {
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            hp: this.hp,
            maxHp: this.maxHp,
            _type: this.type,
        };
    }
}
exports.Build = Build;
class GoldBuild extends Build {
    constructor(gameManger) {
        super(gameManger);
        this.width = 24;
        this.height = 24;
        this.tag = "gold";
        this.type = "gold";
        this.collidingProps = {
            activeShape: [],
            shape: (0, SAT_1.quadColliderMesh)(this.width, this.height),
        };
    }
    update() {
        if (this.collidingProps == null)
            return;
        this.collidingProps.activeShape = (0, SAT_1.updateShape)(this.posX + this.width / 2, this.posY + this.height / 2, this.rotation, this.collidingProps.shape);
        // const collidingGameObjects = [
        //   ...this.gameManager.gameObjects.tankBodies.filter(
        //     (_tankBody) => _tankBody.collidingProps != null
        //   ),
        // ];
        // collidingGameObjects.forEach((tank) => {
        //   if (tank.collidingProps == null) return;
        //   if (this.collidingProps == null) return;
        //   let collide = satCollide(
        //     this.collidingProps.activeShape,
        //     tank.collidingProps.activeShape
        //   );
        //   if (collide) this.onCollide(0, 0, tank);
        // });
    }
    onCollide(posX, posY, gameObject) {
        if (gameObject.tag == "tank") {
            // const tankBody = gameObject as TankBody;
            // tankBody.gold += 5;
            this.destroyObject();
        }
    }
}
exports.GoldBuild = GoldBuild;
class BaseBuild extends Build {
    constructor(gameManager) {
        super(gameManager);
        this.width = 400;
        this.height = 200;
        this.tag = "base";
        this.posX = 1000;
        this.posY = 1000;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.type = "base";
        this.collidingProps = {
            activeShape: [],
            shape: (0, SAT_1.quadColliderMesh)(this.width, this.height),
        };
        gameManager.gameObjects.walls.push(new Wall_1.default(gameManager, this.posX, this.posY - 5, this.width, 10), new Wall_1.default(gameManager, this.posX, this.posY + this.height, this.width, 10));
    }
    destroyObject() {
        // this.gameManager.gameEnd();
    }
    update() {
        if (this.collidingProps == null)
            return;
        this.collidingProps.activeShape = (0, SAT_1.updateShape)(this.posX + this.width / 2, this.posY + this.height / 2, this.rotation, this.collidingProps.shape);
    }
}
exports.BaseBuild = BaseBuild;
