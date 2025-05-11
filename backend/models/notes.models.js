// Role: Define the schema for storing project-specific notes

import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
  // Reference to the associated project; enforces that each note belongs to exactly one project
  projectId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "project",
  },
  // The actual note content; initialized to an empty string by default
  content: {
    type: String,
    default: "",
  },
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create and export the Note model based on notesSchema
const Note = mongoose.model("note", notesSchema);

export default Note;
