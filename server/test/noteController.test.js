/**
 * noteController.test.js
 * Tests creation, retrieval, update, and deletion of notes under new validations and ownership checks.
 */
const request = require('supertest');
const app = require('../server');
const Note = require('../models/Note');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const userPayload = { id: new mongoose.Types.ObjectId(), username: 'testuser' };
const userToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
const authHeader = () => ({ Authorization: `Bearer ${userToken}` });

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.close();
    await new Promise(resolve => setTimeout(resolve, 1000));
});

describe('Note Controller', () => {
    let noteId;

    beforeEach(async () => {
        // Clear notes and create a test note
        await Note.deleteMany();
        const note = await Note.create({
            title: 'Test Note',
            content: 'This is a test',
            userId: userPayload.id
        });
        noteId = note._id;
    });

    test('should create a new note', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set(authHeader())
            .send({ title: 'Another Note', content: 'This is another test' });
        expect(res.status).toBe(201);
        expect(res.body.note.title).toBe('Another Note');
    });

    test('should fail to create note with empty title', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set(authHeader())
            .send({ title: '', content: 'No title here' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Note title cannot be empty');
    });

    test('should fail to create note with empty content', async () => {
        const res = await request(app)
            .post('/api/notes')
            .set(authHeader())
            .send({ title: 'Missing Content', content: '' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Note content cannot be empty');
    });

    test('should get all notes', async () => {
        const res = await request(app)
            .get('/api/notes')
            .set(authHeader());
        expect(res.status).toBe(200);
        // We start with 1 note from beforeEach, so expect at least 1
        expect(res.body.notes.length).toBeGreaterThan(0);
    });

    test('should get a note by id', async () => {
        const res = await request(app)
            .get(`/api/notes/${noteId}`)
            .set(authHeader());
        expect(res.status).toBe(200);
        expect(res.body.note._id).toBe(noteId.toString());
    });

    test('should update a note', async () => {
        const res = await request(app)
            .put(`/api/notes/${noteId}`)
            .set(authHeader())
            .send({ title: 'Updated Note', content: 'This is an updated note' });
        // Uncomment if debugging:
        // console.log("Update Note Response:", res.body);

        expect(res.status).toBe(200);
        expect(res.body.updatedNote).toBeDefined();
        expect(res.body.updatedNote.title).toBe('Updated Note');
    });

    test('should delete a note', async () => {
        const res = await request(app)
            .delete(`/api/notes/${noteId}`)
            .set(authHeader());
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Note deleted successfully');

        // Verify it's gone
        const checkRes = await request(app)
            .get(`/api/notes/${noteId}`)
            .set(authHeader());
        expect(checkRes.status).toBe(404);
    });
});
