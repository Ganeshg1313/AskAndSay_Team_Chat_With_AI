import * as notesService from "../services/notes.service.js";
import { validationResult } from "express-validator";

export const createNoteController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, content } = req.body;

    const newNote = await notesService.createNote({ projectId, content });

    res.status(201).json(newNote);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const updateNoteController = async (req, res) => {
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

    res.status(200).json(updatedNote);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const getNoteController = async (req, res) => {
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

    res.status(200).json(note);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

export const deleteNoteController = async (req, res) => {
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

    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
