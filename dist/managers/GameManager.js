"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Builds_1 = require("../GameObjects/Builds/Builds");
const Enemies_1 = require("../GameObjects/Enemies/Enemies");
const events_1 = require("../server/events");
const Wall_1 = __importDefault(require("../GameObjects/Walls/Wall"));
const RoomManager_1 = __importDefault(require("./RoomManager"));
const World_1 = __importDefault(require("../GameObjects/World"));
const Box_1 = require("../GameObjects/Box/Box");
const matter_js_1 = __importDefault(require("matter-js"));
const Tank_1 = require("../GameObjects/Tanks/Tank");
class GameManager {
    constructor(room) {
        this.wave = 1;
        this.generateWave = -1;
        this.baseBuild = null;
        this.waveEnemies = 3;
        this.room = room;
        this.currentTime = new Date();
        this.diff = 0;
        this.deltaTime = 0;
        this.lastDate = new Date();
        this.gameObjects = {
            tankBodies: [],
            projectiles: [],
            enemies: [],
            builds: [],
            walls: [],
            newGameObjects: [],
        };
        this.world = new World_1.default();
    }
    gameEnd() {
        this.room.io.to(this.room.roomCode).emit("gameEnd", {
            enemiesKilled: 0,
            topOne: "",
        });
        RoomManager_1.default.deleteRoom(this.room.roomCode);
    }
    generateTanks() {
        this.room.players.forEach((player, index) => {
            switch (player.gameRole) {
                case "heavy":
                    player.tankBody = new Tank_1.HeavyTank(this, player);
                    break;
            }
            if (player.tankBody != null) {
                // player.tankBody.body.position.y = 0;
                this.gameObjects.tankBodies.push(player.tankBody);
            }
        });
        const baseBuild = new Builds_1.BaseBuild(this);
        for (let i = 0; i < 3; i++) {
            const testEnemy = new Enemies_1.TestEnemy(this, baseBuild);
            testEnemy.posX = (0, events_1.getRandomInt)(0, 3000);
            testEnemy.posY = -100;
            this.gameObjects.enemies.push(testEnemy);
        }
        this.gameObjects.walls.push(new Wall_1.default(this, 0, 0, 32, 5000));
        this.gameObjects.walls.push(new Wall_1.default(this, 0, 0, 5000, 32));
        this.baseBuild = baseBuild;
        this.gameObjects.builds.push(baseBuild);
        this.room.players.map((pl) => (pl.gameSession = "playing"));
        for (let i = 0; i < 10; i++) {
            const box = new Box_1.Box(this, i * 100, 0);
            this.gameObjects.newGameObjects.push(box);
        }
        this.createGameObjectsEvent(null);
        this.update();
    }
    createGameObjectsEvent(socket) {
        const playersData = this.room.players.map((player) => player.networkData());
        if (socket == null)
            this.room.io.to(this.room.roomCode).emit("createGameObjects", {
                players: playersData,
                gameObjects: {
                    enemies: this.gameObjects.enemies.map((gameObject) => gameObject.network()),
                    tankBodies: this.gameObjects.tankBodies.map((tankBody) => tankBody.networkData()),
                    projectiles: this.gameObjects.projectiles.map((projectile) => projectile.network()),
                    builds: this.gameObjects.builds.map((build) => build.network()),
                    newGameObjects: this.gameObjects.newGameObjects.map((go) => go.network()),
                },
            });
        else
            socket.emit("createGameObjects", {
                players: playersData,
                gameObjects: {
                    enemies: this.gameObjects.enemies.map((gameObject) => gameObject.network()),
                    tankBodies: this.gameObjects.tankBodies.map((tankBody) => tankBody.networkData()),
                    projectiles: this.gameObjects.projectiles.map((projectile) => projectile.network()),
                    builds: this.gameObjects.builds.map((build) => build.network()),
                    newGameObjects: this.gameObjects.newGameObjects.map((go) => go.network()),
                },
            });
    }
    collision() {
        // const collidingGameObjects = [
        //     ...this.gameObjects.projectiles.filter(
        //         (_projectile) => _projectile.collidingProps != null
        //     ),
        //     ...this.gameObjects.builds.filter(
        //         (_build) => _build.collidingProps != null
        //     ),
        //     ...this.gameObjects.enemies.filter(
        //         (_enemy) => _enemy.collidingProps != null
        //     ),
        //     ...this.gameObjects.tankBodies.filter(
        //         (_tankBody) => _tankBody.collidingProps != null
        //     ),
        // ];
        // collidingGameObjects.forEach((gameObject) => {
        //     if (gameObject.collidingProps == null) return;
        //     for (let testCollide of collidingGameObjects) {
        //         if (testCollide.id == gameObject.id) continue;
        //         if (testCollide.collidingProps == null) continue;
        //         const test1 = updateShape(
        //             testCollide.posX + testCollide.width / 2,
        //             testCollide.posY + testCollide.height / 2,
        //             testCollide.rotation,
        //             testCollide.collidingProps.shape
        //         );
        //         const test2 = updateShape(
        //             gameObject.posX + gameObject.width / 2,
        //             gameObject.posY + gameObject.height / 2,
        //             gameObject.rotation,
        //             gameObject.collidingProps.shape
        //         );
        //         let collide = satCollide(test1, test2);
        //         if (!collide) return;
        //         // diagCollide(polygon1, polygon2);
        //         gameObject.onCollide(0, 0, testCollide);
        //         testCollide.onCollide(0, 0, gameObject);
        //     }
        // });
    }
    waveTimer() {
        this.generateWave -= 1;
        if (this.generateWave == -1) {
            this.wave += 1;
            if (this.baseBuild == null)
                return;
            for (let i = 0; i < this.wave * 3; i++) {
                const testEnemy = new Enemies_1.TestEnemy(this, this.baseBuild);
                testEnemy.posX = (0, events_1.getRandomInt)(0, 3000);
                testEnemy.posY = -100;
                this.gameObjects.enemies.push(testEnemy);
            }
            this.waveEnemies = this.wave * 3;
        }
        else {
            setTimeout(() => this.waveTimer(), 1000);
        }
    }
    update() {
        if (this.gameObjects.enemies.length == 0) {
            if (this.generateWave == -1) {
                this.generateWave = 15;
                this.waveTimer();
            }
        }
        this.currentTime = new Date();
        this.diff = this.currentTime.getTime() - this.lastDate.getTime();
        this.deltaTime = this.diff / 100;
        const gameObjects = [
            ...this.gameObjects.enemies,
            ...this.gameObjects.projectiles,
            ...this.gameObjects.tankBodies,
            ...this.gameObjects.builds,
            ...this.gameObjects.walls,
            ...this.gameObjects.newGameObjects,
        ];
        gameObjects.map((go) => {
            go.update(this.deltaTime);
        });
        matter_js_1.default.Engine.update(this.world.engine, 1000 / 60);
        this.room.io.to(this.room.roomCode).emit("sendSyncData", {
            players: this.room.players.map((player) => player.networkData()),
            gameObjects: {
                enemies: this.gameObjects.enemies.map((gameObject) => gameObject.network()),
                tankBodies: this.gameObjects.tankBodies.map((tankBody) => tankBody.networkData()),
                projectiles: this.gameObjects.projectiles.map((projectile) => projectile.network()),
                builds: this.gameObjects.builds.map((build) => build.network()),
                newGameObjects: this.gameObjects.newGameObjects.map((go) => go.network()),
            },
            wave: this.wave,
            generateWave: this.generateWave,
            waveEnemies: this.waveEnemies,
        });
        this.lastDate = this.currentTime;
        setTimeout(() => this.update(), 1000 / 60);
    }
}
exports.default = GameManager;
