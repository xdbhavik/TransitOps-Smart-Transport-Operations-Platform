import { useState } from 'react'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { useVehicles } from '../hooks/useVehicles'
import { createFuelLog } from '../api/fuelService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DataTable } from '../components/common/DataTable'
import { PageHeader } from '../components/common/PageHeader'
import { Modal, ModalBody, ModalFooter } from '../components/common/Modal'
import { FormSelect } from '../components/forms/FormSelect'
import { FormInput } from '../components/forms/FormInput'
import { FormDatePicker } from '../components/forms/FormDatePicker'
import { RoleGuard } from '../components/common/RoleGuard'

export default function Fuel() {
  const { role } = useAuth()
  const { logs, loading, error, refetch, setLogs } = useFuelLogs()
  const { vehicles } = useVehicles()
  const toast = useToast()

  const today = new Date().toISOString().split('T')[0]
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ vehicle_id: '', date: today, liters: '', cost: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const nonRetiredVehicles = vehicles.filter(v => v.status !== 'Retired')
  const vehicleOptions = nonRetiredVehicles.map(v => ({ value: v.id, label: `${v.registration_number} — ${v.name}` }))

  const filtered = logs.filter(l => {
    const matchVehicle = !vehicleFilter || String(l.vehicle_id) === vehicleFilter || String(l.vehicle?.id) === vehicleFilter
    const matchFrom = !dateFrom || l.date >= dateFrom
    const matchTo = !dateTo || l.date <= dateTo
    return matchVehicle && matchFrom && matchTo
  })

  const validate = () => {
    const errors = {}
    if (!form.vehicle_id) errors.vehicle_id = 'Required'
    if (!form.date) errors.date = 'Required'
    if (form.date > today) errors.date = 'Date cannot be in the future'
    if (!form.liters || Number(form.liters) <= 0) errors.liters = 'Must be > 0'
    if (!form.cost || Number(form.cost) <= 0) errors.cost = 'Must be > 0'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try {
      const newLog = await createFuelLog(form)
      setLogs(prev => [newLog, ...prev])
      toast.success('Fuel log added successfully!')
      setModalOpen(false)
      setForm({ vehicle_id: '', date: today, liters: '', cost: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fuel log')
    } finally {
      setSubmitting(false)
    }
  }

  const uniqueVehicles = [...new Map(logs.map(l => [l.vehicle?.id || l.vehicle_id, l.vehicle?.registration_number || l.vehicle_id])).entries()]

  const columns = [
    { key: 'id', label: 'Log ID', render: (val) => <span className="font-mono text-xs text-on-surface-variant">#{val}</span> },
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
    { key: 'date', label: 'Date' },
    { key: 'liters', label: 'Liters', render: (val) => <span className="font-mono text-xs">{val ? `${Number(val).toFixed(1)}L` : '--'}</span> },
    {
      key: 'cost',
      label: 'Cost',
      render: (val) => <span className="font-mono text-xs font-semibold text-on-surface">{val ? `$${Number(val).toLocaleString()}` : '--'}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn-ghost text-xs" title="View" onClick={() => {}}>
          <span className="material-symbols-outlined text-[16px]">visibility</span>
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Fuel Management"
        subtitle="Track fuel consumption across your fleet."
        action={role === 'fleet_manager' ? { label: 'Log Fuel', icon: 'add', onClick: () => setModalOpen(true), id: 'btn-log-fuel' } : null}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary"
          >
            <option value="">All Vehicles</option>
            {uniqueVehicles.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input py-2 text-sm w-36" placeholder="From" />
            <span className="text-on-surface-variant text-sm">—</span>
            <input type="date" value={dateTo} max={today} onChange={e => setDateTo(e.target.value)} className="form-input py-2 text-sm w-36" placeholder="To" />
          </div>
        </div>
      </PageHeader>

      <DataTable columns={columns} data={filtered} loading={loading} error={error} emptyMessage="No fuel logs found" emptyIcon="local_gas_station" />

      {/* Log Fuel Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Fuel Record" size="sm">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <FormSelect
                id="fuel-vehicle"
                label="Vehicle"
                value={form.vehicle_id}
                onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))}
                options={vehicleOptions}
                required
                error={formErrors.vehicle_id}
              />
              <FormDatePicker
                id="fuel-date"
                label="Date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                max={today}
                required
                error={formErrors.date}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput id="fuel-liters" label="Liters" type="number" value={form.liters} onChange={e => setForm(f => ({ ...f, liters: e.target.value }))} placeholder="e.g. 45.5" required min="0.1" step="0.1" error={formErrors.liters} />
                <FormInput id="fuel-cost" label="Cost ($)" type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="e.g. 89.50" required min="0.01" step="0.01" error={formErrors.cost} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Log Fuel'}</button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
