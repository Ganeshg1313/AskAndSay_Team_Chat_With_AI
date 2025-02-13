// Role: To control the user operations

import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator"; // Used to validate and sanitize user input in an application.
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Calling create user method from services
    const user = await userService.createUser(req.body);

    // Generating JWT token by calling the instance method
    const token = await user.generateJWT();

    const userObject = user.toObject();
    delete userObject.password;

    // returning the user and jwt token
    res.status(201).send({ user: userObject, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");
    // As we have set password = false by default, so while querying we need to explicitly select the password too.

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = await user.generateJWT();

    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({ user: userObject, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// This should only work for authenticated user (logged in user)
export const profileController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const logoutController = async (req, res) => {
  try {
    // Extract the token
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    // Stores the token in redis with value set to logout
    // Sets an expiration time for the key to avoid indefinite storage
    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const allUsers = await userService.getAllUsers({
      userId: loggedInUser._id,
    });

    res.status(200).json({ users: allUsers });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
