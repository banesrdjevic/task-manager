import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="muted empty-hint">No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
