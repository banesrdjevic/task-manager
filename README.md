# Task Manager

A full-stack task manager: create, complete, and delete tasks through a React UI backed by a REST API and SQLite.

## Tech stack

- **Backend:** Node.js, Express, SQLite ([better-sqlite3](https://github.com/WiseLibs/better-sqlite3))
- **Frontend:** React (Vite), Axios
- **Tests:** Jest, Supertest

API base URL: `http://localhost:3001/api`

## Run locally

### Backend (port 3001)

```bash
cd backend
npm install
npm start
```

Ensure CORS allows the frontend origin (`http://localhost:5173`).

### Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open the app at **http://localhost:5173**.

### Tests

```bash
cd tests
npm install
npm test
```

SQLite uses a local file; no separate database server is required. See `SPEC.md` for the API contract and data model.
