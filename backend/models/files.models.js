// Role: Define the schema for storing a project's file structure

import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  // Reference to the associated project (one-to-one)
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "project",
  },
  // Arbitrary JSON representing the project's file tree
  fileTree: {
    type: Object,
    required: true,
  },
});

// Create and export the File model based on fileSchema
const File = mongoose.model("file", fileSchema);

export default File;

