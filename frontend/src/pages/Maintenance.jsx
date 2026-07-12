import { useState } from 'react'
import { useMaintenance } from '../hooks/useMaintenance'
import { useVehicles } from '../hooks/useVehicles'
import { createMaintenance, closeMaintenance, getUpcomingMaintenance } from '../api/maintenanceService'
import { useToast } from '../contexts/ToastContext'
import { DataTable } from '../components/common/DataTable'
import { StatusBadge } from '../components/common/StatusBadge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal, ModalBody, ModalFooter } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { FormSelect } from '../components/forms/FormSelect'
import { FormInput } from '../components/forms/FormInput'
import { FormTextarea } from '../components/forms/FormTextarea'

export default function Maintenance() {
  const { records, loading, error, refetch, setRecords } = useMaintenance()
  const { vehicles } = useVehicles()
  const toast = useToast()

  const [vehicleFilter, setVehicleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalMode, setModalMode] = useState(null) // 'add' | 'view'
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [form, setForm] = useState({ vehicle_id: '', type_of_work: '', notes: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [closeConfirm, setCloseConfirm] = useState(null)
  const [closeLoading, setCloseLoading] = useState(false)
  const [upcomingRecords, setUpcomingRecords] = useState([])
  const [upcomingLoading, setUpcomingLoading] = useState(false)

  // Exclude Retired vehicles from dropdown
  const eligibleVehicles = vehicles.filter(v => v.status !== 'Retired')
  const vehicleOptions = eligibleVehicles.map(v => ({
    value: v.id,
    label: `${v.registration_number} — ${v.name} (${v.status})`
  }))

  const filtered = records.filter(r => {
    const matchVehicle = !vehicleFilter || String(r.vehicle_id) === vehicleFilter || String(r.vehicle?.id) === vehicleFilter
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchVehicle && matchStatus
  })

  const openAdd = () => {
    setForm({ vehicle_id: '', type_of_work: '', notes: '' })
    setFormErrors({})
    setModalMode('add')
  }
  const openView = (record) => { setSelectedRecord(record); setModalMode('view') }
  const closeModal = () => { setModalMode(null); setSelectedRecord(null); setFormErrors({}) }

  const validate = () => {
    const errors = {}
    if (!form.vehicle_id) errors.vehicle_id = 'Required'
    if (!form.type_of_work) errors.type_of_work = 'Required'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const newRecord = await createMaintenance({ ...form, date_created: today })
      setRecords(prev => [newRecord, ...prev])
      toast.success('Maintenance record created. Vehicle is now In Shop.')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create maintenance record')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async () => {
    setCloseLoading(true)
    try {
      await closeMaintenance(closeConfirm.id)
      setRecords(prev => prev.map(r => r.id === closeConfirm.id ? { ...r, status: 'Closed' } : r))
      toast.success('Maintenance closed. Vehicle returned to Available.')
      setCloseConfirm(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close maintenance')
    } finally {
      setCloseLoading(false)
    }
  }

  const loadUpcomingMaintenance = async () => {
    setUpcomingLoading(true)
    try {
      const records = await getUpcomingMaintenance()
      setUpcomingRecords(records)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load upcoming maintenance')
    } finally {
      setUpcomingLoading(false)
    }
  }

  const uniqueVehicles = [...new Set(records.map(r => r.vehicle?.registration_number || r.vehicle_id).filter(Boolean))]

  const columns = [
    { key: 'id', label: 'Record ID', render: (val) => <span className="font-mono text-xs text-on-surface-variant">#{val}</span> },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (val, row) => (
        <div>
          <p className="font-medium text-primary text-sm">{val?.registration_number || '--'}</p>
          <p className="text-xs text-on-surface-variant">{val?.name || ''}</p>
        </div>
      ),
    },
    { key: 'type_of_work', label: 'Type of Work', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'date_created', label: 'Date Created' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'notes',
      label: 'Notes',
      render: (val) => <span className="text-on-surface-variant text-xs max-w-xs truncate block">{val || '—'}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} className="btn-ghost text-xs" title="View">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          {row.status === 'Open' && (
            <button
              onClick={() => setCloseConfirm(row)}
              className="btn-ghost text-xs text-tertiary hover:bg-tertiary/5"
              title="Close Maintenance"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Track vehicle maintenance records and shop status."
        action={{ label: 'Add Record', icon: 'add', onClick: openAdd, id: 'btn-add-maintenance' }}
      >
        <button onClick={loadUpcomingMaintenance} className="btn-secondary py-2" disabled={upcomingLoading}>
          <span className="material-symbols-outlined text-[18px]">schedule</span>
          {upcomingLoading ? 'Loading...' : 'Upcoming Maintenance'}
        </button>
        <select
          value={vehicleFilter}
          onChange={e => setVehicleFilter(e.target.value)}
          className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary"
        >
          <option value="">All Vehicles</option>
          {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </PageHeader>

      <DataTable columns={columns} data={filtered} loading={loading} error={error} emptyMessage="No maintenance records" emptyIcon="build" pageSize={5} />

      {upcomingRecords.length > 0 && (
        <div className="mt-6 card overflow-hidden">
          <div className="table-head p-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Upcoming Maintenance</p>
            <span className="text-xs text-on-surface-variant">Loaded from backend</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="table-head">
                <th className="table-th">Vehicle</th>
                <th className="table-th">Type</th>
                <th className="table-th">Date</th>
                <th className="table-th text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {upcomingRecords.map((record) => (
                <tr key={record.id} className="table-row">
                  <td className="table-td font-medium">{record.vehicle?.registration_number || record.vehicle_id || '--'}</td>
                  <td className="table-td">{record.type_of_work}</td>
                  <td className="table-td">{record.date_created}</td>
                  <td className="table-td text-right"><StatusBadge status={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modalMode === 'add'} onClose={closeModal} title="Add Maintenance Record" size="md">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <FormSelect
                id="maint-vehicle"
                label="Vehicle"
                value={form.vehicle_id}
                onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                options={vehicleOptions}
                required
                error={formErrors.vehicle_id}
              />
              <FormInput
                id="type-of-work"
                label="Type of Work"
                value={form.type_of_work}
                onChange={e => setForm(f => ({ ...f, type_of_work: e.target.value }))}
                placeholder="e.g. Oil Change, Tyre Replacement"
                required
                error={formErrors.type_of_work}
              />
              <FormTextarea
                id="maint-notes"
                label="Notes (optional)"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Additional details..."
                rows={3}
              />
              <div className="p-3 bg-surface-container-highest rounded-md border border-outline-variant">
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary-fixed text-[16px]">info</span>
                  Date created will be set to today automatically. Creating this record will change the vehicle's status to <strong className="text-secondary-fixed">In Shop</strong>.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Record'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalMode === 'view'} onClose={closeModal} title="Maintenance Record" size="sm">
        <ModalBody>
          {selectedRecord && (
            <div className="space-y-3">
              {[
                ['Record ID', `#${selectedRecord.id}`],
                ['Vehicle', selectedRecord.vehicle?.registration_number],
                ['Type of Work', selectedRecord.type_of_work],
                ['Date Created', selectedRecord.date_created],
                ['Notes', selectedRecord.notes || '—'],
                ['Status', null],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-outline-variant/50 last:border-0">
                  <span className="text-sm text-on-surface-variant">{label}</span>
                  {label === 'Status' ? <StatusBadge status={selectedRecord.status} /> : <span className="text-sm font-medium text-on-surface text-right max-w-[60%]">{val ?? '--'}</span>}
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter><button onClick={closeModal} className="btn-secondary">Close</button></ModalFooter>
      </Modal>

      {/* Close Confirm */}
      <ConfirmDialog
        isOpen={!!closeConfirm}
        onClose={() => setCloseConfirm(null)}
        onConfirm={handleClose}
        title="Close Maintenance Record"
        message="Are you sure you want to close this maintenance record? The vehicle will return to Available status."
        confirmLabel="Close Record"
        variant="warning"
        loading={closeLoading}
      />
    </div>
  )
}
