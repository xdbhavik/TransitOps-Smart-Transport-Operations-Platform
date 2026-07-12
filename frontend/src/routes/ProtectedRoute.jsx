import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute — guards routes by authentication and role.
 * allowedRoles: string[] — if empty/undefined, any authenticated user can access.
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role not permitted → redirect to /unauthorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
