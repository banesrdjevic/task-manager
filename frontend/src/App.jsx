import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import './App.css';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import NewsFeed from './components/NewsFeed';

function App() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [newsRefreshCountdown, setNewsRefreshCountdown] = useState(60);
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
    <div className={`app${activeTab === 'news' ? ' app--news' : ''}`}>
      <header className="app-header">
        <div
          className="tab-bar"
          role="tablist"
          aria-label="Application sections"
        >
          <button
            type="button"
            role="tab"
            id="tab-tasks"
            aria-selected={activeTab === 'tasks'}
            aria-controls="panel-tasks"
            className={`tab-bar__btn${activeTab === 'tasks' ? ' tab-bar__btn--active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            type="button"
            role="tab"
            id="tab-news"
            aria-selected={activeTab === 'news'}
            aria-controls="panel-news"
            className={`tab-bar__btn${activeTab === 'news' ? ' tab-bar__btn--active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            News Feed
          </button>
        </div>
        <h1 className="app-header__title">
          {activeTab === 'tasks' ? (
            'Tasks'
          ) : (
            <>
              <span className="app-header__heading">News Feed</span>
              <span
                className="app-header__countdown"
                aria-live="polite"
                aria-label={`Articles refresh in ${newsRefreshCountdown} seconds`}
              >
                Next refresh in {newsRefreshCountdown}s
              </span>
            </>
          )}
        </h1>
      </header>
      <main className="app-main">
        {activeTab === 'tasks' ? (
          <div
            id="panel-tasks"
            role="tabpanel"
            aria-labelledby="tab-tasks"
          >
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
          </div>
        ) : (
          <div
            id="panel-news"
            role="tabpanel"
            aria-labelledby="tab-news"
          >
            <NewsFeed onCountdownChange={setNewsRefreshCountdown} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
