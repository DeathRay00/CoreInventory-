import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import { ledgerApi, productsApi, warehousesApi } from '../api/client'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  receipt:      'badge-green',
  delivery:     'badge-red',
  transfer_in:  'badge-blue',
  transfer_out: 'badge-yellow',
  adjustment:   'badge-purple',
  product_creation: 'badge-blue',
}

export default function Ledger() {
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  const fetch = (p = 0) => {
    setLoading(true)
    Promise.all([ledgerApi.list({ limit: 50, offset: p * 50 }), productsApi.list({ limit: 200 }), warehousesApi.list({ limit: 100 })])
      .then(([l, pr, w]) => { setData(l.data); setProducts(pr.data); setWarehouses(w.data) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => fetch(page), [page])

  const whName   = (id) => warehouses.find(w => w.id === id)?.name || '—'
  const prodName = (id) => products.find(p => p.id === id)?.name   || '—'

  const cols = [
    { key: 'created_at',     label: 'Date/Time',   render: v => new Date(v).toLocaleString() },
    { key: 'change_type',    label: 'Type',         render: v => <span className={`badge ${TYPE_COLORS[v] || 'badge-gray'}`}>{v.replace('_', ' ')}</span> },
    { key: 'product_id',     label: 'Product',      render: v => prodName(v) },
    { key: 'warehouse_id',   label: 'Warehouse',    render: v => whName(v) },
    { key: 'quantity_change',label: 'Δ Qty',
      render: v => <span style={{ color: v >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>{v > 0 ? '+' : ''}{v}</span>
    },
  ]

  return (
    <>
      <Navbar title="Movement History" subtitle="Immutable audit trail of all stock changes" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left"><h2>Stock Ledger</h2></div>
        </div>
        <DataTable columns={cols} data={data} loading={loading} page={page} onPageChange={setPage} pageSize={50} />
      </div>
    </>
  )
}
