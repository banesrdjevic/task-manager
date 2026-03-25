import { api } from '../api';

export default function TaskItem({ task, onToggle, onDelete }) {
  const handleCheckbox = async () => {
    try {
      const { data } = await api.put(`/api/tasks/${task.id}`);
      onToggle(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/tasks/${task.id}`);
      onDelete(task.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <li className="task-item">
      <label className="task-label">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleCheckbox}
        />
        <span className={task.completed ? 'task-title done' : 'task-title'}>
          {task.title}
        </span>
      </label>
      <button type="button" className="btn-delete" onClick={handleDelete}>
        Delete
      </button>
    </li>
  );
}
