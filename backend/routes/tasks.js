const express = require('express');
const { db, rowToTask } = require('../database');
const { notifyWebhooks } = require('../webhooks');

const router = express.Router();

const listStmt = db.prepare(
  'SELECT id, title, completed, created_at FROM tasks ORDER BY id ASC'
);
const insertStmt = db.prepare(
  'INSERT INTO tasks (title) VALUES (?) RETURNING id, title, completed, created_at'
);
const getByIdStmt = db.prepare(
  'SELECT id, title, completed, created_at FROM tasks WHERE id = ?'
);
const updateCompletionStmt = db.prepare(
  'UPDATE tasks SET completed = ? WHERE id = ? RETURNING id, title, completed, created_at'
);
const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');

router.get('/', (req, res) => {
  const rows = listStmt.all();
  res.json(rows.map(rowToTask));
});

router.post('/', (req, res) => {
  const title =
    typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const row = insertStmt.get(title);
  const task = rowToTask(row);
  notifyWebhooks({
    event: 'task.created',
    data: task,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const existing = getByIdStmt.get(id);
  if (!existing) {
    return res.status(404).json({ error: 'task not found' });
  }
  const nextCompleted = existing.completed ? 0 : 1;
  const row = updateCompletionStmt.get(nextCompleted, id);
  const task = rowToTask(row);
  notifyWebhooks({
    event: 'task.updated',
    data: task,
    timestamp: new Date().toISOString(),
  });
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const info = deleteStmt.run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'task not found' });
  }
  notifyWebhooks({
    event: 'task.deleted',
    data: { id },
    timestamp: new Date().toISOString(),
  });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
