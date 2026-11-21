import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAvailableMenus } from '../api/menus'
import { createOrder } from '../api/orders'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Input from '../components/Input'
import Spinner from '../components/Spinner'
import { formatMoney } from '../utils/format'

const CART_KEY = 'ff_cart'

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

export default function QuickOrderPage() {
  const [menus, setMenus] = useState([])
  const [cart, setCart] = useState(loadCart)
  const [orderType, setOrderType] = useState('dine_in')
  const [tableNumber, setTableNumber] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loadingMenus, setLoadingMenus] = useState(true)
  const [menusError, setMenusError] = useState('')
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  // Persist cart locally so a refresh does not lose the current order.
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    fetchAvailableMenus()
      .then(setMenus)
      .catch((err) => setMenusError(err.message))
      .finally(() => setLoadingMenus(false))
  }, [])

  const addItem = (menu) => {
    setFormError('')
    setCart((prev) => {
      const existing = prev.find((l) => l.menu_id === menu.id)
      if (existing) {
        return prev.map((l) =>
          l.menu_id === menu.id ? { ...l, quantity: l.quantity + 1 } : l
        )
      }
      return [...prev, { menu_id: menu.id, name: menu.name, price: Number(menu.price), quantity: 1 }]
    })
  }

  const changeQty = (menuId, delta) => {
    setCart((prev) =>
      prev
        .map((l) => (l.menu_id === menuId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    )
  }

  const removeItem = (menuId) => {
    setCart((prev) => prev.filter((l) => l.menu_id !== menuId))
  }

  const clearOrder = () => {
    setCart([])
    setDiscount(0)
    setTableNumber('')
    setFormError('')
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [cart]
  )

  const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), subtotal)
  const total = subtotal - safeDiscount

  const handleSendToKitchen = async () => {
    setFormError('')
    if (cart.length === 0) {
      setFormError('Please add at least one item to the order.')
      return
    }

    setSending(true)
    try {
      const payload = {
        order_type: orderType,
        table_number: orderType === 'dine_in' && tableNumber ? String(tableNumber) : null,
        discount: safeDiscount,
        items: cart.map((l) => ({ menu_id: l.menu_id, quantity: l.quantity })),
      }
      const result = await createOrder(payload)
      clearOrder()
      setConfirmation(result.message || `Order sent to kitchen.`)
      window.setTimeout(() => setConfirmation(''), 5000)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loadingMenus) return <Spinner label="Loading menu..." />
  if (menusError) return <ErrorState message={menusError} />

  return (
    <div className="space-y-5">
      {confirmation && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          ✅ {confirmation}
        </div>
      )}
      {formError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {formError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quick Order</h2>
          <p className="text-sm text-slate-500">Tap items to add them to the current order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Menu grid */}
        <div className="lg:col-span-3">
          {menus.length === 0 ? (
            <EmptyState
              title="No items available"
              message="Ask an admin to add menu items or mark items as available."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {menus.map((menu) => {
                const inCart = cart.find((l) => l.menu_id === menu.id)
                return (
                  <button
                    key={menu.id}
                    onClick={() => addItem(menu)}
                    className={`group relative flex flex-col items-center justify-between rounded-xl border-2 p-4 text-center shadow-sm transition-all active:scale-[0.98] ${
                      inCart
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      🍽️
                    </span>
                    <span className="mt-2 text-sm font-semibold text-slate-800">
                      {menu.name}
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      {formatMoney(menu.price)}
                    </span>
                    <span
                      className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white ${
                        inCart ? 'bg-orange-500' : 'bg-slate-800 group-hover:bg-orange-500'
                      }`}
                    >
                      {inCart ? `In order · ${inCart.quantity}` : '+ Add'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Current order panel */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">Current Order</h3>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <label className="flex items-center gap-1.5 font-medium text-slate-700">
                  <input
                    type="radio"
                    name="orderType"
                    value="dine_in"
                    checked={orderType === 'dine_in'}
                    onChange={() => setOrderType('dine_in')}
                    className="accent-orange-500"
                  />
                  Dine-in
                </label>
                <label className="flex items-center gap-1.5 font-medium text-slate-700">
                  <input
                    type="radio"
                    name="orderType"
                    value="takeaway"
                    checked={orderType === 'takeaway'}
                    onChange={() => setOrderType('takeaway')}
                    className="accent-orange-500"
                  />
                  Takeaway
                </label>
              </div>
              {orderType === 'dine_in' && (
                <div className="mt-3">
                  <Input
                    id="tableNumber"
                    label="Table number (optional)"
                    placeholder="e.g. 3"
                    type="text"
                    inputMode="numeric"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="px-4 py-3">
              {cart.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">
                  No items yet — tap a menu item to start.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {cart.map((line) => (
                    <li key={line.menu_id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{line.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatMoney(line.price)} × {line.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeQty(line.menu_id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          onClick={() => changeQty(line.menu_id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                          aria-label="Increase"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(line.menu_id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          aria-label="Remove"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="w-16 text-right text-sm font-semibold text-slate-800">
                        {formatMoney(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span>Discount</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max={subtotal}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <span className="text-xs text-slate-400">Rs.</span>
                  </div>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-orange-600">{formatMoney(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={clearOrder} disabled={cart.length === 0}>
                  Clear Order
                </Button>
                <Button
                  variant="success"
                  className="flex-[2]"
                  onClick={handleSendToKitchen}
                  loading={sending}
                  disabled={cart.length === 0}
                >
                  Send to Kitchen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}