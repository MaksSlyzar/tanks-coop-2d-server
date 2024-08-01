"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
exports.generateToken = generateToken;
exports.getRandomInt = getRandomInt;
const RoomManager_1 = __importDefault(require("../managers/RoomManager"));
function generateToken() {
    return String(Math.round(Math.random() * 1000000));
}
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
exports.events = {
    register: {
        execute(socket, io, data) {
            const { username } = data;
            const player = RoomManager_1.default.createPlayer(socket, username, generateToken());
            socket.join("menu");
            socket.emit("authSuccessfully", Object.assign(Object.assign({}, player.networkData()), { token: player.token }));
            const roomData = RoomManager_1.default.rooms.map((room) => room.networkData());
            socket.emit("updateRoomList", { roomsData: roomData });
            return true;
        },
    },
    authByToken: {
        execute(socket, io, data) {
            var _a;
            const token = data;
            const player = RoomManager_1.default.getPlayerByToken(token);
            if (player == null) {
                socket.emit("authFailed", "error token");
                return false;
            }
            player.changeSocket(socket);
            socket.emit("authSuccessfully", Object.assign(Object.assign({}, player.networkData()), { token: player.token }));
            player.connect();
            if (player.gameSession == "menu") {
                socket.join("menu");
                const roomData = RoomManager_1.default.rooms.map((room) => room.networkData());
                socket.emit("updateRoomList", { roomsData: roomData });
            }
            else if (player.gameSession == "room") {
                if (player.roomCode != null) {
                    const room = RoomManager_1.default.getRoomByCode(player.roomCode);
                    if (room == undefined)
                        return false;
                    room.updateRoomViewData();
                }
            }
            else if (player.gameSession == "playing") {
                if (player.roomCode != null) {
                    const room = RoomManager_1.default.getRoomByCode(player.roomCode);
                    if (room == undefined)
                        return false;
                    (_a = room.gameManager) === null || _a === void 0 ? void 0 : _a.createGameObjectsEvent(socket);
                }
            }
            return true;
        },
    },
    connection: {
        execute(socket, io, data) {
            return true;
        },
    },
    createRoom: {
        execute(socket, io, data) {
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (player == null)
                return false;
            RoomManager_1.default.create(data.roomName, io);
            player.isRoomLeader = true;
            const roomData = RoomManager_1.default.rooms.map((room) => room.networkData());
            io.to("menu").emit("updateRoomList", { roomsData: roomData });
            RoomManager_1.default.join(data.roomName, player);
            return true;
        },
    },
    joinRoom: {
        execute(socket, io, data) {
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (player == null)
                return false;
            const room = RoomManager_1.default.join(data.lobbyCode, player);
            if (room == null)
                return false;
            return true;
        },
    },
    switchRoomReady: {
        execute(socket, io, data) {
            var _a;
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            const { ready } = data;
            const role = data.role;
            if (player == null)
                return false;
            player.roomReady = ready;
            if (player.roomCode) {
                (_a = RoomManager_1.default.getRoomByCode(player.roomCode)) === null || _a === void 0 ? void 0 : _a.updateRoomViewData();
                player.gameRole = role;
            }
            return true;
        },
    },
    disconnect: {
        execute(socket, io, data) {
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (player != null) {
                player.disconnect();
            }
            return true;
        },
    },
    startRoomGame: {
        execute(socket, io, data) {
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (player == null)
                return false;
            if (player.roomCode == null)
                return false;
            const room = RoomManager_1.default.getRoomByCode(player.roomCode);
            if (player.isRoomLeader == false)
                return false;
            room === null || room === void 0 ? void 0 : room.startGame();
            return true;
        },
    },
    sendMoveData: {
        execute(socket, io, data) {
            var _a;
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (!player)
                return false;
            (_a = player.tankBody) === null || _a === void 0 ? void 0 : _a.networkController(data);
            return true;
        },
    },
    sendSyncData: {
        execute(socket, io, data) {
            // const player = RoomManager.getPlayerBySocketId(socket.id);
            // if (player == null) return false;
            // if (player.tankBody == null) return false;
            // player.tankBody.posX = data.tankBody.posX;
            // player.tankBody.posY = data.tankBody.posY;
            // player.tankBody.rotation = data.tankBody.rotation;
            // return true;
            return false;
        },
    },
    useSpell: {
        execute(socket, io, data) {
            var _a;
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (!player)
                return false;
            if (player.gameSession != "playing")
                return false;
            (_a = player.tankBody) === null || _a === void 0 ? void 0 : _a.useSpell(data);
            return true;
        },
    },
    exitRoom: {
        execute(socket, io, data) {
            const player = RoomManager_1.default.getPlayerBySocketId(socket.id);
            if (!player)
                return false;
            if (!player.roomCode)
                return false;
            const room = RoomManager_1.default.getRoomByCode(player.roomCode);
            if (!room)
                return false;
            room.removePlayer(socket.id);
            player.roomCode = null;
            player.isRoomLeader = false;
            player.gameSession = "menu";
            const roomData = RoomManager_1.default.rooms.map((room) => room.networkData());
            socket.emit("updateRoomList", { roomsData: roomData });
            return true;
        },
    },
};
