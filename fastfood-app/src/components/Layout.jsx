import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

const NAV = {
  admin: [
    { to: '/', label: 'Dashboard', icon: '📊', end: true },
    { to: '/quick-order', label: 'Quick Order', icon: '⚡' },
    { to: '/orders', label: 'Orders', icon: '🧾' },
    { to: '/kitchen', label: 'Kitchen', icon: '🍳' },
    { to: '/menu', label: 'Menu', icon: '🍔' },
    { to: '/sales', label: 'Sales', icon: '💰' },
    { to: '/users', label: 'Users', icon: '👥' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ],
  staff: [
    { to: '/quick-order', label: 'Quick Order', icon: '⚡' },
    { to: '/orders', label: 'Orders', icon: '🧾' },
    { to: '/kitchen', label: 'Kitchen', icon: '🍳' },
  ],
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = user ? NAV[user.role] || NAV.staff : []

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-orange-500 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-2xl" aria-hidden="true">
          🍟
        </span>
        <div>
          <h1 className="text-base font-bold text-white">FastFood POS</h1>
          <p className="text-xs text-slate-400">Order & Kitchen Manager</p>
        </div>
      </div>

      {navLinks}

      <div className="border-t border-slate-700 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs capitalize text-slate-400">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full text-slate-300" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 md:block">{sidebarContent}</aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-y-0 left-0 w-60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            className="rounded-lg p-2 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-bold text-slate-800">FastFood POS</h2>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}