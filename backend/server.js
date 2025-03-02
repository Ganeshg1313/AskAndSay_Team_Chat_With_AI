// Role: Setup the server
// NOTE: We want to use http to create server as we will be using websocket to communicate and http module is convinient to handle websocket than express
// Because of this we shifted the express part in the app.js

import http from "http";
import app from "./app.js";
import connect from "./db/db.js";
import "dotenv/config";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

// Establishing database connection
connect();

const port = process.env.PORT || 5555;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://ask-and-79pwd94xm-ganesh-vaman-ghodkes-projects.vercel.app", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attaching a middlware
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query?.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Inavlid projectId"));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error("Authenticaiton error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  // Attaching a roomId to socket to identify each project uniquely and only send messages to the users of a particular project
  socket.roomId = socket.project._id.toString();

  console.log("A user connected");

  // makes the socket join a "room" identified by roomId
  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const message = data.message;
    
    const isAIPrompt = message.includes("@ai");

    if(isAIPrompt){

      const prompt = message.replace("@ai", "");

      const result = await generateResult(prompt);

      io.to(socket.roomId).emit("project-message", {
        sender:{
          _id: 'ai',
          email: 'AI'
        },
        message: result
      });
      return;
    }
    // to send the message to all sockets in the same roomId, except the sender
    socket.broadcast.to(socket.roomId).emit("project-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
