export default function StatsCard({ label, value, icon: Icon, color = 'blue', suffix = '' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-value">{value ?? '—'}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
