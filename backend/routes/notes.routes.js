import { Router } from "express";
import * as notesController from "../controllers/notes.controller.js";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create-note",
    authMiddleWare.authUser,
    body("projectId").isString().withMessage("Project ID is required"),
    notesController.createNoteController);

router.post(
  "/get-note",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  notesController.getNoteController
);

router.put("/update-note", 
    authMiddleWare.authUser,
    body("projectId").isString().withMessage("Project ID is required"),
    notesController.updateNoteController);

router.post("/delete-note", 
    authMiddleWare.authUser,
    body("projectId").isString().withMessage("Project ID is not given"),
    notesController.deleteNoteController);

export default router;
