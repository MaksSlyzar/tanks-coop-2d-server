"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = __importDefault(require("../room/Player"));
const Room_1 = __importDefault(require("../room/Room"));
class RoomManager {
    constructor() {
        this.rooms = [];
        this.players = [];
    }
    getPlayerById(id) { }
    getPlayerByToken(token) {
        return this.players.find((player) => player.token == token);
    }
    getPlayerBySocketId(socketId) {
        return this.players.find((player) => player.socket.id == socketId);
    }
    createPlayer(socket, username, token) {
        const player = new Player_1.default(socket, username, token);
        this.players.push(player);
        return player;
    }
    getRoomByCode(roomCode) {
        return this.rooms.find((r) => r.roomCode == roomCode);
    }
    deleteRoom(roomCode) {
        const roomIndex = this.rooms.findIndex((room) => room.roomCode == roomCode);
        if (roomCode)
            this.rooms.splice(roomIndex, 1);
    }
    join(roomCode, player) {
        const room = this.getRoomByCode(roomCode);
        if (room == undefined)
            return null;
        this.rooms.map((r) => r.removePlayer(player.socket.id));
        room.joinRoom(player);
        player.socket.join(room.roomCode);
        player.roomCode = room.roomCode;
        player.gameSession = "room";
        player.socket.emit("joinRoomSuccessfully", room.networkData());
        return room;
    }
    create(roomCode, io) {
        const newRoom = new Room_1.default(roomCode, io);
        this.rooms.push(newRoom);
        return newRoom;
    }
}
exports.default = new RoomManager();
