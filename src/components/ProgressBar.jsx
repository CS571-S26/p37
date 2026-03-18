export default function ProgressBar({ total, done }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div id="progress-wrap">
      <div id="progress-label">
        <span>Progress</span>
        <span>{pct}%</span>
      </div>
      <div id="progress-bar-bg">
        <div id="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
