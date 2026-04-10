import { Container, Badge } from 'react-bootstrap'
import TaskList from './TaskList'

export default function CompletedPage({ tasks, onToggle, onRemove }) {
  return (
    <Container className="mt-3">
      <h2>
        Completed Tasks{' '}
        <Badge bg="success">{tasks.length}</Badge>
      </h2>
      {tasks.length === 0
        ? <p className="text-muted">No completed tasks yet. Get to work! 💪</p>
        : <TaskList tasks={tasks} onToggle={onToggle} onRemove={onRemove} draggable={false} />
      }
    </Container>
  )
}