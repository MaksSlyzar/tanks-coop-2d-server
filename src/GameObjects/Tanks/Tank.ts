import { Bodies, Body, Composite } from "matter-js";
import GameObjectUpdate from "../GameObjectUpdate";
import GameManager from "../../managers/GameManager";
import Player from "../../room/Player";
import RoomManager from "../../managers/RoomManager";

function toDeg(rad: number) {
    return rad * (180 / Math.PI);
}

function toRad(deg: number) {
    return deg * (Math.PI / 180);
}

export class Tank extends GameObjectUpdate {
    //Constants
    acceleration: number = 0.001; // Acceleration
    maxSpeed: number = 0.05; // Maximum speed
    maxRotationSpeed: number = 5.5; // Maximum rotation speed
    rotationFactor: number = 6.5; // Rotation factor
    turnSpeed: number = 0.15; // Turn speed
    friction: number = 0.0005; // Friction for inertia
    rotationSpeed: number = 0.005;
    body!: Body;
    player: Player;

    speed: number = 0;

    constructor(gameManager: GameManager, player: Player) {
        super(gameManager);

        this.player = player;
    }

    update(deltaTime: number): void {}

    networkData() {
        return {};
    }

    networkController(data: any) {}

    useSpell(data: any) {}
}

export class HeavyTank extends Tank {
    body: Body;

    //Constants
    acceleration: number = 0.001; // Acceleration
    maxSpeed: number = 0.05; // Maximum speed
    maxRotationSpeed: number = 5.5; // Maximum rotation speed
    rotationFactor: number = 6.5; // Rotation factor
    turnSpeed: number = 0.15; // Turn speed
    friction: number = 0.0005; // Friction for inertia

    speed: number = 0;

    networkRotate: "LEFT" | "RIGHT" | "NONE" = "NONE";
    networkMovement: "UP" | "DOWN" | "NONE" = "NONE";

    weapon: Weapon;

    constructor(gameManager: GameManager, player: Player) {
        super(gameManager, player);
        this.body = Bodies.rectangle(0, 200, 116, 70, {
            // inertia: Infinity,
            friction: 0.5,
            frictionAir: 0.5,
            mass: 8,
        });

        this.weapon = new Weapon(gameManager, this);

        const world = gameManager.world.world;

        Composite.add(world, this.body);
    }

    update(deltaTime: number): void {
        const forceMagnitude = 0.1;

        // Accelerate or decelerate the tank
        if (this.networkMovement === "UP") {
            this.speed = Math.min(
                this.speed + this.acceleration,
                this.maxSpeed
            ); // Increase speed
        } else if (this.networkMovement === "DOWN") {
            this.speed = Math.max(
                this.speed - this.acceleration,
                -this.maxSpeed
            ); // Decrease speed
        } else {
            // Apply friction to slow down the tank when not accelerating
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - this.friction, 0);
            } else if (this.speed < 0) {
                this.speed = Math.min(this.speed + this.friction, 0);
            }
        }

        //Rotation
        const mass = this.body.mass;
        const rotationSpeedTank =
            (this.speed > 0
                ? this.speed * this.rotationFactor
                : this.turnSpeed) / mass;

        if (this.networkRotate === "LEFT") {
            Body.setAngularVelocity(this.body, -rotationSpeedTank);
        } else if (this.networkRotate == "RIGHT") {
            Body.setAngularVelocity(this.body, rotationSpeedTank);
        }

        // Apply force to the tank based on its speed
        Body.applyForce(this.body, this.body.position, {
            x: this.speed * Math.cos(this.body.angle),
            y: this.speed * Math.sin(this.body.angle),
        });

        this.weapon.update(deltaTime);
    }

    networkController(data: {
        rotate: "LEFT" | "RIGHT" | "NONE";
        movement: "UP" | "DOWN" | "NONE";
        weapon: {
            dx: number;
            dy: number;
        };
    }) {
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

export class Weapon {
    tank: Tank;
    rotation: number;
    rotationSpeed: number;
    dx: number = 0;
    dy: number = 0;

    constructor(gameManager: GameManager, tank: Tank) {
        // super(gameManager);
        this.rotationSpeed = 0.225;
        this.rotation = 0.09;
        this.tank = tank;

        if (tank.player.roomCode == null) return;

        const room = RoomManager.getRoomByCode(tank.player.roomCode);

        if (room?.gameManager == null) return;

        // this.spells.push(new ShootSpell(room.gameManager, tankBody.player));
    }

    update(deltaTime: number): void {
        const addRotation =
            -Math.atan2(this.dx, this.dy) + (90 * Math.PI) / 180;

        if (
            Math.abs(addRotation - this.rotation - this.tank.body.angle) <= 0.04
        ) {
            this.rotation = addRotation - this.tank.body.angle;
            return;
        }

        if (addRotation > this.rotation + this.tank.body.angle) {
            if (
                360 -
                    toDeg(addRotation) +
                    toDeg(this.rotation + this.tank.body.angle) <
                toDeg(addRotation) - toDeg(this.rotation + this.tank.body.angle)
            ) {
                this.rotation -= this.rotationSpeed * deltaTime;
            } else {
                this.rotation += this.rotationSpeed * deltaTime;
            }
        } else {
            if (
                360 -
                    toDeg(this.rotation + this.tank.body.angle) +
                    toDeg(addRotation) <
                toDeg(this.rotation + this.tank.body.angle) - toDeg(addRotation)
            ) {
                this.rotation += this.rotationSpeed * deltaTime;
            } else {
                this.rotation -= this.rotationSpeed * deltaTime;
            }
        }

        if (this.rotation + this.tank.body.angle < -1.57) {
            this.rotation = 6.28 - 1.57 - this.tank.body.angle;
        } else if (this.rotation + this.tank.body.angle > 6.28 - 1.57) {
            this.rotation = -1.57 - this.tank.body.angle;
        }
    }

    networkController(data: { dx: number; dy: number }) {
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
