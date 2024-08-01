import GameManager from "../../managers/GameManager";
import {
    Vector2d,
    quadColliderMesh,
    satCollide,
    updateShape,
} from "../../modules/SAT";
import GameObject from "../GameObject";

export class Projectile extends GameObject {
    speed: number;
    posX: number;
    posY: number;
    rotation: number;
    tankBodyId: number;
    width: number;
    height: number;
    gameManager: GameManager;
    startX: number;
    startY: number;
    tag: string = "projectile";

    constructor(
        gameManager: GameManager,
        speed: number,
        position: Vector2d,
        rotation: number,
        tankBodyId: number
    ) {
        super(gameManager);
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
            shape: quadColliderMesh(this.width, this.height),
        };
    }

    update(deltaTime: number) {
        if (this.collidingProps == null) return;

        this.collidingProps.activeShape = updateShape(
            this.posX + this.width / 2,
            this.posY + this.height / 2,
            this.rotation,
            this.collidingProps.shape
        );

        this.posX += Math.cos(this.rotation) * (this.speed * deltaTime);
        this.posY += Math.sin(this.rotation) * (this.speed * deltaTime);

        const distance = Math.sqrt(
            Math.pow(Math.abs(this.posY - this.startY), 2) +
                Math.pow(Math.abs(this.startX - this.posX), 2)
        );

        if (distance > 1000) {
            this.destroyObject();
        }
    }

    destroyObject() {
        const projectile = this.gameManager.gameObjects.projectiles.findIndex(
            (_projectile) => _projectile.id == this.id
        );

        if (projectile != null)
            this.gameManager.gameObjects.projectiles.splice(projectile, 1);
    }

    onCollide(posX: number, posY: number, gameObject: GameObject): void {}

    render() {}

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
