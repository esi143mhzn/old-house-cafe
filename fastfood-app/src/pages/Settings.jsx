import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Shop and account information</p>
      </div>

      <Card title="Shop Information">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Shop name</dt>
            <dd className="font-medium text-slate-800">FastFood Shop</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Payment methods</dt>
            <dd className="font-medium text-slate-800">Cash · QR / Digital</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">App version</dt>
            <dd className="font-medium text-slate-800">1.0.0</dd>
          </div>
        </dl>
      </Card>

      <Card title="Your Account">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-800">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Role</dt>
            <dd>
              <StatusBadge value={user?.role} />
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}