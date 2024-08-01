import GameManager from "../../managers/GameManager";
import { quadColliderMesh, satCollide, updateShape } from "../../modules/SAT";
import GameObject from "../GameObject";
import { TankBody } from "../TankBody";
import Wall from "../Walls/Wall";

export class Build extends GameObject {
    hp: number;
    maxHp: number;
    width: number = 0;
    height: number = 0;
    type: "none" | "base" | "gold";

    constructor(gameManager: GameManager) {
        super(gameManager);

        this.hp = 1;
        this.maxHp = 1;
        this.type = "none";
    }

    decraseHp(damage: number) {
        this.hp -= damage;

        if (this.hp < 0) {
            this.hp = this.maxHp;
            this.posX = 0;
            this.posY = 0;
            this.destroyObject();
        }
    }

    destroyObject() {
        const build = this.gameManager.gameObjects.builds.findIndex(
            (_build) => _build.id == this.id
        );

        if (build != null) this.gameManager.gameObjects.builds.splice(build, 1);
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

export class GoldBuild extends Build {
    width: number = 24;
    height: number = 24;
    tag: string = "gold";

    constructor(gameManger: GameManager) {
        super(gameManger);
        this.type = "gold";

        this.collidingProps = {
            activeShape: [],
            shape: quadColliderMesh(this.width, this.height),
        };
    }

    update() {
        if (this.collidingProps == null) return;

        this.collidingProps.activeShape = updateShape(
            this.posX + this.width / 2,
            this.posY + this.height / 2,
            this.rotation,
            this.collidingProps.shape
        );

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

    onCollide(posX: number, posY: number, gameObject: GameObject): void {
        if (gameObject.tag == "tank") {
            const tankBody = gameObject as TankBody;
            tankBody.gold += 5;

            this.destroyObject();
        }
    }
}

export class BaseBuild extends Build {
    width: number = 400;
    height: number = 200;
    tag: string = "base";

    constructor(gameManager: GameManager) {
        super(gameManager);
        this.posX = 1000;
        this.posY = 1000;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.type = "base";

        this.collidingProps = {
            activeShape: [],
            shape: quadColliderMesh(this.width, this.height),
        };

        gameManager.gameObjects.walls.push(
            new Wall(gameManager, this.posX, this.posY - 5, this.width, 10),
            new Wall(
                gameManager,
                this.posX,
                this.posY + this.height,
                this.width,
                10
            )
        );
    }

    destroyObject(): void {
        // this.gameManager.gameEnd();
    }

    update() {
        if (this.collidingProps == null) return;

        this.collidingProps.activeShape = updateShape(
            this.posX + this.width / 2,
            this.posY + this.height / 2,
            this.rotation,
            this.collidingProps.shape
        );
    }
}
