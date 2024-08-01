import { DisconnectReason, Server, Socket } from "socket.io";
import { events } from "../server/events";
import express, { Express, Request, Response } from "express";
import { connect } from "mongoose";
import bodyParser from "body-parser";
import { json } from "body-parser";
import cors from "cors";
import RoomManager from "./RoomManager";
import axios from "axios";

class EventManager {
    io: Server;
    listeningIds: string[] = [];

    constructor() {
        const app = express();
        const urlencodedParser = bodyParser.urlencoded({
            extended: true,
        });
        app.use(cors({}));
        app.use(urlencodedParser);

        app.get("/", (req, res) => {
            res.send("Server stared.");
        });

        app.post(
            "/create-user",
            urlencodedParser,
            (req: Request, res: Response) => {
                const body = req.body;
                console.log(body);
                res.send("qwerty");
            }
        );

        app.get("/fetch-data", async (req, res) => {
            try {
                const response = await axios.get("https://example.com", {
                    headers: {
                        "User-Agent": "CustomUserAgent/1.0",
                        "ngrok-skip-browser-warning": "any-value", // Custom header
                    },
                });
                res.send(response.data);
            } catch (error) {
                // res.status(500).send(`Error fetching data: ${error.message}`);
            }
        });
        const server = app.listen(3020, () => console.log("server started"));

        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

        this.setIo();
    }

    run() {}

    setIo() {
        this.io.on("connection", (socket: Socket) => {
            if (this.io == null) return;

            events["connection"].execute(socket, this.io, null);

            if (this.listeningIds.includes(socket.id) == false) {
                this.listeningIds.push(socket.id);

                for (let eventName in events) {
                    socket.on(eventName, (data: any) => {
                        const eventExecResult = events[eventName].execute(
                            socket,
                            this.io,
                            data
                        );

                        if (eventExecResult)
                            socket.emit(
                                "error",
                                "server can't execute this event."
                            );
                    });
                }
            }
        });
    }
}

export default new EventManager();
