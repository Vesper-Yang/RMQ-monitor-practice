import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generateRMQMessage } from "./rmqMessageGenerator";
import { Server } from "socket.io";
import { createServer } from "http";
import * as fs from "fs";
import { formatObject } from "./formatObject";

/* Configurations */
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
let logStream: fs.WriteStream | undefined;

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id} at ${new Date().toISOString()}`);

  const messageInterval = setInterval(() => {
    const message = generateRMQMessage();
    console.log("Sending message to client:", message);
    socket.emit("message", message);
  }, 2000);

  socket.on("startLogging", () => {
    const now = new Date();
    const timestamp = now
      .toLocaleString("zh-CN", {
        hour12: false,
        timeZone: "Asia/Shanghai",
      })
      .replace(/\//g, ".")
      .replace(/:/g, ".")
      .replace(/ /g, "-")
      .slice(0, 19);

    const fileName = `log-to-file-${timestamp}.log`;
    logStream = fs.createWriteStream(fileName, { flags: "a" });

    const messageHandler = (message: any) => {
      console.log("Received startLogging event with messages:", message);
      logStream?.write(
        formatObject(message) +
          "\n-----------------------------------------------------\n"
      );
    };

    socket.on("logToFile", messageHandler);
    console.log("Started logging message to:", fileName);
  });

  socket.on("disconnect", () => {
    console.log(`socket ${socket.id} disconnected, not sending message`);
    clearInterval(messageInterval);
    if (logStream) {
      logStream.end();
      console.log("Server: Stopped logging messages.");
    }
  });
});

/* Server */
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running out on port ${port}`);
});
