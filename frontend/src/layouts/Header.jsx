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

export function Header({ sidebarOpen, onToggleSidebar }) {
  const { user, role } = useAuth()
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || { title: 'TransitOps', icon: 'home' }

  const badgeClass = ROLE_BADGE_CLASSES[role] || 'bg-secondary/10 text-secondary border-secondary/20'

  return (
    <header className={`flex justify-between items-center h-16 px-6 border-b border-outline-variant bg-surface-container fixed top-0 right-0 transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-0'} z-40`}>
      {/* Page context */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="mr-1 w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container-high transition-colors"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{page.icon}</span>
        <h2 className="font-display font-bold text-on-surface tracking-tight">{page.title}</h2>
      </div>

      {/* Right side is kept blank to unify profile view in the sidebar */}
      <div className="flex items-center gap-3">
      </div>
    </header>
  )
}

export default Header
