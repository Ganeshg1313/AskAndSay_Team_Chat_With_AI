// Role: To control the project operations

import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";

export const createProjectController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({ name, userId });

    res.status(201).json(newProject);
  } catch (error) {
    console.log(error);

    res.status(400).send(error.message);
  }
};

export const getAllProjectController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });
    
    console.log(loggedInUser)
    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      projects: allUserProjects,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const addUsersToProjectController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const project = await projectService.addUsersToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });

    return res.status(200).json({ project });
  } catch (error) {
    res.status(400).json({ errors: error.message });
  }
};

export const removeUsersFromProjectController = async (req, res) => {
  try {
    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const project = await projectService.removeUsersFromProject({
      projectId,
      users,
      userId: loggedInUser,
    });

    return res.status(200).json({ project });
  } catch (error) {
    console.log(error);
    res.status(400).json({ errors: error.message });
  }
};

export const getProjectByIdController = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await projectService.getProject({ projectId });

    res.status(200).json({ project: project });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.body;

    const result = await projectService.deleteProject({ projectId });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
