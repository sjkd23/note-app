/**
 * categoryController.test.js
 * Tests category creation, retrieval, update, and deletion under the new validations.
 */
const request = require('supertest');
const app = require('../server');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../config/db'); // For DB connection

// Fake user payload for JWT
const userPayload = { id: new mongoose.Types.ObjectId(), username: 'testuser' };
const userToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

// Helper function to set auth header
const authHeader = () => ({ Authorization: `Bearer ${userToken}` });

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.close();
    await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Category Controller', () => {
    let categoryId;

    beforeEach(async () => {
        // Clear categories and create one for each test
        await Category.deleteMany();
        const category = await Category.create({
            name: 'Test Category',
            userId: userPayload.id
        });
        categoryId = category._id;
    });

    test('should create a category', async () => {
        const res = await request(app)
            .post('/api/notes/categories')
            .set(authHeader())
            .send({ name: 'New Test Category' });

        // Uncomment if debugging:
        // console.log("Create Category Response:", res.body);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('category');
        expect(res.body.category.name).toBe('New Test Category');
    });

    test('should fail to create empty category name', async () => {
        // This tests the new validation for non-empty name
        const res = await request(app)
            .post('/api/notes/categories')
            .set(authHeader())
            .send({ name: '' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Category name cannot be empty');
    });

    test('should get all categories', async () => {
        const res = await request(app)
            .get('/api/notes/categories')
            .set(authHeader());
        expect(res.status).toBe(200);
        expect(res.body.categories.length).toBeGreaterThan(0);
    });

    test('should get a category by id', async () => {
        const res = await request(app)
            .get(`/api/notes/categories/${categoryId}`)
            .set(authHeader());
        expect(res.status).toBe(200);
        expect(res.body.category.name).toBe('Test Category');
    });

    test('should update a category', async () => {
        const res = await request(app)
            .put(`/api/notes/categories/${categoryId}`)
            .set(authHeader())
            .send({ name: 'Updated Category' });
        expect(res.status).toBe(200);
        expect(res.body.category.name).toBe('Updated Category');
    });

    test('should delete a category', async () => {
        const res = await request(app)
            .delete(`/api/notes/categories/${categoryId}`)
            .set(authHeader());
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Category deleted successfully');

        // Confirm category is gone
        const checkRes = await request(app)
            .get(`/api/notes/categories/${categoryId}`)
            .set(authHeader());
        expect(checkRes.status).toBe(404);
    });
});
