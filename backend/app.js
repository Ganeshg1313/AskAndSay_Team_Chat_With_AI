import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import fileRoutes from "./routes/files.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();

// CORS: allow your frontend URL + socket origin
// Only allow your deployed frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL; // e.g. "https://ask-and-say.vercel.app"

app.use(cors({
  origin: FRONTEND_URL,        // echo this exact origin
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true            // enable Access-Control-Allow-Credentials
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// attach your routers
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/files", fileRoutes);
app.use("/notes", notesRoutes);

app.get("/", (req, res) => res.send("Welcome to the API"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

export default app;
