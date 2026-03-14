import { Bell } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

export default function Navbar({ title, subtitle }) {
  const { alertCount } = useNotifications()

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">{title}</div>
        {subtitle && <div className="navbar-subtitle">{subtitle}</div>}
      </div>
      <div className="navbar-actions">
        <div className="alert-badge-wrap">
          <button className="btn btn-ghost btn-icon">
            <Bell size={18} />
          </button>
          {alertCount > 0 && <span className="alert-dot" />}
        </div>
      </div>
    </header>
  )
}
