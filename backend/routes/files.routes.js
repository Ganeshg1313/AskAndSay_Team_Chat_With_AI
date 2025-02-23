import { Router } from "express";
import * as fileController from "../controllers/files.controller.js";
import { body } from "express-validator";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.post("/create-file", authMiddleWare.authUser, fileController.createFileController);

router.post(
  "/get-file",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  fileController.getFileByIdController
);

router.put("/update-file", 
    authMiddleWare.authUser,
    body("projectId").isString().withMessage("Project ID is required"),
    body("fileTree").isObject().withMessage("File tree is required"),
    fileController.updateFileController);

router.post("/delete-files", 
    authMiddleWare.authUser,
    body("projectId").isString().withMessage("Project ID is not given"),
    fileController.deleteFileController);

export default router;
