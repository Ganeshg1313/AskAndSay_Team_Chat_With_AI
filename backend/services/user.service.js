// Role: Handle user-related operations and interact with MongoDB

import User from "../models/user.model.js";

/**
 * Create a new user account.
 * @param {Object} params
 * @param {string} params.email - User's email address.
 * @param {string} params.password - User's plaintext password.
 * @returns {Promise<Object>} Created user document.
 * @throws {Error} If email or password is missing or creation fails.
 */
export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Securely hash the password before persisting
  const hashedPassword = await User.hashPassword(password);

  // Insert new user document into MongoDB
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  return user;
};

/**
 * Retrieve all users except the specified one.
 * @param {Object} params
 * @param {string} params.userId - ID of the user to exclude.
 * @returns {Promise<Array>} List of user documents.
 * @throws {Error} If the database query fails.
 */
export const getAllUsers = async ({ userId }) => {
  try {
    // Exclude the current user from the results
    const users = await User.find({
      _id: { $ne: userId },
    });
    return users;
  } catch (error) {
    // Wrap and rethrow error for controller handling
    throw new Error("Error fetching all users");
  }
};
