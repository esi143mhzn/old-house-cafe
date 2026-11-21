import { useCallback, useEffect, useState } from 'react'
import { createUser, deleteUser, fetchUsers, updateUser } from '../api/users'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Select from '../components/Select'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'staff' }

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await fetchUsers())
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

  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setFormErrors({})
    setModalOpen(true)
  }

  const save = async () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    if (!editing && !form.password) errors.password = 'Password is required.'
    if (form.password && form.password.length < 6) errors.password = 'At least 6 characters.'
    if (Object.keys(errors).length) {
      setFormErrors(errors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      }
      if (form.password) payload.password = form.password

      if (editing) {
        await updateUser(editing.id, payload)
        setNotice('User updated.')
      } else {
        await createUser(payload)
        setNotice('User created.')
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

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner label="Loading users..." />
  if (error && users.length === 0) return <ErrorState message={error} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">Manage staff and admin accounts</p>
        </div>
        <Button onClick={openCreate}>+ Add User</Button>
      </div>

      {notice && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {users.length === 0 ? (
          <EmptyState title="No users" message="Create your first user." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.name}
                      {u.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-slate-400">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={u.role} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        {u.id !== currentUser?.id && (
                          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(u)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? `Edit ${editing.name}` : 'Add User'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>
              {editing ? 'Save Changes' : 'Create User'}
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
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            error={formErrors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label={editing ? 'New password (leave blank to keep)' : 'Password'}
            type="password"
            value={form.password}
            error={formErrors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user?"
        message={`"${deleteTarget?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}