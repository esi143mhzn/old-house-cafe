import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchOrder, updateOrder } from '../api/orders'
import Button from '../components/Button'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime, formatMoney } from '../utils/format'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [payModal, setPayModal] = useState(false)
  const [method, setMethod] = useState('cash')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setOrder(await fetchOrder(id))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const recordPayment = async () => {
    setSaving(true)
    try {
      const result = await updateOrder(order.id, {
        payment_status: 'paid',
        payment_method: method,
      })
      setOrder(result.data)
      setPayModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="Loading order..." />
  if (error && !order) return <ErrorState message={error} />

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/orders"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            ← Back to orders
          </Link>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Order #{order.order_number}</h2>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={order.status} />
          <StatusBadge value={order.payment_status} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 gap-4 border-b border-slate-200 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Date / Time</p>
            <p className="text-sm font-medium text-slate-800">{formatDateTime(order.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Order Type</p>
            <p className="text-sm font-medium capitalize text-slate-800">
              {order.order_type}
              {order.table_number ? ` · Table ${order.table_number}` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Staff</p>
            <p className="text-sm font-medium text-slate-800">{order.staff?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Payment Status</p>
            <p className="text-sm font-medium capitalize text-slate-800">{order.payment_status}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Payment Method</p>
            <p className="text-sm font-medium capitalize text-slate-800">
              {order.payment_method ? (order.payment_method === 'qr' ? 'QR / Digital' : 'Cash') : '—'}
            </p>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h3>
          <ul className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800">{item.menu_name}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {formatMoney(item.unit_price)}
                  </p>
                </div>
                <span className="font-semibold text-slate-800">{formatMoney(item.total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount</span>
              <span>− {formatMoney(order.discount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span className="text-orange-600">{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {order.payment_status !== 'paid' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Record Payment
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="success" onClick={() => { setMethod('cash'); setPayModal(true) }}>
              Mark Paid (Cash)
            </Button>
            <Button variant="dark" onClick={() => { setMethod('qr'); setPayModal(true) }}>
              Mark Paid (QR / Digital)
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={payModal}
        title="Record Payment"
        size="sm"
        onClose={() => setPayModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button variant="success" onClick={recordPayment} loading={saving}>
              Confirm Payment
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Mark order #{order.order_number} as paid{' '}
            <span className="font-semibold">{formatMoney(order.total)}</span> via{' '}
            <span className="font-semibold capitalize">
              {method === 'qr' ? 'QR / Digital' : 'Cash'}
            </span>
            ?
          </p>
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-1.5 font-medium text-slate-700">
              <input
                type="radio"
                name="payMethod"
                value="cash"
                checked={method === 'cash'}
                onChange={() => setMethod('cash')}
                className="accent-orange-500"
              />
              Cash
            </label>
            <label className="flex items-center gap-1.5 font-medium text-slate-700">
              <input
                type="radio"
                name="payMethod"
                value="qr"
                checked={method === 'qr'}
                onChange={() => setMethod('qr')}
                className="accent-orange-500"
              />
              QR / Digital
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}