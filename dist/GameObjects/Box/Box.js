"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box = void 0;
const matter_js_1 = __importStar(require("matter-js"));
const GameObjectUpdate_1 = __importDefault(require("../GameObjectUpdate"));
class Box extends GameObjectUpdate_1.default {
    constructor(gameManager, x, y) {
        super(gameManager);
        this.vx = 0;
        this.body = matter_js_1.Bodies.rectangle(x, y, 50, 50, {
            friction: 0.1,
            // inertia: Infinity,
            frictionAir: 0.1,
            isStatic: false,
            mass: 1,
        });
        const world = gameManager.world.world;
        matter_js_1.Composite.add(world, this.body);
    }
    update(deltaTime) {
        matter_js_1.default.Body.setVelocity(this.body, { x: this.vx, y: 0 });
    }
    network() {
        return {
            position: this.body.position,
            rotation: this.body.angle,
            id: this.id,
        };
    }
}
exports.Box = Box;
