const request = require('supertest');

const BASE = process.env.API_BASE_URL || 'http://localhost:3001';

const api = () => request(BASE);

describe('Task API', () => {
  describe('GET /api/tasks', () => {
    it('should return an array', async () => {
      const res = await api().get('/api/tasks').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    let createdId;

    afterEach(async () => {
      if (createdId != null) {
        await api().delete(`/api/tasks/${createdId}`).catch(() => {});
        createdId = null;
      }
    });

    it('should create a task and return it with an id', async () => {
      const title = `qa-post-${Date.now()}`;
      const res = await api()
        .post('/api/tasks')
        .send({ title })
        .expect('Content-Type', /json/)
        .expect(201);

      createdId = res.body.id;
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(title);
      expect(res.body).toHaveProperty('completed');
      expect(res.body).toHaveProperty('created_at');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const title = `qa-put-${Date.now()}`;
      const res = await api().post('/api/tasks').send({ title }).expect(201);
      taskId = res.body.id;
    });

    afterEach(async () => {
      if (taskId != null) {
        await api().delete(`/api/tasks/${taskId}`).catch(() => {});
        taskId = null;
      }
    });

    it('should toggle the completed field', async () => {
      const before = await api().get('/api/tasks').expect(200);
      const taskBefore = before.body.find((t) => t.id === taskId);
      expect(taskBefore).toBeDefined();
      const priorCompleted = taskBefore.completed;

      const res = await api()
        .put(`/api/tasks/${taskId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.id).toBe(taskId);
      expect(res.body.completed).not.toBe(priorCompleted);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete the task and return success message', async () => {
      const title = `qa-delete-${Date.now()}`;
      const created = await api().post('/api/tasks').send({ title }).expect(201);
      const id = created.body.id;

      const res = await api()
        .delete(`/api/tasks/${id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toEqual({ message: 'Task deleted' });

      const list = await api().get('/api/tasks').expect(200);
      expect(list.body.some((t) => t.id === id)).toBe(false);
    });
  });
});
