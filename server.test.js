// server.test.js - Unit tests for CI/CD pipeline
const request = require('supertest');
const app = require('./server');

describe('Todo API Tests', () => {
  
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/todos', () => {
    it('should return array of todos', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should have at least default todos', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = { task: 'Test Task' };
      const res = await request(app)
        .post('/api/todos')
        .send(newTodo);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('task', 'Test Task');
      expect(res.body).toHaveProperty('completed', false);
      expect(res.body).toHaveProperty('id');
    });

    it('should reject empty task', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo completion status', async () => {
      // First, get existing todos
      const getTodos = await request(app).get('/api/todos');
      const firstTodo = getTodos.body[0];

      // Update the todo
      const res = await request(app)
        .put(`/api/todos/${firstTodo.id}`)
        .send({ completed: true });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('completed', true);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .put('/api/todos/99999')
        .send({ completed: true });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      // Create a todo first
      const createRes = await request(app)
        .post('/api/todos')
        .send({ task: 'To Delete' });

      const todoId = createRes.body.id;

      // Delete it
      const deleteRes = await request(app)
        .delete(`/api/todos/${todoId}`);

      expect(deleteRes.statusCode).toBe(204);
    });

    it('should return 404 for non-existent todo', async () => {
      const res = await request(app)
        .delete('/api/todos/99999');

      expect(res.statusCode).toBe(404);
    });
  });
});