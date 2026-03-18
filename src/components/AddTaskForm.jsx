import { useState, useRef } from 'react'

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [priority, setPriority] = useState('med')
  const [shake, setShake]       = useState(false)
  const titleRef = useRef(null)

  function handleSubmit() {
    if (!title.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      titleRef.current?.focus()
      return
    }
    onAdd({ title: title.trim(), desc: desc.trim(), priority })
    setTitle('')
    setDesc('')
    setPriority('med')
  }

  return (
    <div id="add-section">
      <div id="add-row-1">
        <input
          ref={titleRef}
          id="add-title"
          type="text"
          placeholder="Add a task…"
          maxLength={80}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={shake ? { borderColor: '#EF4444' } : {}}
        />
        <button id="add-btn" onClick={handleSubmit}>Add</button>
      </div>
      <div id="add-row-2">
        <input
          id="add-desc"
          type="text"
          placeholder="Description (optional)"
          maxLength={120}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <select id="add-priority" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="med">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  )
}
