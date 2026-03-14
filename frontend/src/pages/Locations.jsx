import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { locationsApi, warehousesApi } from '../api/client'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function Locations() {
  const [data, setData] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ warehouse_id: '', name: '', rack_code: '' })
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    setLoading(true)
    Promise.all([locationsApi.list({ limit: 100 }), warehousesApi.list({ limit: 100 })])
      .then(([l, w]) => { setData(l.data); setWarehouses(w.data) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await locationsApi.create(form); toast.success('Location created')
      setModal(false); setForm({ warehouse_id: '', name: '', rack_code: '' }); fetch()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const whName = (id) => warehouses.find(w => w.id === id)?.name || id

  const cols = [
    { key: 'name',         label: 'Location Name' },
    { key: 'warehouse_id', label: 'Warehouse', render: v => whName(v) },
    { key: 'rack_code',    label: 'Rack Code',  render: v => v || '—' },
  ]

  return (
    <>
      <Navbar title="Locations" subtitle="Storage racks and shelves within warehouses" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left"><h2>Storage Locations</h2></div>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New Location</button>
        </div>
        <DataTable columns={cols} data={data} loading={loading} />
        {modal && (
          <Modal title="New Location" onClose={() => setModal(false)}>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Warehouse</label>
                <select className="form-control" required value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
                  <option value="">Select warehouse</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Rack Code</label>
                <input className="form-control" value={form.rack_code} onChange={e => setForm({ ...form, rack_code: e.target.value })} />
              </div>
              <div className="flex gap-2 justify-between mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create'}</button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  )
}
