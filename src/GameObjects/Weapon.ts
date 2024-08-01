import GameManager from "../managers/GameManager";
import RoomManager from "../managers/RoomManager";
import GameObject from "./GameObject";
import { ShootSpell, Spell } from "./Spells/Spells";
import { HeavyTankBody } from "./TankBody";

export class Weapon extends GameObject {
  spells: Array<Spell> = [];

  constructor(gameManager: GameManager) {
    super(gameManager);
  }
}

export class HeavyWeapon extends Weapon {
  tankBody: HeavyTankBody;
  rotation: number;
  rotationSpeed: number;
  dx: number = 0;
  dy: number = 0;

  constructor(gameManager: GameManager, tankBody: HeavyTankBody) {
    super(gameManager);
    this.rotationSpeed = 0.225;
    this.rotation = 0.09;
    this.tankBody = tankBody;

    if (tankBody.player.roomCode == null) return;

    const room = RoomManager.getRoomByCode(tankBody.player.roomCode);

    if (room?.gameManager == null) return;

    this.spells.push(new ShootSpell(room.gameManager, tankBody.player));
  }

  update(deltaTime: number): void {
    const addRotation = -Math.atan2(this.dx, this.dy) + (90 * Math.PI) / 180;

    if (
      Math.abs(addRotation - this.rotation - this.tankBody.rotation) <= 0.04
    ) {
      this.rotation = addRotation - this.tankBody.rotation;
      return;
    }

    if (addRotation > this.rotation + this.tankBody.rotation) {
      if (
        360 -
          toDeg(addRotation) +
          toDeg(this.rotation + this.tankBody.rotation) <
        toDeg(addRotation) - toDeg(this.rotation + this.tankBody.rotation)
      ) {
        this.rotation -= this.rotationSpeed * deltaTime;
      } else {
        this.rotation += this.rotationSpeed * deltaTime;
      }
    } else {
      if (
        360 -
          toDeg(this.rotation + this.tankBody.rotation) +
          toDeg(addRotation) <
        toDeg(this.rotation + this.tankBody.rotation) - toDeg(addRotation)
      ) {
        this.rotation += this.rotationSpeed * deltaTime;
      } else {
        this.rotation -= this.rotationSpeed * deltaTime;
      }
    }

    if (this.rotation + this.tankBody.rotation < -1.57) {
      this.rotation = 6.28 - 1.57 - this.tankBody.rotation;
    } else if (this.rotation + this.tankBody.rotation > 6.28 - 1.57) {
      this.rotation = -1.57 - this.tankBody.rotation;
    }
  }

  network() {
    return {
      rotation: this.rotation,
      spells: this.spells.map((spell) => spell.network()),
    };
  }

  useSpell(data: any) {
    const { spellType } = data;

    const spell = this.spells.find((sp) => sp.spellType == spellType);

    if (spell) spell.execute();
  }

  networkController(data: { dx: number; dy: number }) {
    this.dx = data.dx - this.tankBody.posX;
    this.dy = data.dy - this.tankBody.posY;
  }
}

function toDeg(num: number) {
  return (num * 180) / Math.PI + 90;
}

function toRad(num: number) {
  return ((num - 90) * Math.PI) / 180;
}
