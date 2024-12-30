//Role: Create Schema and define methods

import mongoose from "mongoose";
import bcrypt from "bcrypt"; // bcrypt library for hashing and verifying passwords.
import jwt from "jsonwebtoken"; // jsonwebtoken library for creating and verifying JSON Web Tokens (JWT).

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [6, "Email must be at least 6 characters long"], //Set length constraints and custom error messages.
    maxLength: [50, "Email must not be longer than 50 characters"],
  },
  password: {
    type: String,
    select: false, //Excludes the password field from query results by default, enhancing security.
  },
});

//Static methods are called directly on the model
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

//Define an instance method isValidPassword for the schema.
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Define an instance method generateJWT for the schema.
userSchema.methods.generateJWT = async function () {
  return jwt.sign(
    { email: this.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: "24h" },
    );
};

//Create a model named User using the userSchema.
const User = mongoose.model("user", userSchema);

export default User;
