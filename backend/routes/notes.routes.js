import { Router } from "express";
import * as notesController from "../controllers/notes.controller.js";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route   POST /notes/create-note
 * @desc    Create a new note for a project; disallow duplicates by projectId
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/create-note",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  notesController.createNoteController
);

/**
 * @route   POST /notes/get-note
 * @desc    Retrieve the note content for a given project
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/get-note",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  notesController.getNoteController
);

/**
 * @route   PUT /notes/update-note
 * @desc    Update the content of an existing note
 * @access  Protected (requires valid JWT)
 */
router.put(
  "/update-note",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  notesController.updateNoteController
);

/**
 * @route   POST /notes/delete-note
 * @desc    Delete the note associated with a project
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/delete-note",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is not given"),
  notesController.deleteNoteController
);

export default router;
