import { Server, Socket } from "socket.io";
import Player from "../room/Player";
import RoomManager from "../managers/RoomManager";

export interface IOEvent {
    execute(socket: Socket, io: Server, data: any): boolean;
}

interface EventsPair {
    [key: string]: IOEvent;
}

export function generateToken() {
    return String(Math.round(Math.random() * 1000000));
}

export function getRandomInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export const events: EventsPair = {
    register: {
        execute(socket, io, data) {
            const { username } = data;

            const player = RoomManager.createPlayer(
                socket,
                username,
                generateToken()
            );
            socket.join("menu");

            socket.emit("authSuccessfully", {
                ...player.networkData(),
                token: player.token,
            });
            const roomData = RoomManager.rooms.map((room) =>
                room.networkData()
            );
            socket.emit("updateRoomList", { roomsData: roomData });
            return true;
        },
    },
    authByToken: {
        execute(socket, io, data) {
            const token = data;

            const player = RoomManager.getPlayerByToken(token);

            if (player == null) {
                socket.emit("authFailed", "error token");
                return false;
            }

            player.changeSocket(socket);
            socket.emit("authSuccessfully", {
                ...player.networkData(),
                token: player.token,
            });
            player.connect();

            if (player.gameSession == "menu") {
                socket.join("menu");
                const roomData = RoomManager.rooms.map((room) =>
                    room.networkData()
                );
                socket.emit("updateRoomList", { roomsData: roomData });
            } else if (player.gameSession == "room") {
                if (player.roomCode != null) {
                    const room = RoomManager.getRoomByCode(player.roomCode);

                    if (room == undefined) return false;

                    room.updateRoomViewData();
                }
            } else if (player.gameSession == "playing") {
                if (player.roomCode != null) {
                    const room = RoomManager.getRoomByCode(player.roomCode);

                    if (room == undefined) return false;

                    room.gameManager?.createGameObjectsEvent(socket);
                }
            }
            return true;
        },
    },
    connection: {
        execute(socket: Socket, io: Server, data: any) {
            return true;
        },
    },
    createRoom: {
        execute(socket: Socket, io: Server, data: any) {
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (player == null) return false;

            RoomManager.create(data.roomName, io);

            player.isRoomLeader = true;

            const roomData = RoomManager.rooms.map((room) =>
                room.networkData()
            );
            io.to("menu").emit("updateRoomList", { roomsData: roomData });

            RoomManager.join(data.roomName, player);
            return true;
        },
    },
    joinRoom: {
        execute(socket: Socket, io: Server, data: any) {
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (player == null) return false;

            const room = RoomManager.join(data.lobbyCode, player);

            if (room == null) return false;

            return true;
        },
    },
    switchRoomReady: {
        execute(socket, io, data) {
            const player = RoomManager.getPlayerBySocketId(socket.id);
            const { ready } = data;

            const role = data.role as "heavy" | "engeenier";

            if (player == null) return false;

            player.roomReady = ready;

            if (player.roomCode) {
                RoomManager.getRoomByCode(
                    player.roomCode
                )?.updateRoomViewData();
                player.gameRole = role;
            }
            return true;
        },
    },
    disconnect: {
        execute(socket, io, data) {
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (player != null) {
                player.disconnect();
            }
            return true;
        },
    },
    startRoomGame: {
        execute(socket, io, data) {
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (player == null) return false;

            if (player.roomCode == null) return false;

            const room = RoomManager.getRoomByCode(player.roomCode);

            if (player.isRoomLeader == false) return false;

            room?.startGame();
            return true;
        },
    },
    sendMoveData: {
        execute(socket, io, data) {
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (!player) return false;

            player.tankBody?.networkController(data);
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
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (!player) return false;

            if (player.gameSession != "playing") return false;

            player.tankBody?.useSpell(data);
            return true;
        },
    },
    exitRoom: {
        execute(socket, io, data) {
            const player = RoomManager.getPlayerBySocketId(socket.id);

            if (!player) return false;
            if (!player.roomCode) return false;

            const room = RoomManager.getRoomByCode(player.roomCode);

            if (!room) return false;

            room.removePlayer(socket.id);

            player.roomCode = null;
            player.isRoomLeader = false;
            player.gameSession = "menu";

            const roomData = RoomManager.rooms.map((room) =>
                room.networkData()
            );
            socket.emit("updateRoomList", { roomsData: roomData });
            return true;
        },
    },
};
