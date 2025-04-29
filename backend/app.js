// Role: To apply the middlewares and add routes

import express from "express";
import morgan from "morgan";              // HTTP request logger
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import fileRoutes from "./routes/files.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();

// 1) CORS configuration
const corsOptions = {
  origin: "https://ask-and-say.vercel.app",   // your frontend URL
  credentials: true,                          // allow cookies/auth headers
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// 2) Enable CORS and preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 3) Standard middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4) Mount routes
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/files", fileRoutes);
app.use("/notes", notesRoutes);

// 5) Root health check
app.get("/", (req, res) => res.status(200).send("Welcome to the API"));

// 6) Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

export default app;
