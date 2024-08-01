"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameManager_1 = __importDefault(require("../managers/GameManager"));
const RoomManager_1 = __importDefault(require("../managers/RoomManager"));
class Room {
    constructor(roomCode, io) {
        this.roomCode = roomCode;
        this.players = [];
        this.io = io;
        this.gameManager = new GameManager_1.default(this);
        this.roomType = "Normal";
        this.leaderPlayerId = null;
    }
    removePlayer(socketId) {
        const player = RoomManager_1.default.getPlayerBySocketId(socketId);
        if (player) {
            if (player.id == this.leaderPlayerId)
                RoomManager_1.default.deleteRoom(this.roomCode);
        }
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].socket.id == socketId) {
                this.players.splice(i, 1);
                this.io.to(this.roomCode).emit("updatePlayerList", { players: this.players.map(p => p.networkData()) });
                return true;
            }
        }
        return false;
    }
    joinRoom(player) {
        if (this.leaderPlayerId == null)
            this.leaderPlayerId = player.id;
        this.players.push(player);
        player.socket.rooms.clear();
        player.socket.join(this.roomCode);
        player.roomReady = false;
        this.updateRoomViewData();
    }
    updateRoomViewData() {
        this.io.to(this.roomCode).emit("updateRoomViewData", this.networkData());
    }
    startGame() {
        this.gameManager.generateTanks();
    }
    networkData() {
        return {
            roomName: this.roomCode,
            players: this.players.map(player => player.networkData()),
            roomType: this.roomType
        };
    }
}
exports.default = Room;
