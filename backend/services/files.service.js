import mongoose from "mongoose";
import fileModel from "../models/files.models.js";

export const createFile = async ({ projectId, fileTree }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  if (!fileTree) {
    throw new Error("File tree is required");
  }

  try {
    return await fileModel.create({ projectId, fileTree });
  } catch (error) {
    throw error;
  }
};

export const getFileById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  return await fileModel.findOne({ projectId });
};

export const updateFile = async ({ projectId, fileTree }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  if (!fileTree) {
    throw new Error("File tree is required");
  }

  return await fileModel.findOneAndUpdate(
    { projectId },
    { fileTree },
    { new: true }
  );
};

export const deleteFiles = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  return await fileModel.findOneAndDelete({ projectId });
};
