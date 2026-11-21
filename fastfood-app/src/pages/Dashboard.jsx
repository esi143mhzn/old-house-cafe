import { useCallback, useEffect, useState } from 'react'
import { fetchDashboard } from '../api/dashboard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Spinner from '../components/Spinner'
import { formatMoney } from '../utils/format'

function StatCard({ label, value, sub, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fetchDashboard())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Spinner label="Loading dashboard..." />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">Today at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Today's Orders" value={data.today_orders} />
        <StatCard label="Today's Sales" value={formatMoney(data.today_sales)} accent="text-emerald-600" />
        <StatCard
          label="Completed Orders"
          value={data.today_completed_orders}
          icon="✅"
        />
        <StatCard
          label="Pending Kitchen Orders"
          value={data.pending_kitchen_orders}
          accent="text-amber-600"
        />
        <StatCard
          label="Average Order Value"
          value={formatMoney(data.average_order_value)}
        />
        <StatCard
          label="Overview"
          value={
            <span className="text-base font-semibold">
              {data.today_orders} orders · {formatMoney(data.today_sales)} total
            </span>
          }
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          Popular Items Today
        </h3>
        {!data.popular_items?.length ? (
          <EmptyState title="No items sold today" message="Orders you create will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.popular_items.map((item, idx) => (
              <li key={item.menu_id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-semibold text-slate-400">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800">{item.menu_name}</span>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {item.quantity_sold} sold
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}