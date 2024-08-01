"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../server/events");
const RoomManager_1 = __importDefault(require("../managers/RoomManager"));
class Player {
    constructor(socket, username, token) {
        this.roomReady = false;
        this.socket = socket;
        this.username = username;
        this.token = token;
        this.id = Number((0, events_1.generateToken)());
        this.isOnline = true;
        this.gameSession = "menu";
        this.roomCode = null;
        this.isRoomLeader = false;
        this.gameRole = null;
        this.tankBody = null;
    }
    networkData() {
        var _a;
        const netData = {
            socketId: this.socket.id,
            username: this.username,
            id: this.id,
            token: this.token,
            gameSession: this.gameSession,
            isOnline: this.isOnline,
            roomReady: this.roomReady,
            isRoomLeader: this.isRoomLeader,
            tankBody: (_a = this.tankBody) === null || _a === void 0 ? void 0 : _a.networkData(),
            gameRole: this.gameRole,
        };
        return netData;
    }
    changeSocket(socket) {
        this.socket = socket;
    }
    connect() {
        this.isOnline = true;
        console.log(`User "${this.username}" is online`);
        if (this.roomCode != null)
            this.socket.join(this.roomCode);
    }
    disconnect() {
        var _a;
        this.isOnline = false;
        console.log(`User "${this.username}" is offline`);
        if (this.roomCode != null && this.gameSession == "room") {
            this.roomReady = false;
            (_a = RoomManager_1.default.getRoomByCode(this.roomCode)) === null || _a === void 0 ? void 0 : _a.updateRoomViewData();
        }
    }
}
exports.default = Player;
