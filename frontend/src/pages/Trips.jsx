import { useState, useEffect } from 'react'
import { useTrips } from '../hooks/useTrips'
import { createTrip, dispatchTrip, completeTrip, cancelTrip, updateTrip } from '../api/tripService'
import { getAvailableVehicles, getVehicle } from '../api/vehicleService'
import { getAvailableDrivers } from '../api/driverService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DataTable } from '../components/common/DataTable'
import { StatusBadge } from '../components/common/StatusBadge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal, ModalBody, ModalFooter } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { FormInput } from '../components/forms/FormInput'
import { FormSelect } from '../components/forms/FormSelect'

const defaultForm = {
  source: '',
  destination: '',
  vehicle_id: '',
  driver_id: '',
  cargo_weight: '',
  planned_distance: '',
}

export default function Trips() {
  const { role } = useAuth()
  const { trips, loading, error, refetch, setTrips } = useTrips()
  const toast = useToast()

  const [statusFilter, setStatusFilter] = useState('')
  const [modalMode, setModalMode] = useState(null) // 'create' | 'view' | 'complete'
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Available resources for dropdowns
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [selectedVehicleCapacity, setSelectedVehicleCapacity] = useState(null)

  // Complete trip form
  const [completeForm, setCompleteForm] = useState({ final_odometer: '', fuel_consumed: '' })
  const [completeErrors, setCompleteErrors] = useState({})

  const filtered = trips.filter(t => !statusFilter || t.status === statusFilter)

  const loadAvailableResources = async () => {
    try {
      const [vs, ds] = await Promise.all([getAvailableVehicles(), getAvailableDrivers()])
      setAvailableVehicles(Array.isArray(vs) ? vs : vs.results || vs.data || [])
      setAvailableDrivers(Array.isArray(ds) ? ds : ds.results || ds.data || [])
    } catch {
      // Silently fail — let empty dropdowns show
    }
  }

  const openCreate = async () => {
    setForm(defaultForm)
    setFormErrors({})
    setSelectedVehicleCapacity(null)
    setSelectedTrip(null)
    setModalMode('create')
    await loadAvailableResources()
  }

  const openView = (trip) => { setSelectedTrip(trip); setModalMode('view') }

  const openComplete = (trip) => {
    setSelectedTrip(trip)
    setCompleteForm({ final_odometer: '', fuel_consumed: '' })
    setCompleteErrors({})
    setModalMode('complete')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTrip(null)
    setForm(defaultForm)
    setFormErrors({})
  }

  // When vehicle is selected, fetch capacity for validation
  useEffect(() => {
    if (form.vehicle_id) {
      const v = availableVehicles.find(v => String(v.id) === String(form.vehicle_id))
      setSelectedVehicleCapacity(v?.max_load_capacity ?? null)
    } else {
      setSelectedVehicleCapacity(null)
    }
  }, [form.vehicle_id, availableVehicles])

  const validateCreate = () => {
    const errors = {}
    if (!form.source) errors.source = 'Required'
    if (!form.destination) errors.destination = 'Required'
    if (!form.vehicle_id) errors.vehicle_id = 'Required'
    if (!form.driver_id) errors.driver_id = 'Required'
    
    // Validations based on selected entities
    const selV = availableVehicles.find(v => String(v.id) === String(form.vehicle_id))
    if (selV && selV.status === 'On Trip') errors.vehicle_id = 'Vehicle is currently On Trip'
    
    const selD = availableDrivers.find(d => String(d.id) === String(form.driver_id))
    if (selD) {
      if (['On Trip', 'Suspended'].includes(selD.status)) errors.driver_id = `Driver is ${selD.status}`
      if (selD.license_expiry && new Date(selD.license_expiry) < new Date(new Date().setHours(0,0,0,0))) {
        errors.driver_id = 'Driver license is expired'
      }
    }

    if (!form.cargo_weight || Number(form.cargo_weight) <= 0) errors.cargo_weight = 'Must be > 0'
    if (selectedVehicleCapacity && Number(form.cargo_weight) > Number(selectedVehicleCapacity)) {
      errors.cargo_weight = `Cargo weight exceeds vehicle capacity of ${selectedVehicleCapacity} kg.`
    }
    if (!form.planned_distance || Number(form.planned_distance) <= 0) errors.planned_distance = 'Must be > 0'
    return errors
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errors = validateCreate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try {
      const newTrip = await createTrip(form)
      setTrips(prev => [newTrip, ...prev])
      toast.success('Trip created successfully!')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDispatch = async () => {
    setActionLoading(true)
    try {
      const updated = await dispatchTrip(confirmAction.trip.id)
      setTrips(prev => prev.map(t => t.id === confirmAction.trip.id ? { ...t, status: 'Dispatched' } : t))
      toast.success('Trip dispatched successfully!')
      setConfirmAction(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch trip')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await cancelTrip(confirmAction.trip.id)
      setTrips(prev => prev.map(t => t.id === confirmAction.trip.id ? { ...t, status: 'Cancelled' } : t))
      toast.success('Trip cancelled.')
      setConfirmAction(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel trip')
    } finally {
      setActionLoading(false)
    }
  }

  const validateComplete = () => {
    const errors = {}
    if (!completeForm.final_odometer || Number(completeForm.final_odometer) <= 0) errors.final_odometer = 'Required'
    if (!completeForm.fuel_consumed || Number(completeForm.fuel_consumed) <= 0) errors.fuel_consumed = 'Required'
    return errors
  }

  const handleComplete = async (e) => {
    e.preventDefault()
    const errors = validateComplete()
    if (Object.keys(errors).length > 0) { setCompleteErrors(errors); return }
    setSubmitting(true)
    try {
      await completeTrip(selectedTrip.id, completeForm)
      setTrips(prev => prev.map(t => t.id === selectedTrip.id ? { ...t, status: 'Completed' } : t))
      toast.success('Trip completed successfully!')
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete trip')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'id', label: 'Trip ID', render: (val) => <span className="font-mono text-xs text-on-surface-variant">#{val}</span> },
    { key: 'source', label: 'Source', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'destination', label: 'Destination' },
    { key: 'vehicle_name', label: 'Vehicle', render: (val, row) => val || row.vehicle?.name || '--' },
    { key: 'driver_name', label: 'Driver', render: (val, row) => val || row.driver?.name || '--' },
    {
      key: 'cargo_weight',
      label: 'Cargo (kg)',
      headerClassName: 'text-right',
      className: 'text-right font-mono text-xs',
    },
    {
      key: 'planned_distance',
      label: 'Distance (km)',
      headerClassName: 'text-right',
      className: 'text-right font-mono text-xs',
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {role === 'driver' && row.status === 'Draft' && (
            <>
              <button onClick={() => setConfirmAction({ trip: row, action: 'dispatch' })} className="btn-ghost text-xs text-primary" title="Dispatch">
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
              <button onClick={() => setConfirmAction({ trip: row, action: 'cancel' })} className="btn-ghost text-xs text-error" title="Cancel">
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            </>
          )}
          {role === 'driver' && row.status === 'Dispatched' && (
            <>
              <button onClick={() => openComplete(row)} className="btn-ghost text-xs text-tertiary" title="Complete">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
              </button>
              <button onClick={() => setConfirmAction({ trip: row, action: 'cancel' })} className="btn-ghost text-xs text-error" title="Cancel">
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            </>
          )}
          <button onClick={() => openView(row)} className="btn-ghost text-xs" title="View">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Trip Management"
        subtitle="Create and manage the full lifecycle of transport trips."
        action={role === 'driver' ? { label: 'Create Trip', icon: 'add', onClick: openCreate, id: 'btn-create-trip' } : null}
      >
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </PageHeader>

      <DataTable columns={columns} data={filtered} loading={loading} error={error} emptyMessage="No trips found" emptyIcon="route" />

      {/* Create Trip Modal */}
      <Modal isOpen={modalMode === 'create'} onClose={closeModal} title="Create New Trip">
        <form onSubmit={handleCreate}>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput id="trip-source" label="Source" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="e.g. Mumbai Warehouse" required error={formErrors.source} />
              <FormInput id="trip-dest" label="Destination" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. Delhi Hub" required error={formErrors.destination} />
              <FormSelect
                id="trip-vehicle"
                label="Vehicle (Available only)"
                value={form.vehicle_id}
                onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                options={availableVehicles.map(v => ({ value: v.id, label: `${v.registration_number} — ${v.name} (${v.max_load_capacity}kg)` }))}
                required
                error={formErrors.vehicle_id}
              />
              <FormSelect
                id="trip-driver"
                label="Driver (Available only)"
                value={form.driver_id}
                onChange={e => setForm(f => ({ ...f, driver_id: e.target.value }))}
                options={availableDrivers.map(d => ({ value: d.id, label: `${d.name} — ${d.license_number}` }))}
                required
                error={formErrors.driver_id}
              />
              <FormInput
                id="cargo-weight"
                label="Cargo Weight (kg)"
                type="number"
                value={form.cargo_weight}
                onChange={e => setForm(f => ({ ...f, cargo_weight: e.target.value }))}
                placeholder="e.g. 2500"
                required
                min="0.1"
                step="0.1"
                error={formErrors.cargo_weight}
                hint={selectedVehicleCapacity ? `Vehicle max: ${selectedVehicleCapacity} kg` : undefined}
              />
              <FormInput
                id="planned-dist"
                label="Planned Distance (km)"
                type="number"
                value={form.planned_distance}
                onChange={e => setForm(f => ({ ...f, planned_distance: e.target.value }))}
                placeholder="e.g. 450"
                required
                min="0.1"
                error={formErrors.planned_distance}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal isOpen={modalMode === 'complete'} onClose={closeModal} title="Complete Trip" size="sm">
        <form onSubmit={handleComplete}>
          <ModalBody>
            <p className="text-sm text-on-surface-variant mb-4">
              Enter the final readings to complete trip <span className="text-primary font-semibold">#{selectedTrip?.id}</span>.
            </p>
            <div className="space-y-4">
              <FormInput
                id="final-odometer"
                label="Final Odometer Reading (km)"
                type="number"
                value={completeForm.final_odometer}
                onChange={e => setCompleteForm(f => ({ ...f, final_odometer: e.target.value }))}
                placeholder="e.g. 50250"
                required
                min="0"
                error={completeErrors.final_odometer}
              />
              <FormInput
                id="fuel-consumed"
                label="Fuel Consumed (liters)"
                type="number"
                value={completeForm.fuel_consumed}
                onChange={e => setCompleteForm(f => ({ ...f, fuel_consumed: e.target.value }))}
                placeholder="e.g. 85.5"
                required
                min="0.1"
                step="0.1"
                error={completeErrors.fuel_consumed}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary bg-tertiary hover:opacity-90" disabled={submitting}>
              {submitting ? 'Completing...' : 'Complete Trip'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalMode === 'view'} onClose={closeModal} title="Trip Details" size="sm">
        <ModalBody>
          {selectedTrip && (
            <div className="space-y-3">
              {[
                ['Trip ID', `#${selectedTrip.id}`],
                ['Source', selectedTrip.source],
                ['Destination', selectedTrip.destination],
                ['Vehicle', selectedTrip.vehicle_name || selectedTrip.vehicle?.name],
                ['Driver', selectedTrip.driver_name || selectedTrip.driver?.name],
                ['Cargo Weight', selectedTrip.cargo_weight ? `${selectedTrip.cargo_weight} kg` : '--'],
                ['Planned Distance', selectedTrip.planned_distance ? `${selectedTrip.planned_distance} km` : '--'],
                ['Status', null],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0">
                  <span className="text-sm text-on-surface-variant">{label}</span>
                  {label === 'Status' ? <StatusBadge status={selectedTrip.status} /> : <span className="text-sm font-medium text-on-surface">{val ?? '--'}</span>}
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter><button onClick={closeModal} className="btn-secondary">Close</button></ModalFooter>
      </Modal>

      {/* Dispatch Confirm */}
      <ConfirmDialog
        isOpen={!!confirmAction && confirmAction.action === 'dispatch'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDispatch}
        title="Dispatch Trip"
        message={`Dispatch trip #${confirmAction?.trip?.id}? This will set the vehicle and driver to "On Trip" status.`}
        confirmLabel="Dispatch"
        variant="warning"
        loading={actionLoading}
      />

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={!!confirmAction && confirmAction.action === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleCancel}
        title="Cancel Trip"
        message={`Cancel trip #${confirmAction?.trip?.id}?${confirmAction?.trip?.status === 'Dispatched' ? ' This will also release the vehicle and driver back to Available.' : ''}`}
        confirmLabel="Cancel Trip"
        loading={actionLoading}
      />
    </div>
  )
}
