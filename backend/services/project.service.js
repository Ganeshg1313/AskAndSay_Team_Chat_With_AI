// Role: To handle the interactions with third-party services (e.g., MongoDB Atlas)

import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

/** Helper function to validate ObjectId */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Create a new project */
export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Project name is required");
  }

  if (!userId || !isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  try {
    const project = await projectModel.create({ name, users: [userId] });
    return project;
  } catch (error) {
    if (error.code === 11000) throw new Error("Project name already exists");
    throw new Error(error.message);
  }
};

/** Get all projects of a user */
export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId || !isValidObjectId(userId)) throw new Error("Invalid userId");

  try {
    return await projectModel.find({ users: userId });
  } catch (error) {
    throw new Error("Failed to fetch projects: " + error.message);
  }
};

/** Add users to a project */
export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId || !isValidObjectId(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!userId || !isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  if (!Array.isArray(users) || users.some((id) => !isValidObjectId(id))) {
    throw new Error("Invalid users array");
  }

  try {
    const project = await projectModel.findOne({
      _id: projectId,
      users: userId,
    });

    if (!project) {
      throw new Error("User does not belong to this project");
    }

    return await projectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { users: { $each: users } } },
      { new: true }
    );
  } catch (error) {
    throw new Error("Failed to add users to project: " + error.message);
  }
};

/** Remove users from a project */
export const removeUsersFromProject = async ({ projectId, users, userId }) => {
  if (!projectId || !isValidObjectId(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!userId || !isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  if (!Array.isArray(users) || users.some((id) => !isValidObjectId(id))) {
    throw new Error("Invalid users array");
  }

  try {
    const project = await projectModel.findOne({
      _id: projectId,
      users: userId, // Ensures the requester is part of the project
    });

    if (!project) {
      throw new Error("User does not belong to this project");
    }

    return await projectModel.findByIdAndUpdate(
      projectId,
      { $pullAll: { users: users } }, // Fix applied here
      { new: true }
    );
  } catch (error) {
    throw new Error("Failed to remove users from project: " + error.message);
  }
};

/** Get a project by ID */
export const getProject = async ({ projectId }) => {
  if (!projectId || !isValidObjectId(projectId)) {
    throw new Error("Invalid projectId");
  }

  try {
    return await projectModel.findById(projectId).populate("users").lean();
  } catch (error) {
    throw new Error("Failed to fetch project: " + error.message);
  }
};

/** Delete a project */
export const deleteProject = async ({ projectId }) => {
  if (!projectId || !isValidObjectId(projectId)) {
    throw new Error("Invalid projectId");
  }

  try {
    return await projectModel.findByIdAndDelete(projectId);
  } catch (error) {
    throw new Error("Failed to delete project: " + error.message);
  }
};
