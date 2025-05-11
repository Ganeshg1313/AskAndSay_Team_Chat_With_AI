import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// HTTP request logger middleware for development debugging
app.use(morgan("dev"));

// Parse incoming JSON payloads into req.body
app.use(express.json());

// Parse URL-encoded payloads (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Parse cookies attached to client requests
app.use(cookieParser());

// CORS configuration to restrict access to the specified frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL; 
app.use(
  cors({
    origin: FRONTEND_URL,        // Only allow this exact origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true            // Enable Access-Control-Allow-Credentials header
  })
);

// Ensure cross-origin isolation for SharedArrayBuffer support
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Control resource policies so that all static worker scripts are allowed to load
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

// Import API route handlers
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import fileRoutes from "./routes/files.routes.js";
import notesRoutes from "./routes/notes.routes.js";

// Mount routers on their base paths
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/files", fileRoutes);
app.use("/notes", notesRoutes);

// Health check endpoint
app.get("/", (req, res) => res.send("Welcome to the API"));

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err); // Log error stack trace for debugging
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

export default app;
