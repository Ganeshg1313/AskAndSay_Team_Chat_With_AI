// notes.controller.js
// Role: Expose HTTP endpoints for note operations and delegate to the service layer

import * as notesService from "../services/notes.service.js";
import { validationResult } from "express-validator";

/**
 * POST /notes/create-note
 * Create a new note for a project, rejecting duplicates.
 */
export const createNoteController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, content } = req.body;
    const newNote = await notesService.createNote({ projectId, content });
    return res.status(201).json(newNote);
  } catch (error) {
    console.error("Error in createNoteController:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /notes/update-note
 * Update existing note content; returns 404 if not found.
 */
export const updateNoteController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, content } = req.body;
    const updatedNote = await notesService.updateNote({ projectId, content });
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNoteController:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /notes/get-note
 * Retrieve the note for a project; returns 404 if absent.
 */
export const getNoteController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.body;
    const note = await notesService.getNote({ projectId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(200).json(note);
  } catch (error) {
    console.error("Error in getNoteController:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /notes/delete-note
 * Delete the note for a project; returns 404 if absent.
 */
export const deleteNoteController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.body;
    const deletedNote = await notesService.deleteNote({ projectId });
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    // No content to return on successful deletion
    return res.status(204).send();
  } catch (error) {
    console.error("Error in deleteNoteController:", error);
    return res.status(500).json({ message: error.message });
  }
};
