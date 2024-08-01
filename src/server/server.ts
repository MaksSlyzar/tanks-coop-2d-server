import { createServer } from "http";
import { DisconnectReason, Server, Socket } from "socket.io";
import EventManager from "../managers/EventManager";

EventManager.run();

// console.log("Server started!");
