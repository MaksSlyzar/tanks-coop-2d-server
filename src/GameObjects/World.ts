import Matter, { Bodies, Engine, Body, World } from "matter-js";
import GameObject from "./GameObject";

export default class WorldGameObject {
  world: World;
  engine: Engine;

  constructor() {
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.world.gravity.x = 0;
    this.world.gravity.y = 0;
  }
}
