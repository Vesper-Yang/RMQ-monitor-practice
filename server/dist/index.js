"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const rmqMessageGenerator_1 = require("./rmqMessageGenerator");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const fs = __importStar(require("fs"));
const formatObject_1 = require("./formatObject");
/* Configurations */
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
let logStream;
const server = (0, http_1.createServer)();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} at ${new Date().toISOString()}`);
    const messageInterval = setInterval(() => {
        const message = (0, rmqMessageGenerator_1.generateRMQMessage)();
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
        const messageHandler = (message) => {
            console.log("Received startLogging event with messages:", message);
            logStream === null || logStream === void 0 ? void 0 : logStream.write((0, formatObject_1.formatObject)(message) +
                "\n-----------------------------------------------------\n");
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
