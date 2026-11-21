import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchSalesReport } from '../api/reports'
import Button from '../components/Button'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import Select from '../components/Select'
import Spinner from '../components/Spinner'
import { formatMoney, todayDateString } from '../utils/format'

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
]

function SummaryCard({ label, value, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

export default function SalesPage() {
  const [period, setPeriod] = useState('today')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => {
    if (period === 'custom') {
      return { period: 'custom', date_from: dateFrom || todayDateString(), date_to: dateTo || todayDateString() }
    }
    return { period }
  }, [period, dateFrom, dateTo])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fetchSalesReport(params))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Sales Report</h2>
        <p className="text-sm text-slate-500">Track sales performance</p>
      </div>

      {/* Period selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Select
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
          {period === 'custom' && (
            <>
              <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </>
          )}
          <div className="flex items-end">
            <Button variant="secondary" onClick={load} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner label="Calculating..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard label="Total Sales" value={formatMoney(data.total_sales)} accent="text-emerald-600" />
            <SummaryCard label="Total Orders" value={data.total_orders} />
            <SummaryCard label="Cash Sales" value={formatMoney(data.cash_sales)} />
            <SummaryCard label="QR / Digital Sales" value={formatMoney(data.qr_sales)} />
            <SummaryCard label="Items Sold" value={data.items_sold} accent="text-orange-600" />
            <SummaryCard label="Avg Order Value" value={formatMoney(data.average_order_value)} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Sales by Menu Item</h3>
              <p className="text-xs text-slate-500">
                {data.date_from} → {data.date_to}
              </p>
            </div>
            {data.sales_by_item.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No sales in this period.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.sales_by_item.map((item) => (
                  <li key={item.menu_id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-slate-800">{item.menu_name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity_sold} sold
                      </p>
                    </div>
                    <span className="font-semibold text-orange-600">{formatMoney(item.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}