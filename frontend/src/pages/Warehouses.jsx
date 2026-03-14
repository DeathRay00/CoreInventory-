import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { warehousesApi } from '../api/client'
import toast from 'react-hot-toast'
import { Plus, MapPin } from 'lucide-react'

export default function Warehouses() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    setLoading(true)
    warehousesApi.list({ limit: 100 })
      .then(r => setData(r.data))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await warehousesApi.create(form); toast.success('Warehouse created')
      setModal(false); setForm({ name: '', address: '' }); fetch()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key: 'name',    label: 'Warehouse Name' },
    { key: 'address', label: 'Address', render: v => v || <span className="text-muted">—</span> },
  ]

  return (
    <>
      <Navbar title="Warehouses" subtitle="Manage your storage facilities" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left"><h2>Warehouses</h2></div>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New Warehouse</button>
        </div>
        <DataTable columns={cols} data={data} loading={loading} />
        {modal && (
          <Modal title="New Warehouse" onClose={() => setModal(false)}>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Warehouse Name</label>
                <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
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
