import mongoose from "mongoose";
import fileModel from "../models/files.models.js";

// Service layer for file operations associated with projects.

/**
 * Create a new file entry for a project.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @param {Object} params.fileTree - The file structure to persist.
 * @throws {Error} If projectId or fileTree is missing.
 * @returns {Promise<Object>} The newly created file document.
 */
export const createFile = async ({ projectId, fileTree }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }
  if (!fileTree) {
    throw new Error("File tree is required");
  }

  try {
    return await fileModel.create({ projectId, fileTree });
  } catch (error) {
    // Propagate any creation errors
    throw error;
  }
};

/**
 * Retrieve the file entry for a given project.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @throws {Error} If projectId is missing or invalid.
 * @returns {Promise<Object|null>} The file document or null if not found.
 */
export const getFileById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  return await fileModel.findOne({ projectId });
};

/**
 * Update the fileTree for a project.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @param {Object} params.fileTree - The new file structure.
 * @throws {Error} If projectId or fileTree is missing.
 * @returns {Promise<Object|null>} The updated file document.
 */
export const updateFile = async ({ projectId, fileTree }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }
  if (!fileTree) {
    throw new Error("File tree is required");
  }

  return await fileModel.findOneAndUpdate(
    { projectId },
    { fileTree },
    { new: true }
  );
};

/**
 * Delete the file entry for a project.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @throws {Error} If projectId is missing.
 * @returns {Promise<Object|null>} The deleted file document.
 */
export const deleteFiles = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  return await fileModel.findOneAndDelete({ projectId });
};
