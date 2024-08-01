"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeavyWeapon = exports.Weapon = void 0;
const RoomManager_1 = __importDefault(require("../managers/RoomManager"));
const GameObject_1 = __importDefault(require("./GameObject"));
const Spells_1 = require("./Spells/Spells");
class Weapon extends GameObject_1.default {
    constructor(gameManager) {
        super(gameManager);
        this.spells = [];
    }
}
exports.Weapon = Weapon;
class HeavyWeapon extends Weapon {
    constructor(gameManager, tankBody) {
        super(gameManager);
        this.dx = 0;
        this.dy = 0;
        this.rotationSpeed = 0.225;
        this.rotation = 0.09;
        this.tankBody = tankBody;
        if (tankBody.player.roomCode == null)
            return;
        const room = RoomManager_1.default.getRoomByCode(tankBody.player.roomCode);
        if ((room === null || room === void 0 ? void 0 : room.gameManager) == null)
            return;
        this.spells.push(new Spells_1.ShootSpell(room.gameManager, tankBody.player));
    }
    update(deltaTime) {
        const addRotation = -Math.atan2(this.dx, this.dy) + (90 * Math.PI) / 180;
        if (Math.abs(addRotation - this.rotation - this.tankBody.rotation) <= 0.04) {
            this.rotation = addRotation - this.tankBody.rotation;
            return;
        }
        if (addRotation > this.rotation + this.tankBody.rotation) {
            if (360 -
                toDeg(addRotation) +
                toDeg(this.rotation + this.tankBody.rotation) <
                toDeg(addRotation) - toDeg(this.rotation + this.tankBody.rotation)) {
                this.rotation -= this.rotationSpeed * deltaTime;
            }
            else {
                this.rotation += this.rotationSpeed * deltaTime;
            }
        }
        else {
            if (360 -
                toDeg(this.rotation + this.tankBody.rotation) +
                toDeg(addRotation) <
                toDeg(this.rotation + this.tankBody.rotation) - toDeg(addRotation)) {
                this.rotation += this.rotationSpeed * deltaTime;
            }
            else {
                this.rotation -= this.rotationSpeed * deltaTime;
            }
        }
        if (this.rotation + this.tankBody.rotation < -1.57) {
            this.rotation = 6.28 - 1.57 - this.tankBody.rotation;
        }
        else if (this.rotation + this.tankBody.rotation > 6.28 - 1.57) {
            this.rotation = -1.57 - this.tankBody.rotation;
        }
    }
    network() {
        return {
            rotation: this.rotation,
            spells: this.spells.map((spell) => spell.network()),
        };
    }
    useSpell(data) {
        const { spellType } = data;
        const spell = this.spells.find((sp) => sp.spellType == spellType);
        if (spell)
            spell.execute();
    }
    networkController(data) {
        this.dx = data.dx - this.tankBody.posX;
        this.dy = data.dy - this.tankBody.posY;
    }
}
exports.HeavyWeapon = HeavyWeapon;
function toDeg(num) {
    return (num * 180) / Math.PI + 90;
}
function toRad(num) {
    return ((num - 90) * Math.PI) / 180;
}
