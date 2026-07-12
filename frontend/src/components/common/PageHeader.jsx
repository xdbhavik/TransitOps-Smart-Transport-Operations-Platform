/**
 * PageHeader — consistent page title + subtitle + optional primary action button.
 */
export function PageHeader({ title, subtitle, action, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-on-surface">{title}</h2>
        {subtitle && (
          <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {children}
        {action && (
          <button
            onClick={action.onClick}
            className="btn-primary"
            id={action.id}
          >
            {action.icon && (
              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
            )}
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default PageHeader
