// Role: To apply the middlewares and add routes

import express from "express";
import morgan from "morgan"; // log HTTP requests in the console or monitoring purposes.
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import fileRoutes from "./routes/files.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(morgan("dev")); //The 'dev' argument specifies the logging format. In the 'dev' format, logs appear in a concise, colorful format.
app.use(cors('*'));


app.use(express.json()); //The JSON data is converted into a JavaScript object and attached to req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);
app.use("/files", fileRoutes);
app.use("/notes", notesRoutes);

// Root Route
app.get("/", (req, res) => res.status(200).send("Welcome to the API"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

export default app;
