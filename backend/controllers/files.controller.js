import * as filesService from "../services/files.service.js";
import { validationResult } from "express-validator";

export const createFileController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, fileTree } = req.body;

    const newFile = await filesService.createFile({ projectId, fileTree });

    res.status(201).json(newFile);
  } catch (error) {
    console.log(error);

    res.status(400).send(error.message);
  }
};

export const getFileByIdController = async (req, res) => {
  try {
    const { projectId } = req.body;

    const file = await filesService.getFileById({ projectId });

    res.status(200).json(file);
  } catch (error) {
    console.log(error);

    res.status(400).send(error.message);
  }
};

export const updateFileController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, fileTree } = req.body;

    const updatedFile = await filesService.updateFile({ projectId, fileTree });

    res.status(200).json(updatedFile);
  } catch (error) {
    console.log(error);

    res.status(400).send(error.message);
  }
};

export const deleteFileController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { projectId } = req.body;
    console.log(projectId);
    await filesService.deleteFiles({ projectId });

    res.status(204).send();
  } catch (error) {
    console.log(error);

    res.status(400).send(error.message);
  }
};
