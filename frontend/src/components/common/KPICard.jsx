/**
 * KPICard — dashboard stat card with optional accent color on left border.
 * accent: 'primary' | 'tertiary' | 'error' | 'secondary' | null
 */
export function KPICard({ label, value, accent, icon, trend, trendLabel, loading = false }) {
  const accentClasses = {
    primary: 'border-l-4 border-l-primary',
    tertiary: 'border-l-4 border-l-tertiary',
    error: 'border-l-4 border-l-error',
    secondary: 'border-l-4 border-l-secondary',
    'secondary-fixed': 'border-l-4 border-l-secondary-fixed',
  }

  const valueColors = {
    primary: 'text-primary',
    tertiary: 'text-on-surface',
    error: 'text-on-surface',
    secondary: 'text-on-surface',
    'secondary-fixed': 'text-on-surface',
  }

  const trendColors = {
    up: 'text-tertiary',
    down: 'text-error',
    neutral: 'text-on-surface-variant',
  }

  if (loading) {
    return (
      <div className={`kpi-card ${accent ? accentClasses[accent] : ''}`}>
        <div className="skeleton h-3 w-24 rounded mb-2" />
        <div className="skeleton h-8 w-16 rounded" />
      </div>
    )
  }

  return (
    <div className={`kpi-card ${accent ? accentClasses[accent] : ''} group hover:bg-surface-container-high transition-colors`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">{label}</span>
        {icon && (
          <span className={`material-symbols-outlined text-[20px] ${accent ? `text-${accent}` : 'text-on-surface-variant'}`}>
            {icon}
          </span>
        )}
      </div>
      <span className={`text-3xl font-display font-black ${accent ? valueColors[accent] || 'text-on-surface' : 'text-on-surface'}`}>
        {value}
      </span>
      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center gap-1 mt-1">
          {trend !== undefined && (
            <span className={`material-symbols-outlined text-[14px] ${trendColors[trend]}`}>
              {trend === 'up' ? 'arrow_upward' : trend === 'down' ? 'arrow_downward' : 'horizontal_rule'}
            </span>
          )}
          {trendLabel && (
            <span className={`text-xs ${trend ? trendColors[trend] : 'text-on-surface-variant'}`}>{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default KPICard
