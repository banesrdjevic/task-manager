const express = require('express');
const cors = require('cors');
require('./database');

const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://task-manager-snowy-two-40.vercel.app'
  ]
}));
app.use(express.json());

app.use('/api/tasks', tasksRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
