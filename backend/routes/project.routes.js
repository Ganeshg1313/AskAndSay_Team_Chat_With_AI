// Role: Defines project-related routes and applies authentication + validation

import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route   POST /projects/create
 * @desc    Create a new project with the given name, owned by the authenticated user
 * @access  Protected (requires valid JWT)
 */
router.post(
  "/create",
  authMiddleWare.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProjectController
);

/**
 * @route   GET /projects/all
 * @desc    Retrieve all projects that the authenticated user is a member of
 * @access  Protected (requires valid JWT)
 */
router.get(
  "/all",
  authMiddleWare.authUser,
  projectController.getAllProjectController
);

/**
 * @route   PUT /projects/add-user
 * @desc    Add one or more users (by ID) to an existing project
 * @access  Protected (requires valid JWT)
 */
router.put(
  "/add-user",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUsersToProjectController
);

/**
 * @route   PUT /projects/remove-user
 * @desc    Remove one or more users (by ID) from an existing project
 * @access  Protected (requires valid JWT)
 */
router.put(
  "/remove-user",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.removeUsersFromProjectController
);

/**
 * @route   GET /projects/get-project/:projectId
 * @desc    Fetch a single project by its ID, including populated user list
 * @access  Protected (requires valid JWT)
 */
router.get(
  "/get-project/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectByIdController
);

/**
 * @route   PUT /projects/delete-project
 * @desc    Delete an existing project by its ID
 * @access  Protected (requires valid JWT)
 */
router.put(
  "/delete-project",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.deleteProjectController
);

export default router;
