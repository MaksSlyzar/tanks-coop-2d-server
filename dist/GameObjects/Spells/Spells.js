"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShootSpell = exports.Spell = void 0;
// import { HeavyTankBody } from "../TankBody";
class Spell {
    constructor(gameManager, player) {
        this.gameManager = gameManager;
        this.player = player;
        this.cooldown = 0;
        this.spellType = null;
        this.lastTime = new Date();
        this.currentTime = new Date();
    }
    setCooldown() {
        this.lastTime = new Date();
    }
    isCooldown() {
        return ((new Date().getTime() - this.lastTime.getTime()) / 1000 >
            this.cooldown);
    }
    execute() { }
    network() {
        return {
            cooldown: this.cooldown,
            lastTime: this.lastTime,
        };
    }
}
exports.Spell = Spell;
class ShootSpell extends Spell {
    constructor(gameManager, player) {
        super(gameManager, player);
        this.cooldown = 0.1;
        this.spellType = "shoot";
    }
    execute() {
        if (this.isCooldown())
            this.setCooldown();
        else
            return;
        // let tankBody = this.player.tankBody as HeavyTankBody;
        // if (!tankBody) return;
        // const { rotation, width, height, posX, posY } = tankBody;
        // const weaponRotation = tankBody.weapon.rotation;
        // const spawnX = Math.cos(weaponRotation + rotation) * 70 + posX + width / 2;
        // const spawnY = Math.sin(weaponRotation + rotation) * 70 + posY + height / 2;
        // const projectile = new Projectile(
        //   this.gameManager,
        //   200,
        //   { x: spawnX, y: spawnY },
        //   rotation + weaponRotation,
        //   tankBody.id
        // );
        // this.gameManager.gameObjects.projectiles.push(projectile);
    }
}
exports.ShootSpell = ShootSpell;
