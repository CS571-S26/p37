import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import Header from './components/Header'
import ProgressBar from './components/ProgressBar'
import AddTaskForm from './components/AddTaskForm'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import CompletedPage from './components/CompletedPage'

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function addTask({ title, desc, priority, dueDate }) {
    setTasks(prev => [{
      id: Date.now(), title, desc, priority, dueDate,
      done: false,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }, ...prev])
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    setTasks(prev => {
      const oldIndex = prev.findIndex(t => t.id === active.id)
      const newIndex = prev.findIndex(t => t.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active')  return !t.done
    if (filter === 'done')    return t.done
    if (filter === 'high')    return t.priority === 'high'
    if (filter === 'overdue') return !t.done && isOverdue(t.dueDate)
    return true
  })

  const isDraggable  = filter === 'all'
  const doneCount    = tasks.filter(t => t.done).length
  const overdueCount = tasks.filter(t => !t.done && isOverdue(t.dueDate)).length
  const completedTasks = tasks.filter(t => t.done)

  return (
    <div id="app">
      <Header total={tasks.length} done={doneCount} />

      <Routes>
        <Route path="/" element={
          <>
            <ProgressBar total={tasks.length} done={doneCount} />
            <AddTaskForm onAdd={addTask} />
            <FilterBar active={filter} onChange={setFilter} overdueCount={overdueCount} />
            {isDraggable ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <TaskList tasks={filtered} onToggle={toggleDone} onRemove={removeTask} draggable />
                </SortableContext>
              </DndContext>
            ) : (
              <TaskList tasks={filtered} onToggle={toggleDone} onRemove={removeTask} draggable={false} />
            )}
          </>
        } />

        <Route path="/completed" element={
          <CompletedPage tasks={completedTasks} onToggle={toggleDone} onRemove={removeTask} />
        } />
      </Routes>
    </div>
  )
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dueDate + 'T00:00:00') < today
}

export function isDueToday(dueDate) {
  if (!dueDate) return false
  const today = new Date()
  const due   = new Date(dueDate + 'T00:00:00')
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth()    === today.getMonth()    &&
    due.getDate()     === today.getDate()
  )
}