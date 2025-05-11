// Role: Define the schema for a collaborative project, including its name and member list

import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  // Human-readable name for the project; stored lowercase, trimmed, and must be unique across all projects
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    unique: [true, "Project name must be unique"],
  },
  // List of user IDs who are collaborators on this project
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",            // Reference to the User model for population
      required: true,
    },
  ],
}, {
  timestamps: true           // Auto-generate createdAt and updatedAt fields
});

// Create and export the Project model
const Project = mongoose.model("project", ProjectSchema);

export default Project;
