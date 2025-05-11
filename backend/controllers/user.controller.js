// user.controller.js
// Role: Handle HTTP requests for user-related operations

import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

/**
 * POST /users/register
 * Register a new user and return a JWT.
 */
export const createUserController = async (req, res) => {
  // Validate incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create user record
    const user = await userService.createUser(req.body);
    // Generate authentication token
    const token = await user.generateJWT();
    // Exclude password from response
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(201).json({ user: userObj, token });
  } catch (error) {
    console.error("Error in createUserController:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * POST /users/login
 * Authenticate a user and return a JWT.
 */
export const loginController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    // Retrieve user, including password hash
    const user = await userModel.findOne({ email }).select("+password");
    if (!user || !(await user.isValidPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = await user.generateJWT();
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).json({ user: userObj, token });
  } catch (error) {
    console.error("Error in loginController:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /users/profile
 * Return the authenticated user's profile.
 */
export const profileController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.status(200).json({ user: req.user });
};

/**
 * GET /users/logout
 * Invalidate the current JWT by storing it in Redis.
 */
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }
    // Blacklist token for 24 hours
    await redisClient.set(token, "logout", "EX", 24 * 3600);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logoutController:", error);
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET /users/all
 * Retrieve all users except the authenticated one.
 */
export const getAllUsersController = async (req, res) => {
  try {
    const currentUser = await userModel.findOne({ email: req.user.email });
    const users = await userService.getAllUsers({ userId: currentUser._id });
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error in getAllUsersController:", error);
    return res.status(400).json({ message: error.message });
  }
};
