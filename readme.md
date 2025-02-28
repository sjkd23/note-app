# Note-Taking App

A full-stack Note-Taking application using Node.js, Express, MongoDB, and a client-side interface with HTML/CSS/JavaScript. Each user can register, log in, and manage their own notes—including categories/tags for organizing notes better.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation Steps](#installation-steps)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
  - [Register / Login](#register--login)
  - [Managing Notes](#managing-notes)
  - [Managing Categories](#managing-categories)
- [Running Tests](#running-tests)
- [License](#license)

---

## Features

- **User Authentication**: Create an account, log in, and manage personal note collections.
- **Create / Read / Update / Delete (CRUD)**: Users can add new notes, update them, clone them, or delete them.
- **Categories (Tags)**: Each note can be associated with multiple categories, making organization easy.
- **Responsive Front-End**: A simple, user-friendly interface that adapts to different screen sizes (desktop and mobile).
- **RESTful API**: All note operations are exposed via clean RESTful endpoints secured by JWT tokens.
- **Error Handling**: Ensures proper data is being given to the database, sending error codes when relevant.

---

## Tech Stack

1. **Node.js** + **Express**: Back-end server and routing.  
2. **MongoDB** (with Mongoose): For data persistence.  
3. **HTML/CSS/JavaScript**: Front-end user interface.  
4. **JWT**: Token-based authentication.  
5. **Swagger**: (Optional) for API documentation.  
6. **Jest** + **Supertest**: Automated testing suite.

---

## Project Structure

```bash
note-taking-app/                         
├── README.md                            # Project documentation
├── client                               # Front-end files
│   ├── public                           # Static assets (CSS, JS, images)
│   │   ├── css
│   │   │   └── styles.css               # Main stylesheet
│   │   ├── js                           # Front-end scripts
│   │   │   ├── auth.js                  # Client-side auth helper (JWT handling)
│   │   │   ├── categories.js            # Handles category management on the front-end
│   │   │   ├── index.js                 # Home page logic
│   │   │   ├── login.js                 # Login page logic
│   │   │   ├── notes.js                 # Note-taking page logic
│   │   │   └── register.js              # Registration logic
│   │   └── images                       # Static images/icons
│   ├── index.html                       # Home page
│   ├── login.html                       # Login page
│   ├── notes.html                       # Notes interface
│   └── register.html                    # Registration form
└── server                               # Back-end API
    ├── config
    │   └── db.js                        # Database connection setup
    ├── controllers                      # API request handlers
    │   ├── authController.js            # User authentication logic
    │   ├── noteController.js            # Note CRUD operations
    │   └── categoryController.js        # Category CRUD operations
    ├── middlewares
    │   └── authMiddleware.js            # JWT verification middleware
    ├── models                           # Database models (MongoDB/Mongoose)
    │   ├── User.js                      # User schema
    │   ├── Note.js                      # Note schema
    │   └── Category.js                  # Category schema
    ├── routes                           # API routes
    │   ├── authRoute.js                 # Routes for authentication (/api/auth)
    │   ├── noteRoute.js                 # Routes for notes (/api/notes)
    │   └── categoryRoute.js             # Routes for categories (/api/notes/categories)
    ├── tests                            # Automated tests (only for development)
    │   ├── authController.test.js       # Tests for auth functionality
    │   ├── noteController.test.js       # Tests for notes
    │   └── categoryController.test.js   # Tests for categories
    ├── .env                             # Environment variables (ignored in production)
    ├── package.json                     # Dependencies and scripts
    └── server.js                        # Main Express server entry point


```

---

## Setup and Installation

### Prerequisites

1. **Node.js** (v14 or later recommended)  
2. **MongoDB** installed locally or an online MongoDB service (e.g., MongoDB Atlas).

### Environment Variables

Create a `.env` file (in the project root) with the following keys:

```bash
MONGO_URI=<YourMongoURI>
JWT_SECRET=<YourSecretKey>
JWT_EXPIRES_IN=1h
NODE_ENV=development
PORT=5000
TEST_MONGO_URI=<YourMongoURIForTests>
```

- `MONGO_URI`: The connection string for your MongoDB database.
- `JWT_SECRET`: A random secret key used for JWT signing.
- `JWT_EXPIRES_IN`: Token expiration, e.g. `"1h"` or `"2d"`.
- `PORT`: The port the server runs on (default 5000).
- `TEST_MONGO_URI`: A separate database for running tests (only required if running tests).

### Installation Steps

1. **Clone** the repository:

   ```bash
   git clone https://github.com/sjkd23/note-app.git
   ```

2. **Navigate** to the project folder:

   ```bash
   cd note-taking-app
   ```

3. **Navigate** to the server folder:

   ```bash
   cd server
   ```

4. **Install** dependencies:

   ```bash
   npm install
   ```

5. **Create** your `.env` file as described above.
6. **Start** the server:

   ```bash
   npm start
   ```

7. **Set** your front-end API URL in `client/public/js/config.js`:

   ```js
   // config.js
   const CONFIG = {
     API_URL: "http://localhost:5000"  // or your deployed server URL
   };
   ```

8. **Open** the front-end in your browser:
  Open index.html in your browser (located in client/public)

---

## API Documentation

If you have **Swagger** set up, you can open:

```bash
GET /api-docs
```

to see the interactive docs. Otherwise, you can check the routes below:

- **Auth**  
  - `POST /api/auth/register`  
  - `POST /api/auth/login`
- **Notes**  
  - `GET /api/notes`  
  - `POST /api/notes`  
  - `GET /api/notes/:id`  
  - `PUT /api/notes/:id`  
  - `DELETE /api/notes/:id`
- **Categories**  
  - `POST /api/notes/categories`  
  - `GET /api/notes/categories`  
  - `GET /api/notes/categories/:id`  
  - `PUT /api/notes/categories/:id`  
  - `DELETE /api/notes/categories/:id`

These endpoints require a valid JWT in the `Authorization` header (except for `/register` and `/login`).

---

## Usage Guide

### Register / Login

1. **Register** a new user at `POST /api/auth/register` with `{ username, email, password }`.
2. **Login** at `POST /api/auth/login` with `{ email, password }`. On success, you’ll get a JWT `token`.

### Managing Notes

- **Create** a note: `POST /api/notes` with `{ title, content, categories (optional) }`.
- **View** all notes: `GET /api/notes`.
- **Update** a note: `PUT /api/notes/:id`.
- **Delete** a note: `DELETE /api/notes/:id`.
- **Clone**: You can also clone a note from the front-end UI if implemented.

### Managing Categories

- **Create** a category: `POST /api/notes/categories` with `{ name }`.
- **View** all categories: `GET /api/notes/categories`.
- **Update** a category: `PUT /api/notes/categories/:id`.
- **Delete** a category: `DELETE /api/notes/categories/:id`.

---

## Running Tests

- **Unit/Integration tests** use [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest).
- Ensure your `.env` includes `TEST_MONGO_URI`.
- Then run:

  ```bash
  npm test
  ```

- This will spin up a test environment, connect to `TEST_MONGO_URI`, and run the controllers’ tests.

---

## License

This project is licensed under the **MIT License**—feel free to modify or distribute. Check the `LICENSE` file (if you create one) for full details.

---
