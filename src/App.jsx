import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  function addTask({ title, desc, priority }) {
    const task = {
      id:      Date.now(),
      title,
      desc,
      priority,
      done:    false,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    setTasks(prev => [task, ...prev])
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Only reorder within the full task list (drag is disabled when filtered)
    setTasks(prev => {
      const oldIndex = prev.findIndex(t => t.id === active.id)
      const newIndex = prev.findIndex(t => t.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'done')   return t.done
    if (filter === 'high')   return t.priority === 'high'
    return true
  })

  const isDraggable = filter === 'all'
  const doneCount   = tasks.filter(t => t.done).length

  return (
    <div id="app">
      <Header total={tasks.length} done={doneCount} />
      <ProgressBar total={tasks.length} done={doneCount} />
      <AddTaskForm onAdd={addTask} />
      <FilterBar active={filter} onChange={setFilter} />

      {isDraggable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <TaskList
              tasks={filtered}
              onToggle={toggleDone}
              onRemove={removeTask}
              draggable
            />
          </SortableContext>
        </DndContext>
      ) : (
        <TaskList
          tasks={filtered}
          onToggle={toggleDone}
          onRemove={removeTask}
          draggable={false}
        />
      )}
    </div>
  )
}
