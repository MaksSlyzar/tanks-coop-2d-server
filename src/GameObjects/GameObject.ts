import GameManager from "../managers/GameManager";
import { Vector2d } from "../modules/SAT";
import { generateToken } from "../server/events";

export default class GameObject {
  posX: number = -1;
  posY: number = -1;
  rotation: number = 0;
  collidingProps: {
    shape: Array<Vector2d>;
    activeShape: Array<Vector2d>;
  } | null = null;
  id: number;
  tag: string;
  width: number = 1;
  height: number = 1;
  gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.id = Number(generateToken());
    this.tag = "";
    this.gameManager = gameManager;
  }

  update(deltaTime: number) {}

  network() {}

  onCollide(posX: number, posY: number, gameObject: GameObject) {}
}
