import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import { stockApi, productsApi, warehousesApi } from '../api/client'
import toast from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'

export default function StockView() {
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    Promise.all([stockApi.list({ limit: 200 }), productsApi.list({ limit: 200 }), warehousesApi.list({ limit: 100 })])
      .then(([s, p, w]) => { setData(s.data); setProducts(p.data); setWarehouses(w.data) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const whName   = (id) => warehouses.find(w => w.id === id)?.name  || '—'
  const prodName = (id) => products.find(p => p.id === id)?.name    || '—'
  const reorder  = (pid) => products.find(p => p.id === pid)?.reorder_level || 0

  const qtyCell = (qty, row) => {
    const rl = reorder(row.product_id)
    const isLow = qty <= rl && qty > 0
    const isOut = qty === 0
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 700, color: isOut ? 'var(--accent-red)' : isLow ? 'var(--accent-yellow)' : 'var(--text-primary)' }}>
          {qty}
        </span>
        {(isLow || isOut) && <AlertTriangle size={13} color={isOut ? 'var(--accent-red)' : 'var(--accent-yellow)'} />}
      </span>
    )
  }

  const cols = [
    { key: 'product_id',   label: 'Product',   render: v => prodName(v) },
    { key: 'warehouse_id', label: 'Warehouse', render: v => whName(v) },
    { key: 'quantity',     label: 'Qty',       render: (v, row) => qtyCell(v, row) },
    { key: 'product_id',   label: 'Reorder Lvl', render: v => reorder(v) },
  ]

  return (
    <>
      <Navbar title="Stock" subtitle="Current inventory levels across all warehouses" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left"><h2>Current Stock</h2><p>⚠ Amber = low stock &nbsp;|&nbsp; 🔴 Red = out of stock</p></div>
        </div>
        <DataTable columns={cols} data={data} loading={loading} />
      </div>
    </>
  )
}
