// Role: Define the User schema, handling authentication data and related methods

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  // Unique, validated email address used as username
  email: {
    type: String,
    required: true,
    unique: [true, "Email has been used before"],
    trim: true,
    lowercase: true,
    minLength: [6, "Email must be at least 6 characters long"],
    maxLength: [50, "Email must not be longer than 50 characters"],
  },
  // Hashed password, excluded by default from query results
  password: {
    type: String,
    required: true,
    select: false,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} plaintext - The user's password to hash.
 * @returns {Promise<string>} - The hashed password.
 */
userSchema.statics.hashPassword = (plaintext) => {
  return bcrypt.hash(plaintext, 10);
};

/**
 * Compares a candidate password against the stored hash.
 * @param {string} candidate - The plaintext password to verify.
 * @returns {Promise<boolean>} - True if the passwords match.
 */
userSchema.methods.isValidPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * Generates a signed JWT for the user.
 * @returns {string} - Signed JSON Web Token containing the user's email.
 */
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Export the User model based on userSchema
export default mongoose.model("user", userSchema);
