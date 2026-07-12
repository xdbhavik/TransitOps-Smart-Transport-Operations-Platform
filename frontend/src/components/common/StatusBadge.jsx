/**
 * StatusBadge — color-coded badge for vehicle, driver, trip, and maintenance statuses.
 * Design: bg-{color}/10 text-{color} border border-{color}/20 with dot indicator
 */
export function StatusBadge({ status }) {
  const statusConfig = {
    // Vehicle statuses
    Available: { class: 'badge-available', label: 'Available', dot: true },
    'On Trip': { class: 'badge-on-trip', label: 'On Trip', dot: true },
    'In Shop': { class: 'badge-in-shop', label: 'In Shop', dot: true },
    Retired: { class: 'badge-retired', label: 'Retired', dot: false },
    // Driver statuses
    'Off Duty': { class: 'badge-off-duty', label: 'Off Duty', dot: false },
    Suspended: { class: 'badge-suspended', label: 'Suspended', dot: false },
    // Trip statuses
    Draft: { class: 'badge-draft', label: 'Draft', dot: false },
    Dispatched: { class: 'badge-dispatched', label: 'Dispatched', dot: true },
    Completed: { class: 'badge-completed', label: 'Completed', dot: false },
    Cancelled: { class: 'badge-cancelled', label: 'Cancelled', dot: false },
    // Maintenance statuses
    Open: { class: 'badge-open', label: 'Open', dot: true },
    Closed: { class: 'badge-closed', label: 'Closed', dot: false },
  }

  const config = statusConfig[status] || { class: 'badge bg-secondary/10 text-secondary border border-secondary/20', label: status, dot: false }

  return (
    <span className={config.class}>
      {config.dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {config.label}
    </span>
  )
}

export default StatusBadge
