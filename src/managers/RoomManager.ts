import { Server, Socket } from "socket.io";
import Player from "../room/Player";
import Room from "../room/Room";
import GameManager from "./GameManager";
import TestingRoom from "../room/TestingRoom";

class RoomManager {
  rooms: Array<Room | TestingRoom> = [];
  players: Array<Player> = [];

  constructor() {}

  getPlayerById(id: string) {}

  getPlayerByToken(token: string) {
    return this.players.find((player) => player.token == token);
  }

  getPlayerBySocketId(socketId: string) {
    return this.players.find((player) => player.socket.id == socketId);
  }

  createPlayer(socket: Socket, username: string, token: string) {
    const player = new Player(socket, username, token);
    this.players.push(player);
    return player;
  }

  getRoomByCode(roomCode: string): Room | undefined {
    return this.rooms.find((r) => r.roomCode == roomCode);
  }

  deleteRoom(roomCode: string) {
    const roomIndex = this.rooms.findIndex((room) => room.roomCode == roomCode);
    if (roomCode) this.rooms.splice(roomIndex, 1);
  }

  join(roomCode: string, player: Player) {
    const room = this.getRoomByCode(roomCode);

    if (room == undefined) return null;

    this.rooms.map((r) => r.removePlayer(player.socket.id));

    room.joinRoom(player);

    player.socket.join(room.roomCode);
    player.roomCode = room.roomCode;
    player.gameSession = "room";

    player.socket.emit("joinRoomSuccessfully", room.networkData());

    return room;
  }

  create(roomCode: string, io: Server): Room {
    const newRoom = new Room(roomCode, io);
    this.rooms.push(newRoom);
    return newRoom;
  }
}

export default new RoomManager();
