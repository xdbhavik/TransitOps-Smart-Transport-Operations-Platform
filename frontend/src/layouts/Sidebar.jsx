import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const ROLE_NAV = {
  fleet_manager: [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/vehicles', label: 'Vehicle Registry', icon: 'local_shipping' },
    { path: '/drivers', label: 'Driver Management', icon: 'badge' },
    { path: '/maintenance', label: 'Maintenance', icon: 'build' },
    { path: '/reports', label: 'Reports & Analytics', icon: 'analytics' },
  ],
  driver: [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/vehicles', label: 'Vehicle Registry', icon: 'local_shipping' },
    { path: '/trips', label: 'Trip Dispatcher', icon: 'route' },
  ],
  safety_officer: [
    { path: '/drivers', label: 'Drivers & Safety', icon: 'badge' },
    { path: '/trips', label: 'Live Trip Board', icon: 'route' },
  ],
  financial_analyst: [
    { path: '/vehicles', label: 'Asset Values', icon: 'local_shipping' },
    { path: '/fuel', label: 'Fuel Management', icon: 'local_gas_station' },
    { path: '/expenses', label: 'Expense Management', icon: 'receipt_long' },
    { path: '/reports', label: 'Reports & Analytics', icon: 'analytics' },
  ],
}

export function Sidebar() {
  const { role, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const navItems = ROLE_NAV[role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex flex-col h-screen fixed left-0 top-0 w-64 border-r border-outline-variant bg-surface-container-lowest z-50">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-outline-variant/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-black text-base tracking-tighter text-on-surface">TransitOps</h1>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-wider font-medium">Precision Logistics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item text-sm ${isActive ? 'active' : ''}`
            }
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "inherit" }}
            >
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User + Logout Footer */}
      <div className="border-t border-outline-variant/50 px-3 py-4 space-y-1">
        {user && (
          <div className="px-3 py-2 rounded-md flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-on-surface truncate">{user.name || user.email || 'User'}</p>
              <p className="text-xs text-on-surface-variant truncate">{user.roleLabel}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container-high transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item w-full text-sm text-error hover:text-error hover:bg-error/5"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  )
}

export default Sidebar
