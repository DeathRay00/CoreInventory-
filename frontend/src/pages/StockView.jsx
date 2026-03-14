import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { stockApi, productsApi, warehousesApi, adjustmentsApi } from '../api/client'
import toast from 'react-hot-toast'
import { AlertTriangle, Edit2 } from 'lucide-react'

export default function StockView() {
  const [data, setData] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit stock modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editRow, setEditRow] = useState(null)
  const [newQty, setNewQty] = useState('')
  const [reason, setReason] = useState('')

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

  const handleUpdateClick = (row) => {
    setEditRow(row)
    setNewQty(row.quantity)
    setReason('Manual count update')
    setIsEditOpen(true)
  }

  const submitUpdate = async (e) => {
    e.preventDefault()
    try {
      const parsedQty = parseInt(newQty, 10)
      if (isNaN(parsedQty)) throw new Error("Invalid quantity")
      const qtyChange = parsedQty - editRow.quantity

      if (qtyChange === 0) {
        setIsEditOpen(false)
        return
      }

      await adjustmentsApi.create({
        product_id: editRow.product_id,
        warehouse_id: editRow.warehouse_id,
        quantity_change: qtyChange,
        reason: reason
      })
      toast.success("Stock updated successfully")
      setIsEditOpen(false)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.detail?.message || err.message)
    }
  }

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
    { key: 'product_id',   label: 'Product',       render: v => prodName(v) },
    { key: 'warehouse_id', label: 'Warehouse & Loc', render: v => whName(v) },
    { key: 'cost',         label: 'per unit cost', render: () => '3000 Rs' },
    { key: 'quantity',     label: 'On hand',       render: (v, row) => qtyCell(v, row) },
    { key: 'free',         label: 'free to Use',   render: (v, row) => row.quantity },
    { key: 'actions',      label: '',              render: (_, row) => (
      <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => handleUpdateClick(row)} title="Update Stock">
        <Edit2 size={14} />
      </button>
    ) },
  ]

  return (
    <>
      <Navbar title="Stock" subtitle="This page contains the warehouse details & location." />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left">
            <h2>Current Stock</h2>
            <p>User must be able to update the stock from here.</p>
          </div>
        </div>
        <DataTable columns={cols} data={data} loading={loading} />

        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Stock">
          <form className="form-group" onSubmit={submitUpdate}>
            <div style={{ marginBottom: 15 }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Updating stock for <strong>{prodName(editRow?.product_id)}</strong> at <strong>{whName(editRow?.warehouse_id)}</strong>
              </p>
            </div>
            <label>New On Hand Quantity</label>
            <input type="number" required value={newQty} onChange={e => setNewQty(e.target.value)} />
            
            <label>Reason for Adjustment</label>
            <input type="text" required minLength="3" placeholder="e.g. Physical count mismatch" value={reason} onChange={e => setReason(e.target.value)} />
            
            <div className="modal-actions" style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update</button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  )
}
