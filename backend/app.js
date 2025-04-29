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

// Allow your production origin + any preview URLs
const allowedOrigins = [
  "https://ask-and-say.vercel.app",
  // add any .vercel.app preview domains here if needed
];

app.use(
  cors({
    origin: (incomingOrigin, cb) => {
      // allow requests with no origin (mobile apps, curl, etc)
      if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
// explicitly handle OPTIONS
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// your routes…
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/files", fileRoutes);
app.use("/notes", notesRoutes);

app.get("/", (req, res) => res.send("Welcome to the API"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

export default app;
