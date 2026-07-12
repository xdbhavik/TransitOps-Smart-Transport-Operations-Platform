import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 gap-6">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-error text-3xl">lock</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-on-surface mb-2">Access Denied</h2>
        <p className="text-on-surface-variant text-sm max-w-sm">
          You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
        </p>
      </div>
      <Link to="/dashboard" className="btn-primary">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Dashboard
      </Link>
    </div>
  )
}
