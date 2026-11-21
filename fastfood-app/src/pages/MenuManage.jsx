import { useCallback, useEffect, useState } from 'react'
import { createMenu, deleteMenu, fetchMenus, updateMenu } from '../api/menus'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { formatMoney } from '../utils/format'

const EMPTY_FORM = { name: '', description: '', price: '', image: '', is_available: true }

export default function MenuManagePage() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = create
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setMenus(await fetchMenus())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (menu) => {
    setEditing(menu)
    setForm({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      image: menu.image || '',
      is_available: menu.is_available,
    })
    setFormErrors({})
    setModalOpen(true)
  }

  const save = async () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    if (form.price === '' || Number(form.price) < 0) errors.price = 'A valid price is required.'
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        image: form.image.trim() || null,
        is_available: form.is_available,
      }
      if (editing) {
        await updateMenu(editing.id, payload)
        setNotice('Menu item updated.')
      } else {
        await createMenu(payload)
        setNotice('Menu item created.')
      }
      setModalOpen(false)
      await load()
      window.setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailability = async (menu) => {
    try {
      await updateMenu(menu.id, { is_available: !menu.is_available })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteMenu(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner label="Loading menu..." />
  if (error && menus.length === 0) return <ErrorState message={error} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Menu Management</h2>
          <p className="text-sm text-slate-500">Add, edit and manage availability</p>
        </div>
        <Button onClick={openCreate}>+ Add Item</Button>
      </div>

      {notice && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {menus.length === 0 ? (
        <EmptyState title="No menu items" message="Create your first menu item." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`rounded-xl border p-4 shadow-sm ${
                menu.is_available ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{menu.name}</h3>
                  <p className="text-sm text-slate-500">{menu.description || 'No description'}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                    menu.is_available
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {menu.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {menu.image && (
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="mb-2 h-24 w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-orange-600">{formatMoney(menu.price)}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={menu.is_available ? 'secondary' : 'primary'}
                    onClick={() => toggleAvailability(menu)}
                  >
                    {menu.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(menu)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(menu)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.name}` : 'Add Menu Item'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>
              {editing ? 'Save Changes' : 'Create Item'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            error={formErrors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Chicken Momo"
          />
          <Input
            label="Description"
            value={form.description}
            error={formErrors.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description (optional)"
          />
          <Input
            label="Price (Rs.)"
            type="number"
            min="0"
            value={form.price}
            error={formErrors.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0"
          />
          <Input
            label="Image URL (optional)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://example.com/momo.jpg"
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              className="h-4 w-4 accent-orange-500"
            />
            Available for ordering
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete menu item?"
        message={`"${deleteTarget?.name}" will be permanently removed. Past orders keep their item details.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}