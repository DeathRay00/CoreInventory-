import { Link } from 'react-router-dom'

export default function StatsCard({ label, value, icon: Icon, color = 'blue', suffix = '', to }) {
  const content = (
    <>
      <div className={`stat-icon ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-value">{value ?? '—'}{suffix}</div>
      <div className="stat-label">{label}</div>
    </>
  )

  if (to) {
    return <Link to={to} className={`stat-card ${color}`} style={{ display: 'block' }}>{content}</Link>
  }

  return <div className={`stat-card ${color}`}>{content}</div>
}
