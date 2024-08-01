import { Socket } from "socket.io";
import { generateToken } from "../server/events";
import RoomManager from "../managers/RoomManager";
import {
    EngeenierTankBody,
    HeavyTankBody,
    TankBody,
} from "../GameObjects/TankBody";
import { Tank } from "../GameObjects/Tanks/Tank";

class Player {
    id: number;
    socket: Socket;
    username: string;
    token: string;
    isOnline: boolean;
    gameSession: null | "room" | "playing" | "waiting" | "menu";
    roomCode: string | null;
    roomReady: boolean = false;
    isRoomLeader: boolean;
    gameRole: "engeenier" | "heavy" | null;
    tankBody: Tank | null;

    constructor(socket: Socket, username: string, token: string) {
        this.socket = socket;
        this.username = username;
        this.token = token;
        this.id = Number(generateToken());
        this.isOnline = true;
        this.gameSession = "menu";
        this.roomCode = null;
        this.isRoomLeader = false;
        this.gameRole = null;
        this.tankBody = null;
    }

    networkData() {
        const netData = {
            socketId: this.socket.id,
            username: this.username,
            id: this.id,
            token: this.token,
            gameSession: this.gameSession,
            isOnline: this.isOnline,
            roomReady: this.roomReady,
            isRoomLeader: this.isRoomLeader,
            tankBody: this.tankBody?.networkData(),
            gameRole: this.gameRole,
        };

        return netData;
    }

    changeSocket(socket: Socket) {
        this.socket = socket;
    }

    connect() {
        this.isOnline = true;
        console.log(`User "${this.username}" is online`);

        if (this.roomCode != null) this.socket.join(this.roomCode);
    }

    disconnect() {
        this.isOnline = false;
        console.log(`User "${this.username}" is offline`);

        if (this.roomCode != null && this.gameSession == "room") {
            this.roomReady = false;
            RoomManager.getRoomByCode(this.roomCode)?.updateRoomViewData();
        }
    }
}

export default Player;
