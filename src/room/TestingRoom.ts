import { Server } from "socket.io";
import Room from "./Room";
import Player from "./Player";

class TestingRoom extends Room {
  constructor(io: Server) {
    super("testing room", io);
  }

  joinRoom(player: Player): void {
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

export default TestingRoom;
