import { useState } from 'react';
import { api } from '../api';

export default function AddTask({ onTaskAdded }) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/tasks', { title: trimmed });
      onTaskAdded(data);
      setTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task…"
        aria-label="Task title"
      />
      <button type="submit" disabled={submitting || !title.trim()}>
        Add task
      </button>
    </form>
  );
}
