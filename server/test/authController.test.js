/**
 * authController.test.js
 * Tests user registration and login with the updated authController.
 */
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');
const connectDB = require('../config/db'); // For DB connection

beforeAll(async () => {
    // Use test environment, connect to DB
    process.env.NODE_ENV = 'test';
    await connectDB();
    // Clear users before running tests
    await User.deleteMany();
});

afterAll(async () => {
    // Close DB connection after tests
    await mongoose.connection.close();
    // Slight delay to ensure Jest exits cleanly
    await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Auth Controller', () => {
    let email;
    const password = 'password';

    test('should register a user', async () => {
        email = `testuser${Date.now()}@example.com`; // Unique email per run
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'newuser', email, password });

        // Uncomment if you want debugging:
        // console.log("Register Response:", res.body);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toBe('newuser');

        // Store for login test
        email = res.body.user.email;
    });

    test('should log in a registered user', async () => {
        // Wait a bit to ensure user is saved
        await new Promise(resolve => setTimeout(resolve, 500));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password });

        // Uncomment if debugging:
        // console.log("Login Response:", res.body);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('username', 'newuser');
    });
});
