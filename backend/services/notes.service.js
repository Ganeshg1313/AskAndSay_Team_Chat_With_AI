import notesModel from "../models/notes.models.js";

/**
 * Create a new note for a project, ensuring no duplicate exists.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @param {string} params.content - The note content.
 * @throws {Error} If projectId is missing or a note already exists.
 * @returns {Promise<Object>} The newly created note document.
 */
export const createNote = async ({ projectId, content }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    // Prevent duplicate notes for the same project
    const existingNote = await notesModel.findOne({ projectId });
    if (existingNote) {
      throw new Error("A note with this projectId already exists");
    }

    return await notesModel.create({ projectId, content });
  } catch (error) {
    // Propagate error with its message
    throw new Error(error.message);
  }
};

/**
 * Update the content of an existing note.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @param {string} params.content - The new content to save.
 * @throws {Error} If projectId is missing.
 * @returns {Promise<Object|null>} The updated note document, or null if not found.
 */
export const updateNote = async ({ projectId, content }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    return await notesModel.findOneAndUpdate(
      { projectId },
      { content },
      { new: true }
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Retrieve a note by its projectId.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @throws {Error} If projectId is missing.
 * @returns {Promise<Object|null>} The note document, or null if not found.
 */
export const getNote = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    return await notesModel.findOne({ projectId }).lean();
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Delete the note associated with a project.
 * @param {Object} params
 * @param {string} params.projectId - The ID of the project.
 * @throws {Error} If projectId is missing.
 * @returns {Promise<Object|null>} The deleted note document, or null if none existed.
 */
export const deleteNote = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    return await notesModel.findOneAndDelete({ projectId });
  } catch (error) {
    throw new Error(error.message);
  }
};
