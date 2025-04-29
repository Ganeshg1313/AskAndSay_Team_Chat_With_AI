// Role: Setup the server with HTTP & WebSocket (Socket.io)

import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import "dotenv/config";

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import projectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

// 1) Connect to MongoDB
connect();

const port = process.env.PORT || 5555;
const server = http.createServer(app);

// 2) Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",       // allow all origins for WS
    methods: ["GET","POST"],
    credentials: true
  }
});

// 3) Authentication & project lookup middleware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query?.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }
    socket.project = await projectModel.findById(projectId);
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(new Error("Invalid or expired token"));
    }
    next();
  } catch (err) {
    next(err);
  }
});

// 4) Handle connections & messaging
io.on("connection", (socket) => {
  if (!socket.project) return socket.disconnect();

  socket.roomId = socket.project._id.toString();
  console.log(`User connected: ${socket.user?.email || "Unknown"}`);
  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const { message } = data;
    const isAIPrompt = /\b@ai\b/.test(message);

    if (isAIPrompt) {
      const prompt = message.replace(/\b@ai\b/g, "").trim();
      try {
        const result = await generateResult(prompt);
        io.to(socket.roomId).emit("project-message", {
          sender: { _id: "ai", email: "AI" },
          message: result,
        });
      } catch {
        io.to(socket.roomId).emit("project-message", {
          sender: { _id: "ai", email: "AI" },
          message: "AI failed to process your request. Try again later.",
        });
      }
    } else {
      socket.broadcast.to(socket.roomId).emit("project-message", data);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user?.email || "Unknown"}`);
    socket.leave(socket.roomId);
  });
});

// 5) Start listening
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
