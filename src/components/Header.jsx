import { Navbar, Nav, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export default function Header({ total, done }) {
  return (
    <Navbar expand="sm" className="tasks-navbar mb-3">
      <Container>
        <Navbar.Brand href="#" className="tasks-brand">my <em>tasks</em></Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" className="tasks-nav-toggle" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/completed">Completed</Nav.Link>
            <Nav.Link as={NavLink} to="/graph">Graph</Nav.Link>
          </Nav>
          <Navbar.Text className="tasks-nav-stats small">
            {done} / {total} done
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}