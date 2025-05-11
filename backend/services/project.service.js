// Role: To handle interactions with third-party services (e.g., MongoDB Atlas)

import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

/** 
 * Validate that a string is a valid MongoDB ObjectId.
 * @param {string} id 
 * @returns {boolean}
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Create a new project and assign the creator as its first user.
 * @param {Object} params
 * @param {string} params.name - Project name (must be unique).
 * @param {string} params.userId - ID of the user creating the project.
 * @throws {Error} If name is missing, userId is invalid, or name already exists.
 * @returns {Promise<Object>} The created project document.
 */
export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Project name is required");
  }
  if (!userId || !isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  try {
    return await projectModel.create({ name, users: [userId] });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }
    throw new Error(error.message);
  }
};

/**
 * Retrieve all projects that include the given user.
 * @param {Object} params
 * @param {string} params.userId - ID of the user whose projects to fetch.
 * @throws {Error} If userId is invalid or database fetch fails.
 * @returns {Promise<Array>} List of projects.
 */
export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId || !isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }
  try {
    return await projectModel.find({ users: userId });
  } catch (error) {
    throw new Error("Failed to fetch projects: " + error.message);
  }
};

/**
 * Add one or more users to an existing project.
 * @param {Object} params
 * @param {string} params.projectId - ID of the project to update.
 * @param {Array<string>} params.users - Array of user IDs to add.
 * @param {string} params.userId - ID of the requester (must belong to the project).
 * @throws {Error} If any ID is invalid, requester not in project, or update fails.
 * @returns {Promise<Object>} The updated project document.
 */
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
    const project = await projectModel.findOne({ _id: projectId, users: userId });
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

/**
 * Remove one or more users from a project.
 * @param {Object} params
 * @param {string} params.projectId - ID of the project to update.
 * @param {Array<string>} params.users - Array of user IDs to remove.
 * @param {string} params.userId - ID of the requester (must belong to the project).
 * @throws {Error} If any ID is invalid, requester not in project, or update fails.
 * @returns {Promise<Object>} The updated project document.
 */
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
    const project = await projectModel.findOne({ _id: projectId, users: userId });
    if (!project) {
      throw new Error("User does not belong to this project");
    }
    return await projectModel.findByIdAndUpdate(
      projectId,
      { $pullAll: { users: users } },
      { new: true }
    );
  } catch (error) {
    throw new Error("Failed to remove users from project: " + error.message);
  }
};

/**
 * Fetch a project by its ID, including its users.
 * @param {Object} params
 * @param {string} params.projectId - ID of the project to retrieve.
 * @throws {Error} If projectId is invalid or fetch fails.
 * @returns {Promise<Object|null>} The project document or null if not found.
 */
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

/**
 * Delete a project by its ID.
 * @param {Object} params
 * @param {string} params.projectId - ID of the project to delete.
 * @throws {Error} If projectId is invalid or deletion fails.
 * @returns {Promise<Object|null>} The deleted project document or null.
 */
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
