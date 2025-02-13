import notesModel from "../models/notes.models.js";

export const createNote = async ({ projectId, content }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    // Check if a note with the same projectId already exists
    const existingNote = await notesModel.findOne({ projectId });

    if (existingNote) {
      throw new Error("A note with this projectId already exists");
    }

    // Create a new note if no duplicate exists
    const note = await notesModel.create({ projectId, content });
    return note;
  } catch (error) {
    throw new Error(error.message);
  }
};


export const updateNote = async ({ projectId, content }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    const updatedNote = await notesModel.findOneAndUpdate(
      { projectId },
      { content },
      { new: true }
    );

    return updatedNote || null;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getNote = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    const note = await notesModel.findOne({ projectId }).lean();
    return note || null;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteNote = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  try {
    const deletedNote = await notesModel.findOneAndDelete({ projectId });
    return deletedNote || null;
  } catch (error) {
    throw new Error(error.message);
  }
};
