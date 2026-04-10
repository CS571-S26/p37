
const FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'active',  label: 'Active' },
  { key: 'high',    label: 'High priority' },
  { key: 'overdue', label: 'Overdue' },
]
export default function FilterBar({ active, onChange, overdueCount }) {
  return (
    <div id="filters">
      {FILTERS.map(f => (
        <button
          key={f.key}
          className={`filter-btn${active === f.key ? ' active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
          {f.key === 'overdue' && overdueCount > 0 && (
            <span className="overdue-badge">{overdueCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
