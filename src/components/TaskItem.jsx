import { useState } from 'react'

const PRIORITY_LABEL = { high: 'High', med: 'Medium', low: 'Low' }

export default function TaskItem({ task, onToggle, onRemove }) {
  const [removing, setRemoving] = useState(false)

  function handleRemove() {
    setRemoving(true)
    setTimeout(() => onRemove(task.id), 300)
  }

  return (
    <div className={`task-item${task.done ? ' done' : ''}${removing ? ' removing' : ''}`}>
      <div
        className={`check${task.done ? ' checked' : ''}`}
        role="checkbox"
        aria-checked={task.done}
        tabIndex={0}
        onClick={() => onToggle(task.id)}
        onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onToggle(task.id)}
      />
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.desc && <div className="task-desc">{task.desc}</div>}
        <div className="task-meta">
          <span className={`priority-badge p-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
          <span className="task-date">{task.created}</span>
        </div>
      </div>
      <button className="del-btn" onClick={handleRemove} aria-label="Delete task">×</button>
    </div>
  )
}
