import { useAuth } from '../../contexts/AuthContext'

/**
 * RoleGuard — renders children only if the current user's role matches allowedRoles.
 * allowedRoles: string[] — e.g. ['fleet_manager', 'safety_officer']
 * fallback: ReactNode — optional fallback if not authorized (default: null)
 */
export function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { role } = useAuth()

  if (!role || !allowedRoles.includes(role)) {
    return fallback
  }

  return children
}

export default RoleGuard
