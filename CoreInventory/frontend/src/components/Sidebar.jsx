import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Package, Tag, Warehouse, MapPin,
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight,
  SlidersHorizontal, History, Settings, LogOut, BoxesIcon
} from 'lucide-react'

const managerLinks = [
  { to: '/dashboard',   icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/products',    icon: Package,            label: 'Products' },
  { to: '/categories',  icon: Tag,                label: 'Categories' },
  { to: '/warehouses',  icon: Warehouse,          label: 'Warehouses' },
  { to: '/locations',   icon: MapPin,             label: 'Locations' },
  { to: '/stock',       icon: BoxesIcon,          label: 'Stock' },
  { to: '/ledger',      icon: History,            label: 'Movement History' },
  { to: '/settings',    icon: Settings,           label: 'Settings' },
]

const staffLinks = [
  { to: '/receipts',    icon: ArrowDownCircle,    label: 'Receipts' },
  { to: '/deliveries',  icon: ArrowUpCircle,      label: 'Deliveries' },
  { to: '/transfers',   icon: ArrowLeftRight,     label: 'Transfers' },
  { to: '/adjustments', icon: SlidersHorizontal,  label: 'Adjustments' },
  { to: '/stock',       icon: BoxesIcon,          label: 'Stock Lookup' },
]

export default function Sidebar() {
  const { user, logout, isManager } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const links = isManager ? managerLinks : staffLinks
  const allLinks = isManager
    ? managerLinks
    : [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }, ...staffLinks]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>CoreInventory</h1>
        <span>Enterprise Platform</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">
          {isManager ? 'Management' : 'Operations'}
        </div>
        {allLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="user-name truncate">{user?.name}</div>
            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
        <button className="btn btn-ghost w-full" style={{ justifyContent: 'center' }} onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
