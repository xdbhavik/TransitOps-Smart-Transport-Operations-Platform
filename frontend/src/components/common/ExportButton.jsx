import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * ExportButton — triggers CSV/PDF download of given data with headers.
 */
export function ExportButton({ data, filename = 'export', headers, label = 'Export', className = '' }) {
  const handleCSVExport = () => {
    const keys = headers?.length ? headers.map(h => h.key) : (data?.length ? Object.keys(data[0]) : [])
    const headerLabels = headers?.length ? headers.map(h => h.label) : keys

    if (!keys.length) return

    const csvRows = [
      headerLabels.join(','),
      ...(data || []).map(row =>
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

  const handlePDFExport = () => {
    const doc = new jsPDF()
    const keys = headers?.length ? headers.map(h => h.key) : (data?.length ? Object.keys(data[0]) : [])
    const headerLabels = headers?.length ? headers.map(h => h.label) : keys

    if (!keys.length) return

    const body = (data || []).map(row => keys.map(key => String(row[key] ?? '')))

    doc.setFontSize(16)
    doc.text(`TransitOps: ${label}`, 14, 15)
    doc.autoTable({
      head: [headerLabels],
      body: body,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [74, 97, 99] }, // Primary color
    })
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleCSVExport}
        className="btn-secondary"
        title={data?.length === 0 ? 'Download CSV with headers only' : 'Download CSV'}
      >
        <span className="material-symbols-outlined text-[18px]">table_chart</span>
        CSV
      </button>
      <button
        onClick={handlePDFExport}
        className="btn-secondary"
        title={data?.length === 0 ? 'Download PDF with headers only' : 'Download PDF'}
      >
        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
        PDF
      </button>
    </div>
  )
}

export default ExportButton
