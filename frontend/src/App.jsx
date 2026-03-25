import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import './App.css';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get('/api/tasks');
      setTasks(data);
    } catch (e) {
      setError(
        e.response?.data?.error || e.message || 'Failed to load tasks'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggle = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAdded = (task) => {
    setTasks((prev) => [...prev, task]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tasks</h1>
      </header>
      <main className="app-main">
        <AddTask onTaskAdded={handleAdded} />
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

export default App;
