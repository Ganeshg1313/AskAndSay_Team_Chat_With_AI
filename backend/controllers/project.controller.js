// project.controller.js
// Role: Handle HTTP requests for project-related operations

import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";

/**
 * POST /projects/create
 * Create a new project owned by the authenticated user.
 */
export const createProjectController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    // Retrieve the authenticated user's ID
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const newProject = await projectService.createProject({
      name,
      userId: loggedInUser._id,
    });
    return res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /projects/all
 * Retrieve all projects the authenticated user belongs to.
 */
export const getAllProjectController = async (req, res) => {
  try {
    // Fetch user by email embedded in the JWT
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const projects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id,
    });
    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * PUT /projects/add-user
 * Add one or more users to an existing project.
 */
export const addUsersToProjectController = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const updatedProject = await projectService.addUsersToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });
    return res.status(200).json({ project: updatedProject });
  } catch (error) {
    console.error("Error adding users to project:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * PUT /projects/remove-user
 * Remove one or more users from a project.
 */
export const removeUsersFromProjectController = async (req, res) => {
  try {
    const { projectId, users } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const updatedProject = await projectService.removeUsersFromProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });
    return res.status(200).json({ project: updatedProject });
  } catch (error) {
    console.error("Error removing users from project:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /projects/get-project/:projectId
 * Retrieve a single project by its ID.
 */
export const getProjectByIdController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.getProject({ projectId });
    return res.status(200).json({ project });
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * PUT /projects/delete-project
 * Delete a project by its ID.
 */
export const deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.body;
    await projectService.deleteProject({ projectId });
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(400).json({ message: error.message });
  }
};
