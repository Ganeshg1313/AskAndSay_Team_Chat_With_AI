import { Router } from "express";
import * as fileController from "../controllers/files.controller.js";
import { body } from "express-validator";

const router = Router();

router.post("/create-file", fileController.createFileController);

router.post(
  "/get-file",
  body("projectId").isString().withMessage("Project ID is required"),
  fileController.getFileByIdController
);

router.put("/update-file", 
    body("projectId").isString().withMessage("Project ID is required"),
    body("fileTree").isObject().withMessage("File tree is required"),
    fileController.updateFileController);

router.post("/delete-files", 
    body("projectId").isString().withMessage("Project ID is not given"),
    fileController.deleteFileController);

export default router;
