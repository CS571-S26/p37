import { useState, useEffect } from 'react'
import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import AddTaskForm from './components/AddTaskForm'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'

const STORAGE_KEY = 'cs571_tasks'

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function addTask({ title, desc, priority }) {
    const task = {
      id:       Date.now(),
      title,
      desc,
      priority,
      done:     false,
      created:  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    setTasks(prev => [task, ...prev])
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'done')   return t.done
    if (filter === 'high')   return t.priority === 'high'
    return true
  })

  const doneCount = tasks.filter(t => t.done).length

  return (
    <div id="app">
      <Header total={tasks.length} done={doneCount} />
      <ProgressBar total={tasks.length} done={doneCount} />
      <AddTaskForm onAdd={addTask} />
      <FilterBar active={filter} onChange={setFilter} />
      <TaskList tasks={filtered} onToggle={toggleDone} onRemove={removeTask} />
    </div>
  )
}
