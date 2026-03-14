import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { adjustmentsApi, productsApi, warehousesApi } from '../api/client'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function Adjustments() {
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', quantity_change: 0, reason: '' })
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    setLoading(true)
    Promise.all([adjustmentsApi.list({ limit: 50 }), productsApi.list({ limit: 200 }), warehousesApi.list({ limit: 100 })])
      .then(([a, p, w]) => { setData(a.data); setProducts(p.data); setWarehouses(w.data) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await adjustmentsApi.create({ ...form, quantity_change: +form.quantity_change })
      toast.success('Adjustment applied')
      setModal(false); fetch()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  const whName   = (id) => warehouses.find(w => w.id === id)?.name || '—'
  const prodName = (id) => products.find(p => p.id === id)?.name  || '—'

  const cols = [
    { key: 'product_id',      label: 'Product',   render: v => prodName(v) },
    { key: 'warehouse_id',    label: 'Warehouse', render: v => whName(v) },
    { key: 'quantity_change', label: 'Δ Qty',
      render: v => <span style={{ color: v >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>{v > 0 ? '+' : ''}{v}</span>
    },
    { key: 'reason',    label: 'Reason' },
    { key: 'created_at', label: 'Date', render: v => new Date(v).toLocaleDateString() },
  ]

  return (
    <>
      <Navbar title="Adjustments" subtitle="Manual stock corrections" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left"><h2>Stock Adjustments</h2></div>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New Adjustment</button>
        </div>
        <DataTable columns={cols} data={data} loading={loading} />

        {modal && (
          <Modal title="New Stock Adjustment" onClose={() => setModal(false)}>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select className="form-control" required value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Warehouse</label>
                <select className="form-control" required value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
                  <option value="">Select warehouse…</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Change (use negative to reduce)</label>
                <input className="form-control" type="number" required value={form.quantity_change} onChange={e => setForm({ ...form, quantity_change: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea className="form-control" rows={2} required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-between mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Applying…' : 'Apply Adjustment'}</button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  )
}
