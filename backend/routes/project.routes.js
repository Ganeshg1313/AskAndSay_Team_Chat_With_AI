//Role: routes which receives a request call coming from app.js and passes it to middleware/controller

import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleWare.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProjectController
);

router.get("/all", authMiddleWare.authUser, projectController.getAllProjectController);

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

router.get(
  "/get-project/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectByIdController
);

router.put(
  "/delete-project",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  projectController.deleteProjectController
);

export default router;
