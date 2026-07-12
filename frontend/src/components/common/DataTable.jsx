import { useState, useEffect } from 'react'

/**
 * DataTable — generic table with columns config, loading skeleton, empty state, error state, and optional pagination.
 * columns: [{ key, label, render?, className?, headerClassName? }]
 */
export function DataTable({ columns, data, loading, error, emptyMessage = 'No records found', emptyIcon = 'inbox', pageSize }) {
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to first page if the data size changes (e.g. due to search/filtering)
  useEffect(() => {
    setCurrentPage(1)
  }, [data?.length])

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

  // Pagination logic
  const totalRecords = data.length
  const usePagination = pageSize && totalRecords > pageSize
  const totalPages = usePagination ? Math.ceil(totalRecords / pageSize) : 1
  const activePage = Math.min(currentPage, totalPages)
  const paginatedData = usePagination 
    ? data.slice((activePage - 1) * pageSize, activePage * pageSize)
    : data

  const startRecord = (activePage - 1) * (pageSize || totalRecords) + 1
  const endRecord = Math.min(activePage * (pageSize || totalRecords), totalRecords)

  return (
    <div className="space-y-4">
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
            {paginatedData.map((row, rowIndex) => (
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

      {usePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2 bg-surface-container/30 rounded-lg border border-outline-variant/40">
          <span className="text-xs text-on-surface-variant">
            Showing <span className="font-semibold text-on-surface">{startRecord}</span> to{' '}
            <span className="font-semibold text-on-surface">{endRecord}</span> of{' '}
            <span className="font-semibold text-on-surface">{totalRecords}</span> entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={activePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1
              const isCurrent = pageNum === activePage
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 text-xs font-semibold rounded-md transition-colors ${
                    isCurrent
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant/60 hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={activePage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-outline-variant/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
