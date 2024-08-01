"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngeenierTankBody = exports.HeavyTankBody = exports.TankBody = void 0;
const RoomManager_1 = __importDefault(require("../managers/RoomManager"));
const SAT_1 = require("../modules/SAT");
const GameObject_1 = __importDefault(require("./GameObject"));
const Weapon_1 = require("./Weapon");
class TankBody extends GameObject_1.default {
    constructor(gameManager, _type, player) {
        super(gameManager);
        this.tag = "tankBody";
        this.gold = 0;
        this.posX = 0;
        this.posY = 0;
        this.rotation = 0;
        this._type = _type;
        this.player = player;
        this.spells = [];
        this.hp = 100;
        this.maxHp = 100;
    }
    decraseHp(damage) {
        this.hp -= damage;
        if (this.hp < 0) {
            this.hp = this.maxHp;
            this.posX = 50;
            this.posY = 50;
        }
    }
    networkData() {
        return {};
    }
    useSpell(data) { }
    networkController(data) { }
}
exports.TankBody = TankBody;
class HeavyTankBody extends TankBody {
    constructor(gameManager, player) {
        super(gameManager, "heavy", player);
        this.width = 116;
        this.height = 75;
        this.pushSpeed = 1.12;
        this.standartPushSpeed = 10;
        this.tempPosX = 0;
        this.tempPosY = 0;
        this.tag = "tank";
        this.speed = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.maxSpeed = 30;
        this.rotationSpeed = 0.115;
        this.posX = 150;
        this.posY = 1000;
        this.rotation = 0;
        this.minSpeed = -10;
        this.engine = "OFF";
        this._type = "heavy";
        this.networkRotate = "NONE";
        this.networkMovement = "NONE";
        this.collidingProps = {
            activeShape: [],
            shape: (0, SAT_1.quadColliderMesh)(this.width, this.height),
        };
        this.weapon = new Weapon_1.HeavyWeapon(this.gameManager, this);
        this.collision = false;
    }
    update(deltaTime) {
        this.tempPosX = [...[this.posX]][0];
        this.tempPosY = [...[this.posY]][0];
        const tempRotation = this.rotation;
        if (this.collidingProps)
            this.collidingProps.activeShape = (0, SAT_1.updateShape)(this.posX + this.width / 2, this.posY + this.height / 2, this.rotation, this.collidingProps.shape);
        let rotationCollision = false;
        if (!this.collision) {
            this.posX += Math.cos(this.rotation) * this.speed * deltaTime;
            this.posY += Math.sin(this.rotation) * this.speed * deltaTime;
        }
        else {
            this.speed = 0;
            this.collision = false;
        }
        let pushRotationSpeed = this.rotationSpeed;
        this.engine = "OFF";
        if (this.networkMovement == "UP") {
            if (this.maxSpeed > this.speed) {
                this.speed += this.pushSpeed;
                this.engine = "UP";
            }
            if (this.networkRotate == "LEFT") {
                this.rotation -= pushRotationSpeed * deltaTime;
            }
            if (this.networkRotate == "RIGHT") {
                this.rotation += pushRotationSpeed * deltaTime;
            }
        }
        else if (this.networkMovement == "DOWN") {
            if (this.minSpeed < this.speed) {
                this.speed -= this.pushSpeed;
                this.engine = "DOWN";
            }
            if (this.networkRotate == "LEFT") {
                this.rotation += pushRotationSpeed * deltaTime;
            }
            if (this.networkRotate == "RIGHT") {
                this.rotation -= pushRotationSpeed * deltaTime;
            }
        }
        else {
            if (this.networkRotate == "LEFT") {
                this.rotation -= pushRotationSpeed * deltaTime;
            }
            if (this.networkRotate == "RIGHT") {
                this.rotation += pushRotationSpeed * deltaTime;
            }
        }
        if (this.collidingProps != null) {
            this.collidingProps.activeShape = (0, SAT_1.updateShape)(this.posX + this.width / 2, this.posY + this.height / 2, this.rotation, this.collidingProps.shape);
            if (this.player.roomCode) {
                const room = RoomManager_1.default.getRoomByCode(this.player.roomCode);
                if (room != undefined) {
                    const tankBodies = [
                        ...this.gameManager.gameObjects.tankBodies.map((tankBody) => {
                            return tankBody;
                        }),
                        ...this.gameManager.gameObjects.walls.map((wall) => {
                            return wall;
                        }),
                    ];
                    for (let go of tankBodies) {
                        if (go.id == this.id)
                            continue;
                        if (go == null)
                            continue;
                        if (go.collidingProps == null)
                            return;
                        let collide = (0, SAT_1.satCollide)(this.collidingProps.activeShape, go.collidingProps.activeShape);
                        if (collide) {
                            this.rotation = tempRotation;
                            this.posX = this.tempPosX;
                            this.posY = this.tempPosY;
                            break;
                        }
                    }
                }
            }
        }
        if (this.engine == "OFF") {
            if (this.speed > 0) {
                this.speed -= this.pushSpeed;
            }
            else if (this.speed < 0) {
                this.speed += this.pushSpeed;
            }
        }
        this.weapon.update(deltaTime);
    }
    onCollide(posX, posY, gameObject) { }
    networkController(data) {
        // console.log(data);
        this.networkRotate = data.rotate;
        this.networkMovement = data.movement;
        this.weapon.networkController(data.weapon);
    }
    useSpell(data) {
        const { spellType } = data;
        const spell = this.spells.find((sp) => sp.spellType == spellType);
        if (spell != undefined)
            return;
        this.weapon.useSpell(data);
    }
    networkData() {
        return {
            id: this.id,
            posX: this.posX,
            posY: this.posY,
            rotation: this.rotation,
            hp: this.hp,
            maxHp: this.maxHp,
            weapon: this.weapon.network(),
            playerId: this.player.id,
            gameObjectType: "TankBody",
            _type: this._type,
            collision: this.collision,
            spells: this.spells.map((spell) => spell.network()),
            gold: this.gold,
        };
    }
}
exports.HeavyTankBody = HeavyTankBody;
class EngeenierTankBody extends TankBody {
    constructor(gameManager, player) {
        super(gameManager, "engeenier", player);
        this.width = 0;
        this.height = 0;
    }
}
exports.EngeenierTankBody = EngeenierTankBody;
