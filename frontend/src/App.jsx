import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import Products      from './pages/Products'
import Categories    from './pages/Categories'
import Warehouses    from './pages/Warehouses'
import Locations     from './pages/Locations'
import Receipts      from './pages/Receipts'
import Deliveries    from './pages/Deliveries'
import Transfers     from './pages/Transfers'
import Adjustments   from './pages/Adjustments'
import StockView     from './pages/StockView'
import Ledger        from './pages/Ledger'
import Settings      from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

      <Route path="/dashboard"   element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/products"    element={<ProtectedRoute><AppLayout><Products /></AppLayout></ProtectedRoute>} />
      <Route path="/categories"  element={<ProtectedRoute><AppLayout><Categories /></AppLayout></ProtectedRoute>} />
      <Route path="/warehouses"  element={<ProtectedRoute><AppLayout><Warehouses /></AppLayout></ProtectedRoute>} />
      <Route path="/locations"   element={<ProtectedRoute><AppLayout><Locations /></AppLayout></ProtectedRoute>} />
      <Route path="/receipts"    element={<ProtectedRoute><AppLayout><Receipts /></AppLayout></ProtectedRoute>} />
      <Route path="/deliveries"  element={<ProtectedRoute><AppLayout><Deliveries /></AppLayout></ProtectedRoute>} />
      <Route path="/transfers"   element={<ProtectedRoute><AppLayout><Transfers /></AppLayout></ProtectedRoute>} />
      <Route path="/adjustments" element={<ProtectedRoute><AppLayout><Adjustments /></AppLayout></ProtectedRoute>} />
      <Route path="/stock"       element={<ProtectedRoute><AppLayout><StockView /></AppLayout></ProtectedRoute>} />
      <Route path="/ledger"      element={<ProtectedRoute><AppLayout><Ledger /></AppLayout></ProtectedRoute>} />
      <Route path="/settings"    element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
