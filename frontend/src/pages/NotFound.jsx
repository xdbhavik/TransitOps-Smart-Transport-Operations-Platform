import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 gap-6">
      <div className="w-16 h-16 rounded-full bg-outline-variant flex items-center justify-center">
        <span className="material-symbols-outlined text-on-surface-variant text-3xl">search_off</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-on-surface mb-2">Page Not Found</h2>
        <p className="text-on-surface-variant text-sm">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Link to="/dashboard" className="btn-secondary">
        <span className="material-symbols-outlined text-[18px]">home</span>
        Go to Dashboard
      </Link>
    </div>
  )
}
