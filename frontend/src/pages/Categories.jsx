import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { categoriesApi } from '../api/client'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function Categories() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    setLoading(true)
    categoriesApi.list({ limit: 100 })
      .then(r => setData(r.data))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await categoriesApi.create(form)
      toast.success('Category created')
      setModal(false); setForm({ name: '', description: '' }); fetch()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key: 'name', label: 'Category Name' },
    { key: 'description', label: 'Description' },
  ]

  return (
    <>
      <Navbar title="Categories" subtitle="Organise products into categories" />
      <div className="page-body">
        <div className="page-header">
          <div className="page-header-left"><h2>Categories</h2></div>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New Category</button>
        </div>
        <DataTable columns={cols} data={data} loading={loading} />
        {modal && (
          <Modal title="New Category" onClose={() => setModal(false)}>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
