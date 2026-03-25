const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function rowToTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    created_at: row.created_at,
  };
}

module.exports = { db, rowToTask };
