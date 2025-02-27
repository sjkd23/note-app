/**
 * authController.js
 * Handles user registration & login. Interacts with User model.
 */
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Registers a new user (username, email, password).
 * Checks if email or username is already used.
 */
const register = async (req, res) => {
  try {
    // Removed verbose logging of req.body to avoid exposing the password
    // console.log("Received registration request:", req.body);

    const { username, email, password } = req.body;

    // Check if email is in use
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Check if username is in use
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already in use" });
    }

    // Create new user
    const user = await User.create({ username, email, password });
    return res.status(201).json({
      message: "User registered successfully",
      user
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Logs in an existing user, returns JWT if success
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      username: user.username
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { register, login };
