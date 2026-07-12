/**
 * DataTable — generic table with columns config, loading skeleton, empty state, error state.
 * columns: [{ key, label, render?, className?, headerClassName? }]
 */
export function DataTable({ columns, data, loading, error, emptyMessage = 'No records found', emptyIcon = 'inbox' }) {
  if (loading) {
    return (
      <div className="table-container">
        <table className="w-full text-left">
          <thead>
            <tr className="table-head">
              {columns.map(col => (
                <th key={col.key} className={`table-th ${col.headerClassName || ''}`}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-outline-variant">
                {columns.map(col => (
                  <td key={col.key} className="table-td">
                    <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (error) {
    return (
      <div className="table-container">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="material-symbols-outlined text-error text-5xl">error_outline</span>
          <div className="text-center">
            <p className="text-on-surface font-medium">Failed to load data</p>
            <p className="text-on-surface-variant text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">{emptyIcon}</span>
          <div className="text-center">
            <p className="text-on-surface font-medium">{emptyMessage}</p>
            <p className="text-on-surface-variant text-sm mt-1">No records match your current filters.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="table-head">
            {columns.map(col => (
              <th key={col.key} className={`table-th ${col.headerClassName || ''}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="table-row">
              {columns.map(col => (
                <td key={col.key} className={`table-td ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
