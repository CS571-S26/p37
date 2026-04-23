import { Container } from 'react-bootstrap'
import TaskList from './TaskList'

export default function CompletedPage({ tasks, onToggle, onRemove }) {
  return (
    <Container className="mt-3 tasks-completed">
      <h2 className="tasks-page-title">
        Completed Tasks{' '}
        <span className="tasks-count-pill" aria-label={`${tasks.length} total`}>
          {tasks.length}
        </span>
      </h2>
      {tasks.length === 0
        ? <p className="tasks-muted">No completed tasks yet. Get to work! 💪</p>
        : <TaskList tasks={tasks} onToggle={onToggle} onRemove={onRemove} draggable={false} />
      }
    </Container>
  )
}