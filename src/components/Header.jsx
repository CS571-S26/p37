export default function Header({ total, done }) {
  return (
    <header>
      <h1>my <em>tasks</em></h1>
      <span id="stats">{done} of {total} done</span>
    </header>
  )
}
