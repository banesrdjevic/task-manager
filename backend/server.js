const express = require('express');
const cors = require('cors');
const { db, rowToTask } = require('./database');

const tasksRouter = require('./routes/tasks');
const {
  registerWebhook,
  removeWebhook,
  getWebhooks,
  addSSEListener,
  removeSSEListener,
} = require('./webhooks');

function getAllTasks() {
  const rows = db
    .prepare(
      'SELECT id, title, completed, created_at FROM tasks ORDER BY id ASC'
    )
    .all();
  return rows.map(rowToTask);
}

const app = express();
const PORT = 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://task-manager-snowy-two-40.vercel.app'
  ]
}));
app.use(express.json());

app.get('/api/tasks/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendSse = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const tasks = getAllTasks();
  sendSse({ event: 'task.initial', data: tasks });

  const listener = (payload) => {
    sendSse(payload);
  };
  addSSEListener(listener);

  req.on('close', () => {
    removeSSEListener(listener);
  });
});

app.use('/api/tasks', tasksRouter);

app.post('/api/webhooks/register', (req, res) => {
  const url =
    typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }
  registerWebhook(url);
  res.json({ message: 'Webhook registered', url });
});

app.delete('/api/webhooks/remove', (req, res) => {
  const url =
    typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }
  removeWebhook(url);
  res.json({ message: 'Webhook removed', url });
});

app.get('/api/webhooks', (req, res) => {
  res.json({ webhooks: getWebhooks() });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}
