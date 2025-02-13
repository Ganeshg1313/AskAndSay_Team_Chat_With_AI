import { Router } from "express";
import * as aiController from '../controllers/ai.controller.js';
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.get('/get-result',authMiddleWare.authUser, aiController.getResultController);

export default router;