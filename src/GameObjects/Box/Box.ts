import Matter, { Bodies, Body, Composite, Constraint } from "matter-js";
import GameManager from "../../managers/GameManager";
import GameObjectUpdate from "../GameObjectUpdate";

export class Box extends GameObjectUpdate {
    vx: number = 0;
    body: Body;

    constructor(gameManager: GameManager, x: number, y: number) {
        super(gameManager);
        this.body = Bodies.rectangle(x, y, 50, 50, {
            friction: 0.1,
            // inertia: Infinity,
            frictionAir: 0.1,
            isStatic: false,
            mass: 1,
        });

        const world = gameManager.world.world;
        Composite.add(world, this.body);
    }

    update(deltaTime: number): void {
        Matter.Body.setVelocity(this.body, { x: this.vx, y: 0 });
    }

    network() {
        return {
            position: this.body.position,
            rotation: this.body.angle,
            id: this.id,
        };
    }
}
