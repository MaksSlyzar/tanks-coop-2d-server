import GameManager from "../../managers/GameManager";
import { quadColliderMesh, updateShape } from "../../modules/SAT";
import GameObject from "../GameObject";

class Wall extends GameObject {
    collision: boolean;

    constructor(
        gameManager: GameManager,
        posX: number,
        posY: number,
        width: number,
        height: number
    ) {
        super(gameManager);
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.collision = false;
        this.collidingProps = {
            activeShape: [],
            shape: quadColliderMesh(this.width, this.height),
        };
    }

    update() {
        if (this.collidingProps)
            this.collidingProps.activeShape = updateShape(
                this.posX + this.width / 2,
                this.posY + this.height / 2,
                this.rotation,
                this.collidingProps.shape
            );
    }
}

export default Wall;
