import GameManager from "../../managers/GameManager";
import { quadColliderMesh, satCollide, updateShape } from "../../modules/SAT";
import { BaseBuild, GoldBuild } from "../Builds/Builds";
import GameObject from "../GameObject";
import { Projectile } from "../Projectiles/Projectiles";
import { TankBody } from "../TankBody";

export class Enemy extends GameObject {
    _type: "test" | "none";
    hp: number;
    maxHp: number;
    collision: boolean = false;

    constructor(gameManager: GameManager) {
        super(gameManager);
        this._type = "none";
        this.hp = 1;
        this.maxHp = 1;
    }

    network() {
        return {
            posX: this.posX,
            posY: this.posY,
            rotation: this.rotation,
            id: this.id,
            _type: this._type,
            hp: this.hp,
            maxHp: this.maxHp,
        };
    }

    decraseHp(damage: number) {
        //TODO: decrase hp function
        this.hp -= damage;

        if (this.hp < 0) {
            this.onDie();

            this.destroyObject();
        }
    }

    destroyObject() {
        const enemy = this.gameManager.gameObjects.enemies.findIndex(
            (_enemy) => _enemy.id == this.id
        );

        if (enemy != null)
            this.gameManager.gameObjects.enemies.splice(enemy, 1);
    }

    onDie() {}
}

export class TestEnemy extends Enemy {
    damageTarget: GameObject;
    damageTargetType: "build" | "tankBody";
    speed = 10;
    width: number = 30;
    height: number = 30;
    tag: string = "enemy";
    cooldown: number;
    lastTime: Date;
    currentTime: Date;

    constructor(gameManager: GameManager, damageTarget: GameObject) {
        super(gameManager);

        this.collision = false;
        this.collidingProps = {
            activeShape: [],
            shape: quadColliderMesh(this.width, this.height),
        };

        this._type = "test";
        this.damageTargetType = "build";
        this.damageTarget = damageTarget;

        this.posX = 100;
        this.posY = 100;

        this.hp = 100;
        this.maxHp = 100;
        this.lastTime = new Date();
        this.currentTime = new Date();
        this.cooldown = 0.5;
    }

    onDie(): void {
        const gold = new GoldBuild(this.gameManager);
        gold.posX = this.posX;
        gold.posY = this.posY;
        this.gameManager.gameObjects.builds.push(gold);
    }

    update(deltaTime: number) {
        // this.rotation = Math.atan2(
        //   this.damageTarget.posY + this.damageTarget.height / 2 - this.posY,
        //   this.damageTarget.posX + this.damageTarget.width / 2 - this.posX
        // );
        // const distance = Math.sqrt(
        //   Math.pow(this.posX - this.damageTarget.posX, 2) +
        //     Math.pow(this.posY - this.damageTarget.posY, 2)
        // );
        // if (distance > 20) {
        //   this.posX += Math.cos(this.rotation) * this.speed * deltaTime;
        //   this.posY += Math.sin(this.rotation) * this.speed * deltaTime;
        // }
        // if (this.collidingProps == null) return;
        // this.collidingProps.activeShape = updateShape(
        //   this.posX + this.width / 2,
        //   this.posY + this.height / 2,
        //   this.rotation,
        //   this.collidingProps.shape
        // );
        // const collidingGameObjects = [
        //   ...this.gameManager.gameObjects.projectiles.filter(
        //     (_projectile) => _projectile.collidingProps != null
        //   ),
        //   ...this.gameManager.gameObjects.builds.filter(
        //     (_build) => _build.collidingProps != null
        //   ),
        //   ...this.gameManager.gameObjects.enemies.filter(
        //     (_enemy) => _enemy.collidingProps != null
        //   ),
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

    onCollide(posX: number, posY: number, gameObject: GameObject): void {
        if (gameObject.tag == "projectile") {
            this.decraseHp(20);
            // const projectile = gameObject as Projectile;
            // projectile.destroyObject();
        }
        if (!this.isCooldown()) return;

        // console.log(gameObject.tag);

        if (gameObject.tag == "tank") {
            const tank = gameObject as TankBody;
            tank.decraseHp(1.01);
            this.damageTarget = tank;
            this.setCooldown();
        }

        if (gameObject.tag == "base") {
            const base = gameObject as BaseBuild;
            base.decraseHp(1.01);
            this.setCooldown();
        }
    }

    setCooldown() {
        this.lastTime = new Date();
    }

    isCooldown() {
        return (
            (new Date().getTime() - this.lastTime.getTime()) / 1000 >
            this.cooldown
        );
    }
}
