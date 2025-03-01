// Role: To handle the interactions with third party services (e.g: MongoDB atlas)

import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required");
  }

  if (!userId) {
    throw new Error("User is required");
  }

  try {
    const project = await projectModel.create({
      name,
      users: [userId],
    });

    return project;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }
    throw new Error(error.message);
  }
};

export const getAllProjectByUserId = async ({ userId }) => {
  if (!userId) {
    throw new Error("UserId is required");
  }

  try {
    const allUserProjects = await projectModel.find({
      users: userId,
    });

    return allUserProjects;
  } catch (error) {
    throw new Error("Failed to fetch projects: " + error.message);
  }
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users) {
    throw new Error("Users is required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!userId) {
    throw new Error("UserId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  try {
    const project = await projectModel.findOne({
      _id: projectId,
      users: userId,
    });

    if (!project) {
      throw new Error("User does not belong to this project");
    }

    const updatedProject = await projectModel.findOneAndUpdate(
      {
        _id: projectId,
      },
      {
        $addToSet: {
          users: {
            $each: users,
          },
        },
      },
      {
        new: true,
      }
    );

    return updatedProject;
  } catch (error) {
    throw new Error("Failed to add users to project: " + error.message);
  }
};

export const removeUsersFromProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users) {
    throw new Error("Users is required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!userId) {
    throw new Error("UserId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  try {
    const project = await projectModel.findOne({
      _id: projectId,
      users: userId,
    });

    if (!project) {
      throw new Error("User does not belong to this project");
    }

    const updatedProject = await projectModel.findOneAndUpdate(
      {
        _id: projectId,
      },
      {
        $pull: {
          users: {
            $in: users,
          },
        },
      },
      {
        new: true,
      }
    );

    return updatedProject;
  } catch (error) {
    throw new Error("Failed to remove users from project: " + error.message);
  }
};

export const getProject = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  try {
    const project = await projectModel
      .findOne({
        _id: projectId,
      })
      .populate("users");

    return project;
  } catch (error) {
    throw new Error("Failed to fetch project: " + error.message);
  }
};

export const deleteProject = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  try {
    const project = await projectModel
      .findOneAndDelete({
        _id: projectId,
      })

    return project;

  } catch (error) {
    throw new Error("Failed to delete project: " + error.message);
  }
};
