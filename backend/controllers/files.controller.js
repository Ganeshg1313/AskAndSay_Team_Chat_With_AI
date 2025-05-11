// files.controller.js
// Role: Expose HTTP endpoints for file operations and delegate to the service layer

import * as filesService from "../services/files.service.js";
import { validationResult } from "express-validator";

/**
 * POST /files/create-file
 * Create a new file tree entry for a project.
 * Validates request body, invokes service, and returns the created record.
 */
export const createFileController = async (req, res) => {
  // Validate input according to express-validator rules
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Destructure request payload
    const { projectId, fileTree } = req.body;

    // Delegate creation to service layer
    const newFile = await filesService.createFile({ projectId, fileTree });

    // Respond with 201 Created and the new file document
    return res.status(201).json(newFile);
  } catch (error) {
    console.error("Error in createFileController:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * POST /files/get-file
 * Retrieve the file tree document by projectId.
 * Expects projectId in the request body.
 */
export const getFileByIdController = async (req, res) => {
  try {
    const { projectId } = req.body;
    const file = await filesService.getFileById({ projectId });
    return res.status(200).json(file);
  } catch (error) {
    console.error("Error in getFileByIdController:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * PUT /files/update-file
 * Update the file tree for a given project.
 * Validates input and returns the updated document.
 */
export const updateFileController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, fileTree } = req.body;
    const updatedFile = await filesService.updateFile({ projectId, fileTree });
    return res.status(200).json(updatedFile);
  } catch (error) {
    console.error("Error in updateFileController:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * POST /files/delete-files
 * Delete the file tree associated with a project.
 * Returns 204 No Content on success.
 */
export const deleteFileController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.body;
    await filesService.deleteFiles({ projectId });
    // No content to return on successful deletion
    return res.status(204).send();
  } catch (error) {
    console.error("Error in deleteFileController:", error);
    return res.status(400).json({ message: error.message });
  }
};
