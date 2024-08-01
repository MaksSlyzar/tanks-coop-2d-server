"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Weapon = exports.HeavyTank = exports.Tank = void 0;
const matter_js_1 = require("matter-js");
const GameObjectUpdate_1 = __importDefault(require("../GameObjectUpdate"));
const RoomManager_1 = __importDefault(require("../../managers/RoomManager"));
function toDeg(rad) {
    return rad * (180 / Math.PI);
}
function toRad(deg) {
    return deg * (Math.PI / 180);
}
class Tank extends GameObjectUpdate_1.default {
    constructor(gameManager, player) {
        super(gameManager);
        //Constants
        this.acceleration = 0.001; // Acceleration
        this.maxSpeed = 0.05; // Maximum speed
        this.maxRotationSpeed = 5.5; // Maximum rotation speed
        this.rotationFactor = 6.5; // Rotation factor
        this.turnSpeed = 0.15; // Turn speed
        this.friction = 0.0005; // Friction for inertia
        this.rotationSpeed = 0.005;
        this.speed = 0;
        this.player = player;
    }
    update(deltaTime) { }
    networkData() {
        return {};
    }
    networkController(data) { }
    useSpell(data) { }
}
exports.Tank = Tank;
class HeavyTank extends Tank {
    constructor(gameManager, player) {
        super(gameManager, player);
        //Constants
        this.acceleration = 0.001; // Acceleration
        this.maxSpeed = 0.05; // Maximum speed
        this.maxRotationSpeed = 5.5; // Maximum rotation speed
        this.rotationFactor = 6.5; // Rotation factor
        this.turnSpeed = 0.15; // Turn speed
        this.friction = 0.0005; // Friction for inertia
        this.speed = 0;
        this.networkRotate = "NONE";
        this.networkMovement = "NONE";
        this.body = matter_js_1.Bodies.rectangle(0, 200, 116, 70, {
            // inertia: Infinity,
            friction: 0.5,
            frictionAir: 0.5,
            mass: 8,
        });
        this.weapon = new Weapon(gameManager, this);
        const world = gameManager.world.world;
        matter_js_1.Composite.add(world, this.body);
    }
    update(deltaTime) {
        const forceMagnitude = 0.1;
        // Accelerate or decelerate the tank
        if (this.networkMovement === "UP") {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed); // Increase speed
        }
        else if (this.networkMovement === "DOWN") {
            this.speed = Math.max(this.speed - this.acceleration, -this.maxSpeed); // Decrease speed
        }
        else {
            // Apply friction to slow down the tank when not accelerating
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - this.friction, 0);
            }
            else if (this.speed < 0) {
                this.speed = Math.min(this.speed + this.friction, 0);
            }
        }
        //Rotation
        const mass = this.body.mass;
        const rotationSpeedTank = (this.speed > 0
            ? this.speed * this.rotationFactor
            : this.turnSpeed) / mass;
        if (this.networkRotate === "LEFT") {
            matter_js_1.Body.setAngularVelocity(this.body, -rotationSpeedTank);
        }
        else if (this.networkRotate == "RIGHT") {
            matter_js_1.Body.setAngularVelocity(this.body, rotationSpeedTank);
        }
        // Apply force to the tank based on its speed
        matter_js_1.Body.applyForce(this.body, this.body.position, {
            x: this.speed * Math.cos(this.body.angle),
            y: this.speed * Math.sin(this.body.angle),
        });
        this.weapon.update(deltaTime);
    }
    networkController(data) {
        // console.log(data);
        this.networkRotate = data.rotate;
        this.networkMovement = data.movement;
        this.weapon.networkController(data.weapon);
    }
    networkData() {
        return {
            id: this.id,
            position: this.body.position,
            rotation: this.body.angle,
            playerId: this.player.id,
            weapon: this.weapon.networkData(),
        };
    }
}
exports.HeavyTank = HeavyTank;
class Weapon {
    constructor(gameManager, tank) {
        this.dx = 0;
        this.dy = 0;
        // super(gameManager);
        this.rotationSpeed = 0.225;
        this.rotation = 0.09;
        this.tank = tank;
        if (tank.player.roomCode == null)
            return;
        const room = RoomManager_1.default.getRoomByCode(tank.player.roomCode);
        if ((room === null || room === void 0 ? void 0 : room.gameManager) == null)
            return;
        // this.spells.push(new ShootSpell(room.gameManager, tankBody.player));
    }
    update(deltaTime) {
        const addRotation = -Math.atan2(this.dx, this.dy) + (90 * Math.PI) / 180;
        if (Math.abs(addRotation - this.rotation - this.tank.body.angle) <= 0.04) {
            this.rotation = addRotation - this.tank.body.angle;
            return;
        }
        if (addRotation > this.rotation + this.tank.body.angle) {
            if (360 -
                toDeg(addRotation) +
                toDeg(this.rotation + this.tank.body.angle) <
                toDeg(addRotation) - toDeg(this.rotation + this.tank.body.angle)) {
                this.rotation -= this.rotationSpeed * deltaTime;
            }
            else {
                this.rotation += this.rotationSpeed * deltaTime;
            }
        }
        else {
            if (360 -
                toDeg(this.rotation + this.tank.body.angle) +
                toDeg(addRotation) <
                toDeg(this.rotation + this.tank.body.angle) - toDeg(addRotation)) {
                this.rotation += this.rotationSpeed * deltaTime;
            }
            else {
                this.rotation -= this.rotationSpeed * deltaTime;
            }
        }
        if (this.rotation + this.tank.body.angle < -1.57) {
            this.rotation = 6.28 - 1.57 - this.tank.body.angle;
        }
        else if (this.rotation + this.tank.body.angle > 6.28 - 1.57) {
            this.rotation = -1.57 - this.tank.body.angle;
        }
    }
    networkController(data) {
        this.dx = data.dx - this.tank.body.position.x;
        this.dy = data.dy - this.tank.body.position.y;
    }
    networkData() {
        return {
            rotation: this.rotation,
            // spells: this.spells.map((spell) => spell.network()),
        };
    }
}
exports.Weapon = Weapon;
// export class HeavyWeapon extends Weapon {
//     tankBody: HeavyTankBody;
//     rotation: number;
//     rotationSpeed: number;
//     dx: number = 0;
//     dy: number = 0;
//     constructor(gameManager: GameManager, tankBody: HeavyTankBody) {
//       super(gameManager);
//       this.rotationSpeed = 0.225;
//       this.rotation = 0.09;
//       this.tankBody = tankBody;
//       if (tankBody.player.roomCode == null) return;
//       const room = RoomManager.getRoomByCode(tankBody.player.roomCode);
//       if (room?.gameManager == null) return;
//       this.spells.push(new ShootSpell(room.gameManager, tankBody.player));
//     }
//     update(deltaTime: number): void {
//       const addRotation = -Math.atan2(this.dx, this.dy) + (90 * Math.PI) / 180;
//       if (
//         Math.abs(addRotation - this.rotation - this.tankBody.rotation) <= 0.04
//       ) {
//         this.rotation = addRotation - this.tankBody.rotation;
//         return;
//       }
//       if (addRotation > this.rotation + this.tankBody.rotation) {
//         if (
//           360 -
//             toDeg(addRotation) +
//             toDeg(this.rotation + this.tankBody.rotation) <
//           toDeg(addRotation) - toDeg(this.rotation + this.tankBody.rotation)
//         ) {
//           this.rotation -= this.rotationSpeed * deltaTime;
//         } else {
//           this.rotation += this.rotationSpeed * deltaTime;
//         }
//       } else {
//         if (
//           360 -
//             toDeg(this.rotation + this.tankBody.rotation) +
//             toDeg(addRotation) <
//           toDeg(this.rotation + this.tankBody.rotation) - toDeg(addRotation)
//         ) {
//           this.rotation += this.rotationSpeed * deltaTime;
//         } else {
//           this.rotation -= this.rotationSpeed * deltaTime;
//         }
//       }
//       if (this.rotation + this.tankBody.rotation < -1.57) {
//         this.rotation = 6.28 - 1.57 - this.tankBody.rotation;
//       } else if (this.rotation + this.tankBody.rotation > 6.28 - 1.57) {
//         this.rotation = -1.57 - this.tankBody.rotation;
//       }
//     }
//     network() {
//       return {
//         rotation: this.rotation,
//         spells: this.spells.map((spell) => spell.network()),
//       };
//     }
//     useSpell(data: any) {
//       const { spellType } = data;
//       const spell = this.spells.find((sp) => sp.spellType == spellType);
//       if (spell) spell.execute();
//     }
//     networkController(data: { dx: number; dy: number }) {
//       this.dx = data.dx - this.tankBody.posX;
//       this.dy = data.dy - this.tankBody.posY;
//     }
//   }
// function toDeg(num: number) {
//     return (num * 180) / Math.PI + 90;
// }
// function toRad(num: number) {
//     return ((num - 90) * Math.PI) / 180;
// }
