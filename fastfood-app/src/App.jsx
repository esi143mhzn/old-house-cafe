import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import { useAuth } from './context/AuthContext'
import DashboardPage from './pages/Dashboard'
import KitchenPage from './pages/Kitchen'
import LoginPage from './pages/Login'
import MenuManagePage from './pages/MenuManage'
import OrderDetailPage from './pages/OrderDetail'
import OrdersPage from './pages/Orders'
import QuickOrderPage from './pages/QuickOrder'
import SalesPage from './pages/Sales'
import SettingsPage from './pages/Settings'
import UsersPage from './pages/Users'

function HomeRedirect() {
  const { user } = useAuth()
  return user?.role === 'staff' ? <Navigate to="/quick-order" replace /> : <DashboardPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Home resolves by role: admin -> dashboard, staff -> quick order */}
        <Route index element={<HomeRedirect />} />

        <Route path="/quick-order" element={<QuickOrderPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />

        {/* Admin-only routes */}
        <Route
          path="/dashboard"
          element={
            <RoleRoute roles={['admin']}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <RoleRoute roles={['admin']}>
              <MenuManagePage />
            </RoleRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <RoleRoute roles={['admin']}>
              <SalesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute roles={['admin']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleRoute roles={['admin']}>
              <SettingsPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}