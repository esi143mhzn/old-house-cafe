import { useCallback, useEffect, useState } from 'react'
import { fetchKitchenOrders, updateKitchenStatus } from '../api/kitchen'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { formatMoney, formatTime } from '../utils/format'

const STATUS_CARD = {
  new: 'border-blue-300 bg-white',
  preparing: 'border-amber-300 bg-amber-50/60',
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true)
    try {
      setOrders(await fetchKitchenOrders())
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(true)
    const interval = setInterval(() => load(false), 10000)
    return () => clearInterval(interval)
  }, [load])

  const advance = async (order) => {
    setBusyId(order.id)
    try {
      const next = order.status === 'new' ? 'preparing' : 'completed'
      await updateKitchenStatus(order.id, next)
      await load(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner label="Loading kitchen queue..." />
  if (error && orders.length === 0) return <ErrorState message={error} />

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Kitchen Display</h2>
        <p className="text-sm text-slate-500">
          {orders.length} active order{orders.length === 1 ? '' : 's'}
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Kitchen is all clear"
          message="New orders from the Quick Order screen will appear here."
          icon="🍳"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`rounded-xl border-2 p-4 shadow-sm ${STATUS_CARD[order.status] || STATUS_CARD.new}`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-slate-900">Order #{order.order_number}</p>
                  <p className="text-xs text-slate-500">
                    {order.order_type === 'dine_in'
                      ? order.table_number
                        ? `Dine-in · Table ${order.table_number}`
                        : 'Dine-in'
                      : 'Takeaway'}{' '}
                    · {formatTime(order.created_at)}
                  </p>
                </div>
                <StatusBadge value={order.status} />
              </div>

              <ul className="mb-4 space-y-1 border-t border-slate-100 pt-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-700">
                      {item.menu_name} <span className="text-slate-400">× {item.quantity}</span>
                    </span>
                    <span className="font-medium text-slate-800">{formatMoney(item.total)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-semibold text-slate-700">
                  {formatMoney(order.total)}
                </span>
                {order.status === 'new' ? (
                  <Button variant="primary" onClick={() => advance(order)} loading={busyId === order.id}>
                    Start Preparing
                  </Button>
                ) : (
                  <Button variant="success" onClick={() => advance(order)} loading={busyId === order.id}>
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}