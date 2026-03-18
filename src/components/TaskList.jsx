import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onRemove }) {
  if (tasks.length === 0) {
    return (
      <div id="empty">
        <div id="empty-icon" />
        <p>Nothing here. Add a task above!</p>
      </div>
    )
  }
  return (
    <div id="task-list">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </div>
  )
}
