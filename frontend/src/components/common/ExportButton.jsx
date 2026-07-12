/**
 * ExportButton — triggers CSV download of given data with headers.
 */
export function ExportButton({ data, filename = 'export', headers, label = 'Export CSV', className = '' }) {
  const handleCSVExport = () => {
    if (!data || data.length === 0) return

    const keys = headers ? headers.map(h => h.key) : Object.keys(data[0])
    const headerLabels = headers ? headers.map(h => h.label) : keys

    const csvRows = [
      headerLabels.join(','),
      ...data.map(row =>
        keys.map(key => {
          const val = row[key] ?? ''
          const str = String(val).replace(/"/g, '""')
          return str.includes(',') || str.includes('\n') ? `"${str}"` : str
        }).join(',')
      )
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleCSVExport}
      className={`btn-secondary ${className}`}
      disabled={!data || data.length === 0}
      title={data?.length === 0 ? 'No data to export' : 'Download CSV'}
    >
      <span className="material-symbols-outlined text-[18px]">download</span>
      {label}
    </button>
  )
}

export default ExportButton
