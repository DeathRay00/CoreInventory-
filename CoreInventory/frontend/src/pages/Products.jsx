import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { productsApi, categoriesApi } from '../api/client'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const COLS = [
  { key: 'name',            label: 'Product Name' },
  { key: 'sku',             label: 'SKU' },
  { key: 'unit_of_measure', label: 'Unit' },
  { key: 'reorder_level',   label: 'Reorder Lvl' },
  { key: 'actions',         label: '' },
]

const empty = { name: '', sku: '', category_id: '', unit_of_measure: 'pcs', reorder_level: 0 }

export default function Products() {
  const [data, setData] = useState([])
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [modal, setModal] = useState(null) // null | 'create' | product-obj
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        productsApi.list({ search, limit: 20, offset: page * 20 }),
        categoriesApi.list({ limit: 100 }),
      ])
      setData(p.data); setCats(c.data)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setForm(empty); setModal('create') }
  const openEdit   = (row) => { setForm({ ...row, category_id: row.category_id || '' }); setModal(row) }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'create') {
        await productsApi.create(form); toast.success('Product created')
      } else {
        await productsApi.update(modal.id, form); toast.success('Product updated')
      }
      setModal(null); fetchData()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await productsApi.delete(id); toast.success('Deleted'); fetchData() }
    catch (err) { toast.error(err.message) }
  }

  const cols = [...COLS.slice(0, -1), {
    key: 'actions', label: '',
    render: (_, row) => (
      <div className="flex gap-2">
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(row)}><Pencil size={14} /></button>
        <button className="btn btn-danger btn-sm btn-icon"  onClick={() => del(row.id)}><Trash2 size={14} /></button>
      </div>
    ),
  }]

  return (
    <>
      <Navbar title="Products" subtitle="Manage your product catalogue" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left">
            <h2>Products</h2><p>{data.length} items loaded</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Product</button>
        </div>

        <DataTable
          columns={cols} data={data} loading={loading}
          onSearch={setSearch} searchPlaceholder="Search by name or SKU…"
          page={page} onPageChange={setPage} pageSize={20}
        />

        {modal && (
          <Modal title={modal === 'create' ? 'New Product' : 'Edit Product'} onClose={() => setModal(null)}>
            <form onSubmit={save}>
              {[
                { label: 'Product Name', name: 'name', type: 'text', required: true },
                { label: 'SKU',          name: 'sku',  type: 'text', required: true, disabled: modal !== 'create' },
                { label: 'Unit of Measure', name: 'unit_of_measure', type: 'text' },
                { label: 'Reorder Level',   name: 'reorder_level',   type: 'number' },
              ].map(f => (
                <div className="form-group" key={f.name}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-control" type={f.type} required={f.required} disabled={f.disabled}
                    value={form[f.name]} onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">No Category</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-between mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  )
}
