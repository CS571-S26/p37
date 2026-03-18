const FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done',   label: 'Done' },
  { key: 'high',   label: 'High priority' },
]

export default function FilterBar({ active, onChange }) {
  return (
    <div id="filters">
      {FILTERS.map(f => (
        <button
          key={f.key}
          className={`filter-btn${active === f.key ? ' active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
