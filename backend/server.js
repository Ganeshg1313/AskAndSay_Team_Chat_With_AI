import http from "http";
import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./db/db.js";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

// Establish the database connection
connectDB();

// Define server listening port
const PORT = process.env.PORT || 5555;

// Create HTTP server wrapping the Express application
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings to allow only the frontend origin
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,  // Frontend application URL
    methods: ["GET", "POST"],
    credentials: true                   // Allow cookies and auth headers
  }
});

// Middleware: authenticate socket connection and load project context
io.use(async (socket, next) => {
  try {
    // Extract JWT from handshake auth or headers
    const token = socket.handshake.auth.token
      || socket.handshake.headers.authorization?.split(" ")[1];
    // Get projectId from query parameters
    const projectId = socket.handshake.query.projectId;

    // Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Bad projectId");
    }

    // Fetch the project document from MongoDB
    socket.project = await projectModel.findById(projectId);
    if (!socket.project) {
      throw new Error("Project not found");
    }

    // Ensure a token was provided
    if (!token) {
      throw new Error("No token");
    }

    // Verify and decode JWT
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // Proceed to connection handler
  } catch (e) {
    // Reject unauthorized connections
    next(new Error("Unauthorized"));
  }
});

// Handle new socket connections
io.on("connection", socket => {
  // Use project ID as the room name for scoped messaging
  const room = socket.project._id.toString();
  socket.join(room);

  // Listen for incoming project messages
  socket.on("project-message", async data => {
    // If message contains @ai, forward to AI service
    if (/@ai\b/.test(data.message)) {
      const prompt = data.message.replace(/@ai\b/, "").trim();
      try {
        const aiResp = await generateResult(prompt);
        io.to(room).emit("project-message", {
          sender: { _id: "ai", email: "AI" },
          message: aiResp
        });
      } catch {
        io.to(room).emit("project-message", {
          sender: { _id: "ai", email: "AI" },
          message: "AI error, please retry"
        });
      }
    } else {
      // Broadcast user message to other clients in the same room
      socket.broadcast.to(room).emit("project-message", data);
    }
  });
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`API + sockets listening on ${PORT}`);
});
