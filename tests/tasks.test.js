const request = require('supertest');

const BASE = process.env.API_BASE_URL || 'http://localhost:3001';

const api = () => request(BASE);

/** In-process app for tests that mock global fetch (webhook notifications). */
const getApp = () => require('../backend/server');

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

      const response = await api()
        .delete(`/api/tasks/${id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message).toBe("Task deleted");

      const list = await api().get('/api/tasks').expect(200);
      expect(list.body.some((t) => t.id === id)).toBe(false);
    });
  });
});

describe('Webhook Registration', () => {
  const testUrl = `https://example.com/hook-${Date.now()}`;

  afterAll(async () => {
    await request(getApp())
      .delete('/api/webhooks/remove')
      .send({ url: testUrl })
      .catch(() => {});
  });

  it('POST /api/webhooks/register returns success', async () => {
    const res = await request(getApp())
      .post('/api/webhooks/register')
      .send({ url: testUrl })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({ message: 'Webhook registered' });
  });

  it('GET /api/webhooks lists the registered URL', async () => {
    const res = await request(getApp()).get('/api/webhooks').expect(200);

    expect(Array.isArray(res.body.webhooks)).toBe(true);
    expect(res.body.webhooks).toContain(testUrl);
  });

  it('DELETE /api/webhooks/remove returns success', async () => {
    const res = await request(getApp())
      .delete('/api/webhooks/remove')
      .send({ url: testUrl })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({ message: 'Webhook removed' });
  });

  it('GET /api/webhooks is empty after removal', async () => {
    const res = await request(getApp()).get('/api/webhooks').expect(200);

    expect(res.body.webhooks).toEqual([]);
  });
});

describe('Webhook Notifications', () => {
  let fetchSpy;
  let hookUrl;

  beforeEach(() => {
    hookUrl = `https://hook.test/notify-${Date.now()}-${Math.random()}`;
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true });
  });

  afterEach(async () => {
    if (hookUrl) {
      await request(getApp())
        .delete('/api/webhooks/remove')
        .send({ url: hookUrl })
        .catch(() => {});
    }
    fetchSpy.mockRestore();
  });

  it('POST /api/tasks triggers notifyWebhooks with task.created', async () => {
    await request(getApp())
      .post('/api/webhooks/register')
      .send({ url: hookUrl })
      .expect(200);

    const title = `qa-webhook-create-${Date.now()}`;
    const res = await request(getApp())
      .post('/api/tasks')
      .send({ title })
      .expect(201);

    expect(fetchSpy).toHaveBeenCalled();
    const createdCall = fetchSpy.mock.calls.find((call) => {
      const body = call[1]?.body;
      if (typeof body !== 'string') return false;
      try {
        return JSON.parse(body).event === 'task.created';
      } catch {
        return false;
      }
    });
    expect(createdCall).toBeDefined();
    expect(createdCall[0]).toBe(hookUrl);
    const payload = JSON.parse(createdCall[1].body);
    expect(payload).toMatchObject({
      event: 'task.created',
      data: { id: res.body.id, title, completed: res.body.completed },
    });
    expect(payload).toHaveProperty('timestamp');

    await request(getApp()).delete(`/api/tasks/${res.body.id}`).expect(200);
  });

  it('DELETE /api/tasks/:id triggers notifyWebhooks with task.deleted', async () => {
    await request(getApp())
      .post('/api/webhooks/register')
      .send({ url: hookUrl })
      .expect(200);

    const created = await request(getApp())
      .post('/api/tasks')
      .send({ title: `qa-webhook-delete-${Date.now()}` })
      .expect(201);

    fetchSpy.mockClear();

    await request(getApp())
      .delete(`/api/tasks/${created.body.id}`)
      .expect(200);

    expect(fetchSpy).toHaveBeenCalled();
    const deletedCall = fetchSpy.mock.calls.find((call) => {
      const body = call[1]?.body;
      if (typeof body !== 'string') return false;
      try {
        return JSON.parse(body).event === 'task.deleted';
      } catch {
        return false;
      }
    });
    expect(deletedCall).toBeDefined();
    expect(deletedCall[0]).toBe(hookUrl);
    expect(JSON.parse(deletedCall[1].body)).toMatchObject({
      event: 'task.deleted',
      data: { id: created.body.id },
    });
  });
});
