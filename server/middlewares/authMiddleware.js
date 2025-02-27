/**
 * authMiddleware.js
 * Contains middleware to verify JWT tokens and optional request logging.
 */
const jwt = require("jsonwebtoken");

/**
 * Checks for a Bearer token in the 'Authorization' header and verifies it.
 * If valid, sets req.user to the decoded payload. If invalid, returns error with status 401 or 403.
 */
const isAuthenticated = (req, res, next) => {
  // Typically "Authorization: Bearer <token>"
  const header = req.headers.authorization;
  if (!header) {
    // No header at all
    const error = new Error("Unauthorized: No authorization header");
    error.status = 401;
    return next(error);
  }

  const token = header.split(" ")[1];
  if (!token) {
    const error = new Error("Unauthorized: No token provided");
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g. { id, username, iat, exp }
    return next();
  } catch (err) {
    err.message = "Invalid token";
    err.status = 403;
    return next(err);
  }
};

/**
 * Basic request logging middleware. If you want extra detail, add it here.
 */
const logRequests = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

module.exports = { isAuthenticated, logRequests };
