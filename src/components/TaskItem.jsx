import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PRIORITY_LABEL = { high: 'High', med: 'Medium', low: 'Low' }

export default function TaskItem({ task, onToggle, onRemove, draggable = false }) {
  const [removing, setRemoving] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !draggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.4 : 1,
    zIndex:    isDragging ? 999 : undefined,
  }

  function handleRemove() {
    setRemoving(true)
    setTimeout(() => onRemove(task.id), 300)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item${task.done ? ' done' : ''}${removing ? ' removing' : ''}${isDragging ? ' dragging' : ''}`}
    >
      {draggable && (
        <div
          className="drag-handle"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <circle cx="4" cy="3"  r="1.5" fill="currentColor" />
            <circle cx="4" cy="8"  r="1.5" fill="currentColor" />
            <circle cx="4" cy="13" r="1.5" fill="currentColor" />
            <circle cx="9" cy="3"  r="1.5" fill="currentColor" />
            <circle cx="9" cy="8"  r="1.5" fill="currentColor" />
            <circle cx="9" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </div>
      )}

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
          <span className={`priority-badge p-${task.priority}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <span className="task-date">{task.created}</span>
        </div>
      </div>

      <button className="del-btn" onClick={handleRemove} aria-label="Delete task">×</button>
    </div>
  )
}
