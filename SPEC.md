# Task Manager App — Master Spec

## Overview
A full-stack task manager application with a REST API backend and React frontend.

## Folder Structure
task-manager/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── routes/
│   │   └── tasks.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   └── AddTask.jsx
│   └── package.json
├── tests/
│   └── tasks.test.js
└── SPEC.md

## API Contract

Base URL: http://localhost:3001/api

### Endpoints

GET /api/tasks
- Returns all tasks
- Response: [{ id, title, completed, created_at }]

POST /api/tasks
- Creates a new task
- Body: { title: string }
- Response: { id, title, completed, created_at }

PUT /api/tasks/:id
- Toggles task completion
- Response: { id, title, completed, created_at }

DELETE /api/tasks/:id
- Deletes a task
- Response: { message: "Task deleted" }

## Data Model

Table: tasks
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- title: TEXT NOT NULL
- completed: BOOLEAN DEFAULT 0
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

## Tech Stack
- Backend: Node.js, Express, SQLite (better-sqlite3)
- Frontend: React (Vite), Axios
- Tests: Jest, Supertest
- Database: SQLite (local file, no setup required)

## Rules
- Backend runs on port 3001
- Frontend runs on port 5173
- Backend must have CORS enabled for localhost:5173
- All API responses in JSON
- No authentication required
