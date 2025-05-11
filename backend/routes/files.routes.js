import { Router } from "express";
import * as fileController from "../controllers/files.controller.js";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route   POST /files/create-file
 * @desc    Create and persist a new file tree for a project
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/create-file",
  authMiddleWare.authUser,
  fileController.createFileController
);

/**
 * @route   POST /files/get-file
 * @desc    Retrieve a project's file tree by projectId
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/get-file",
  authMiddleWare.authUser,
  body("projectId")
    .isString()
    .withMessage("Project ID is required"),
  fileController.getFileByIdController
);

/**
 * @route   PUT /files/update-file
 * @desc    Update the fileTree for a given project
 * @access  Protected (requires valid JWT)
 */
router.put(
  "/update-file",
  authMiddleWare.authUser,
  body("projectId")
    .isString()
    .withMessage("Project ID is required"),
  body("fileTree")
    .isObject()
    .withMessage("File tree is required"),
  fileController.updateFileController
);

/**
 * @route   POST /files/delete-files
 * @desc    Delete all files associated with a project
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/delete-files",
  authMiddleWare.authUser,
  body("projectId")
    .isString()
    .withMessage("Project ID is not given"),
  fileController.deleteFileController
);

export default router;
