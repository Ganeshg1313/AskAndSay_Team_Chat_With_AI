import { Router } from "express";
import * as aiController from '../controllers/ai.controller.js';
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route   GET /ai/get-result
 * @desc    Generate AI response based on user prompt
 * @access  Protected (requires valid JWT)
 */
router.get(
  '/get-result',
  authMiddleWare.authUser,    // Ensure user is authenticated
  aiController.getResultController
);

export default router;
