import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchOrders } from '../api/orders'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import Select from '../components/Select'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime, formatMoney, todayDateString } from '../utils/format'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters state initialized from URL params.
  const [filterPreset, setFilterPreset] = useState(searchParams.get('preset') || 'all')
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment_status') || '')

  const page = Number(searchParams.get('page') || 1)

  const buildParams = useCallback(() => {
    const params = {}
    if (filterPreset === 'today') {
      params.date = todayDateString()
    } else if (filterPreset === 'custom') {
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
    }
    if (status) params.status = status
    if (paymentStatus) params.payment_status = paymentStatus
    return params
  }, [filterPreset, dateFrom, dateTo, status, paymentStatus])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchOrders(buildParams(), page)
      setOrders(data.data)
      setMeta({ current_page: data.meta.current_page, last_page: data.meta.last_page })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [buildParams, page])

  useEffect(() => {
    load()
  }, [load])

  const updateFiltersAndReset = (next) => {
    const params = new URLSearchParams()
    if (next.preset) params.set('preset', next.preset)
    if (next.date_from) params.set('date_from', next.date_from)
    if (next.date_to) params.set('date_to', next.date_to)
    if (next.status) params.set('status', next.status)
    if (next.payment_status) params.set('payment_status', next.payment_status)
    setSearchParams(params)
  }

  const applyReset = () => {
    setFilterPreset('all')
    setDateFrom('')
    setDateTo('')
    setStatus('')
    setPaymentStatus('')
    updateFiltersAndReset({})
  }

  const goToPage = (nextPage) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    setSearchParams(params)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Orders</h2>
        <p className="text-sm text-slate-500">Search and manage all orders</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Select
            label="Period"
            value={filterPreset}
            onChange={(e) => {
              const v = e.target.value
              setFilterPreset(v)
              if (v === 'today') {
                updateFiltersAndReset({ preset: 'today', status, payment_status: paymentStatus })
              } else if (v === 'all') {
                updateFiltersAndReset({ date_from: dateFrom, date_to: dateTo, status, payment_status: paymentStatus })
              }
            }}
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="custom">Custom range</option>
          </Select>

          {filterPreset === 'custom' ? (
            <>
              <Input
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  updateFiltersAndReset({ preset: 'custom', date_from: e.target.value, date_to: dateTo, status, payment_status: paymentStatus })
                }}
              />
              <Input
                label="To"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  updateFiltersAndReset({ preset: 'custom', date_from: dateFrom, date_to: e.target.value, status, payment_status: paymentStatus })
                }}
              />
            </>
          ) : (
            <div className="hidden lg:block" />
          )}

          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              const v = e.target.value
              setStatus(v)
              updateFiltersAndReset({ preset: filterPreset, date_from: dateFrom, date_to: dateTo, status: v, payment_status: paymentStatus })
            }}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="preparing">Preparing</option>
            <option value="completed">Completed</option>
          </Select>

          <Select
            label="Payment"
            value={paymentStatus}
            onChange={(e) => {
              const v = e.target.value
              setPaymentStatus(v)
              updateFiltersAndReset({ preset: filterPreset, date_from: dateFrom, date_to: dateTo, status, payment_status: v })
            }}
          >
            <option value="">All payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </Select>

          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={applyReset}>
              Reset filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <Spinner label="Loading orders..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : orders.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No orders found" message="Try changing the filters." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Date / Time</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Staff</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        #{order.order_number}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge value={order.order_type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={order.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {formatMoney(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={order.payment_status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {order.payment_method ? (
                          <StatusBadge value={order.payment_method} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.staff?.name || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/orders/${order.id}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
                <span className="text-slate-500">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page <= 1}
                    onClick={() => goToPage(meta.current_page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => goToPage(meta.current_page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}