import http from "http";
import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./db/db.js";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

connectDB();
const PORT = process.env.PORT || 5555;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET","POST"],
    credentials: true
  }
});

// auth + project lookup
io.use(async (socket, next) => {
  try {
    const token     = socket.handshake.auth.token
                   || socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new Error("Bad projectId");

    socket.project = await projectModel.findById(projectId);
    if (!socket.project)  throw new Error("Project not found");
    if (!token)           throw new Error("No token");

    // verify JWT
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", socket => {
  const room = socket.project._id.toString();
  socket.join(room);

  socket.on("project-message", async data => {
    // if message includes @ai
    if (/@ai\b/.test(data.message)) {
      const prompt = data.message.replace(/@ai\b/,"").trim();
      try {
        const aiResp = await generateResult(prompt);
        io.to(room).emit("project-message", {
          sender: { _id:"ai", email:"AI" },
          message: aiResp
        });
      } catch {
        io.to(room).emit("project-message", {
          sender: { _id:"ai", email:"AI" },
          message: "AI error, please retry"
        });
      }
    } else {
      // broadcast to other clients
      socket.broadcast.to(room).emit("project-message", data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`API + sockets listening on ${PORT}`);
});
