import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', icon: 'dashboard' },
  '/vehicles': { title: 'Vehicle Registry', icon: 'local_shipping' },
  '/drivers': { title: 'Driver Management', icon: 'badge' },
  '/trips': { title: 'Trip Management', icon: 'route' },
  '/maintenance': { title: 'Maintenance', icon: 'build' },
  '/fuel': { title: 'Fuel Management', icon: 'local_gas_station' },
  '/expenses': { title: 'Expense Management', icon: 'receipt_long' },
  '/reports': { title: 'Reports & Analytics', icon: 'analytics' },
}

const ROLE_BADGE_CLASSES = {
  fleet_manager: 'bg-primary/10 text-primary border-primary/20',
  driver: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  safety_officer: 'bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/20',
  financial_analyst: 'bg-error/10 text-error border-error/20',
}

export function Header() {
  const { user, role } = useAuth()
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || { title: 'TransitOps', icon: 'home' }

  const badgeClass = ROLE_BADGE_CLASSES[role] || 'bg-secondary/10 text-secondary border-secondary/20'

  return (
    <header className="flex justify-between items-center h-16 px-6 border-b border-outline-variant bg-surface-container fixed top-0 right-0 left-64 z-40">
      {/* Page context */}
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{page.icon}</span>
        <h2 className="font-display font-bold text-on-surface tracking-tight">{page.title}</h2>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-on-surface">
                {user.name || user.email || 'User'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${badgeClass}`}>
                {user.roleLabel}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
