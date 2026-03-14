import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { Shield, Info } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()

  const permissions = user?.role === 'inventory_manager'
    ? ['View Dashboard', 'Manage Products & Categories', 'Manage Warehouses & Locations', 'View Stock Ledger', 'Create & Validate all operations']
    : ['Create Receipts & Deliveries', 'Execute Transfers', 'Apply Adjustments', 'View Stock']

  return (
    <>
      <Navbar title="Settings" subtitle="Account and platform information" />
      <div className="page-body">
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 18 }}>
            <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={16} /> Account Information
            </div>
            {[
              ['Name',  user?.name],
              ['Email', user?.email],
              ['Role',  user?.role?.replace('_', ' ')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-muted" style={{ fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} /> Role Permissions
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
              Your role: <strong style={{ color: 'var(--accent-blue)' }}>{user?.role?.replace('_', ' ')}</strong>
            </p>
            {permissions.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--accent-green)', fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 13.5 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
