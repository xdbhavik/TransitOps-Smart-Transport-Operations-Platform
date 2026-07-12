import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Vehicles from '../pages/Vehicles'
import Drivers from '../pages/Drivers'
import Trips from '../pages/Trips'
import Maintenance from '../pages/Maintenance'
import Fuel from '../pages/Fuel'
import Expenses from '../pages/Expenses'
import Reports from '../pages/Reports'
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'

const ROLES = {
  FLEET_MANAGER: 'fleet_manager',
  DRIVER: 'driver',
  SAFETY_OFFICER: 'safety_officer',
  FINANCIAL_ANALYST: 'financial_analyst',
}

export function AppRoutes() {
  const { isAuthenticated, role } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : (
              <AuthLayout>
                <Login />
              </AuthLayout>
            )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dynamic Root Redirect based on Role */}
        <Route index element={
          role === ROLES.SAFETY_OFFICER ? <Navigate to="/drivers" replace /> :
          role === ROLES.FINANCIAL_ANALYST ? <Navigate to="/fuel" replace /> :
          <Navigate to="/dashboard" replace />
        } />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.DRIVER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="vehicles"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.FINANCIAL_ANALYST]}>
              <Vehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="drivers"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.SAFETY_OFFICER]}>
              <Drivers />
            </ProtectedRoute>
          }
        />

        <Route
          path="trips"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DRIVER, ROLES.SAFETY_OFFICER]}>
              <Trips />
            </ProtectedRoute>
          }
        />

        <Route
          path="maintenance"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER]}>
              <Maintenance />
            </ProtectedRoute>
          }
        />

        <Route
          path="fuel"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FINANCIAL_ANALYST]}>
              <Fuel />
            </ProtectedRoute>
          }
        />

        <Route
          path="expenses"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FINANCIAL_ANALYST]}>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
