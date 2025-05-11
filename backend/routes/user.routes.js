// Role: User authentication, registration, and management routes

import { Router } from "express";
import { body } from "express-validator";
import * as userController from "../controllers/user.controller.js";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @route   POST /users/register
 * @desc    Create a new user account and return a JWT
 * @access  Public
 */
router.post(
  "/register",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.createUserController
);

/**
 * @route   POST /users/login
 * @desc    Authenticate a user and return a JWT
 * @access  Public
 */
router.post(
  "/login",
  body("email").isEmail().withMessage("Email must be a valid email address"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  userController.loginController
);

/**
 * @route   GET /users/profile
 * @desc    Retrieve the profile of the authenticated user
 * @access  Protected (requires valid JWT)
 */
router.get(
  "/profile",
  authMiddleWare.authUser,
  userController.profileController
);

/**
 * @route   GET /users/logout
 * @desc    Invalidate the current JWT by blacklisting it in Redis
 * @access  Protected (requires valid JWT)
 */
router.get(
  "/logout",
  authMiddleWare.authUser,
  userController.logoutController
);

/**
 * @route   GET /users/all
 * @desc    Get a list of all users except the authenticated user
 * @access  Protected (requires valid JWT)
 */
router.get(
  "/all",
  authMiddleWare.authUser,
  userController.getAllUsersController
);

export default router;
