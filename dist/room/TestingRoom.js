"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = __importDefault(require("./Room"));
class TestingRoom extends Room_1.default {
    constructor(io) {
        super("testing room", io);
    }
    joinRoom(player) {
        if (this.players.length == 0) {
            player.isRoomLeader = true;
            // this.leaderPlayerId = String(player.id);
        }
        this.players.push(player);
        player.socket.join(this.roomCode);
        player.roomReady = false;
        this.updateRoomViewData();
    }
}
exports.default = TestingRoom;
