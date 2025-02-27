/**
 * server.js
 * Main Express server. Loads routes, sets up DB connection, configures Swagger for docs.
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoute = require('./routes/authRoute');
const noteRoute = require('./routes/noteRoute');
const categoryRoute = require('./routes/categoryRoute');
const connectDB = require('./config/db');
const app = express();

// ---------- Swagger Setup ----------
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Use cors & JSON body parsing
app.use(cors());
app.use(express.json());

// Connect to DB unless we're in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Serve static files from client/public
app.use(express.static(path.join(__dirname, "../client/public")));

// ---------- Swagger Options ----------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Note App API",
      version: "1.0.0",
      description: "API documentation for the Note Taking App"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    // Uncomment if you want global auth:
    // security: [{ bearerAuth: [] }]
  },
  apis: [
    "./routes/*.js" // or wherever your route files with JSDoc are
  ]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ---------- Routes ----------
app.use('/api/auth', authRoute);           // Public (no token needed)
app.use('/api/notes/categories', categoryRoute); // Protected
app.use('/api/notes', noteRoute);                // Protected

// Error middleware: logs stack, sends JSON
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// ---------- Start the Server ----------
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
