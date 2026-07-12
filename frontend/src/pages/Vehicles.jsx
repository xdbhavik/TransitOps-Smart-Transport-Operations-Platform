import { useState } from 'react'
import { useVehicles } from '../hooks/useVehicles'
import { useAuth } from '../contexts/AuthContext'
import { createVehicle, updateVehicle, retireVehicle, uploadVehicleDocument } from '../api/vehicleService'
import { useToast } from '../contexts/ToastContext'
import { DataTable } from '../components/common/DataTable'
import { StatusBadge } from '../components/common/StatusBadge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal, ModalBody, ModalFooter } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { FormInput } from '../components/forms/FormInput'
import { FormSelect } from '../components/forms/FormSelect'

const VEHICLE_TYPES = ['Van', 'Truck', 'Bike', 'Car'].map(t => ({ value: t, label: t }))

const defaultForm = {
  registration_number: '',
  name: '',
  type: '',
  max_load_capacity: '',
  odometer: '',
  acquisition_cost: '',
}

export default function Vehicles() {
  const { vehicles, loading, error, refetch, setVehicles } = useVehicles()
  const { role } = useAuth()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [modalMode, setModalMode] = useState(null) // 'add' | 'edit' | 'view'
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [retireConfirm, setRetireConfirm] = useState(null)
  const [retireLoading, setRetireLoading] = useState(false)

  const [docLoading, setDocLoading] = useState(false)

  // Filtering
  const filtered = vehicles.filter(v => {
    // If driver, only show Available vehicles
    if (role === 'driver' && v.status !== 'Available') return false;
    
    const q = search.toLowerCase()
    const matchSearch = !q || v.registration_number?.toLowerCase().includes(q) || v.name?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || v.status === statusFilter
    const matchType = !typeFilter || v.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const openAdd = () => {
    setForm(defaultForm)
    setFormErrors({})
    setSelectedVehicle(null)
    setModalMode('add')
  }

  const openEdit = (vehicle) => {
    setForm({
      registration_number: vehicle.registration_number || '',
      name: vehicle.name || '',
      type: vehicle.type || '',
      max_load_capacity: vehicle.max_load_capacity || '',
      odometer: vehicle.odometer || '',
      acquisition_cost: vehicle.acquisition_cost || '',
      status: vehicle.status || '',
    })
    setFormErrors({})
    setSelectedVehicle(vehicle)
    setModalMode('edit')
  }

  const openView = (vehicle) => {
    setSelectedVehicle(vehicle)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedVehicle(null)
    setForm(defaultForm)
    setFormErrors({})
  }

  const validate = () => {
    const errors = {}
    if (!form.registration_number && modalMode === 'add') errors.registration_number = 'Required'
    if (!form.name) errors.name = 'Required'
    if (!form.type) errors.type = 'Required'
    if (!form.max_load_capacity || Number(form.max_load_capacity) <= 0) errors.max_load_capacity = 'Must be > 0'
    if (form.odometer === '' || Number(form.odometer) < 0) errors.odometer = 'Must be >= 0'
    if (!form.acquisition_cost || Number(form.acquisition_cost) <= 0) errors.acquisition_cost = 'Must be > 0'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try {
      if (modalMode === 'add') {
        const newV = await createVehicle({ ...form, status: 'Available' })
        setVehicles(prev => [newV, ...prev])
        toast.success('Vehicle added successfully!')
      } else {
        const updated = await updateVehicle(selectedVehicle.id, form)
        setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v))
        toast.success('Vehicle updated successfully!')
      }
      closeModal()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed'
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists')) {
        setFormErrors(prev => ({ ...prev, registration_number: 'Registration number already exists' }))
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetire = async () => {
    setRetireLoading(true)
    try {
      const updated = await retireVehicle(retireConfirm.id)
      setVehicles(prev => prev.map(v => v.id === retireConfirm.id ? { ...v, status: 'Retired' } : v))
      toast.success(`Vehicle ${retireConfirm.registration_number} retired.`)
      setRetireConfirm(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to retire vehicle')
    } finally {
      setRetireLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedVehicle) return
    setDocLoading(true)
    try {
      const updated = await uploadVehicleDocument(selectedVehicle.id, file)
      setSelectedVehicle(updated)
      setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v))
      toast.success('Document uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload document')
    } finally {
      setDocLoading(false)
      e.target.value = ''
    }
  }

  const editableStatuses = ['Available', 'Retired']

  let columns = [
    {
      key: 'registration_number',
      label: 'Reg. No.',
      render: (val) => <span className="font-bold text-primary font-mono text-xs">{val}</span>,
    },
    {
      key: 'name',
      label: 'Vehicle Name/Model',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    { key: 'type', label: 'Type' },
    {
      key: 'max_load_capacity',
      label: 'Max Load (kg)',
      headerClassName: 'text-right',
      className: 'text-right text-on-surface-variant font-mono text-xs',
      render: (val) => val ? Number(val).toLocaleString() : '--',
    },
    {
      key: 'odometer',
      label: 'Odometer (km)',
      headerClassName: 'text-right',
      className: 'text-right font-mono text-xs',
      render: (val) => val ? Number(val).toLocaleString() : '--',
    },
    {
      key: 'acquisition_cost',
      label: 'Acq. Cost',
      headerClassName: 'text-right',
      className: 'text-right text-on-surface-variant',
      render: (val) => val ? `$${Number(val).toLocaleString()}` : '--',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} className="btn-ghost text-xs" title="View">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
          </button>
          {role === 'fleet_manager' && (
            <>
              <button onClick={() => openEdit(row)} className="btn-ghost text-xs" title="Edit">
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              {row.status === 'Available' && (
                <button
                  onClick={() => setRetireConfirm(row)}
                  className="btn-ghost text-xs text-error hover:bg-error/5"
                  title="Retire"
                >
                  <span className="material-symbols-outlined text-[16px]">archive</span>
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ]

  // Filter columns for Financial Analyst
  if (role === 'financial_analyst') {
    columns = columns.filter(c => !['type', 'status'].includes(c.key))
  }

  return (
    <div>
      <PageHeader
        title="Vehicle Registry"
        subtitle="Manage and monitor your active fleet inventory."
        action={role === 'fleet_manager' ? { label: 'Add Vehicle', icon: 'add', onClick: openAdd, id: 'btn-add-vehicle' } : null}
      >
        {/* Filters */}
        <div className="flex items-center bg-surface-container rounded-md border border-outline-variant p-1 gap-1">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-transparent border-none text-sm text-on-surface py-1.5 pl-2 pr-6 focus:ring-0 cursor-pointer appearance-none outline-none"
          >
            <option value="">All Types</option>
            {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="w-px h-4 bg-outline-variant" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm text-on-surface py-1.5 pl-2 pr-6 focus:ring-0 cursor-pointer appearance-none outline-none"
          >
            <option value="">All Statuses</option>
            {['Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vehicles..."
            className="bg-surface-container border border-outline-variant rounded-md text-sm h-9 pl-8 pr-3 text-on-surface focus:ring-1 focus:ring-primary w-44 placeholder:text-on-surface-variant/50"
          />
        </div>
      </PageHeader>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        error={error}
        emptyMessage="No vehicles found"
        emptyIcon="local_shipping"
        pageSize={5}
      />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalMode === 'add' || modalMode === 'edit'} onClose={closeModal} title={modalMode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="reg-number"
                label="Registration Number"
                value={form.registration_number}
                onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))}
                placeholder="e.g. TRX-0092"
                required
                disabled={modalMode === 'edit'}
                error={formErrors.registration_number}
              />
              <FormInput
                id="vehicle-name"
                label="Vehicle Name/Model"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ford Transit 350"
                required
                error={formErrors.name}
              />
              <FormSelect
                id="vehicle-type"
                label="Type"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                options={VEHICLE_TYPES}
                required
                error={formErrors.type}
              />
              <FormInput
                id="max-load"
                label="Max Load Capacity (kg)"
                type="number"
                value={form.max_load_capacity}
                onChange={e => setForm(f => ({ ...f, max_load_capacity: e.target.value }))}
                placeholder="e.g. 5000"
                required
                min="1"
                error={formErrors.max_load_capacity}
              />
              <FormInput
                id="odometer"
                label="Odometer (km)"
                type="number"
                value={form.odometer}
                onChange={e => setForm(f => ({ ...f, odometer: e.target.value }))}
                placeholder="e.g. 25000"
                required
                min="0"
                error={formErrors.odometer}
              />
              <FormInput
                id="acq-cost"
                label="Acquisition Cost ($)"
                type="number"
                value={form.acquisition_cost}
                onChange={e => setForm(f => ({ ...f, acquisition_cost: e.target.value }))}
                placeholder="e.g. 45000"
                required
                min="1"
                error={formErrors.acquisition_cost}
              />
              {modalMode === 'edit' && (
                <FormSelect
                  id="vehicle-status"
                  label="Status"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  options={editableStatuses.map(s => ({ value: s, label: s }))}
                  hint="Only Available and Retired can be set manually"
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : modalMode === 'add' ? 'Add Vehicle' : 'Save Changes'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalMode === 'view'} onClose={closeModal} title="Vehicle Details" size="sm">
        <ModalBody>
          {selectedVehicle && (
            <div className="space-y-3">
              {[
                ['Registration No.', selectedVehicle.registration_number],
                ['Name/Model', selectedVehicle.name],
                ['Type', selectedVehicle.type],
                ['Max Load (kg)', selectedVehicle.max_load_capacity],
                ['Odometer (km)', selectedVehicle.odometer],
                ['Acquisition Cost', selectedVehicle.acquisition_cost ? `$${Number(selectedVehicle.acquisition_cost).toLocaleString()}` : '--'],
                ['Status', null],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0">
                  <span className="text-sm text-on-surface-variant">{label}</span>
                  {label === 'Status'
                    ? <StatusBadge status={selectedVehicle.status} />
                    : <span className="text-sm font-medium text-on-surface">{val ?? '--'}</span>
                  }
                </div>
              ))}
              
              <div className="pt-4 mt-4 border-t border-outline-variant/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-on-surface">Documents</span>
                  {role === 'fleet_manager' && (
                    <label className={`btn-secondary text-xs py-1 px-2 cursor-pointer ${docLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {docLoading ? 'sync' : 'upload'}
                      </span>
                      {docLoading ? 'Uploading...' : 'Upload'}
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.png" />
                    </label>
                  )}
                </div>
                {(!selectedVehicle.documents || selectedVehicle.documents.length === 0) ? (
                  <p className="text-xs text-on-surface-variant italic">No documents attached.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedVehicle.documents.map(doc => (
                      <li key={doc.id} className="flex justify-between items-center bg-surface-container rounded px-2 py-1.5 border border-outline-variant">
                        <div className="flex items-center gap-2 truncate">
                          <span className="material-symbols-outlined text-secondary-fixed text-[16px]">description</span>
                          <span className="text-xs text-on-surface truncate">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant flex-shrink-0">{doc.upload_date}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button onClick={closeModal} className="btn-secondary">Close</button>
        </ModalFooter>
      </Modal>

      {/* Retire Confirm */}
      <ConfirmDialog
        isOpen={!!retireConfirm}
        onClose={() => setRetireConfirm(null)}
        onConfirm={handleRetire}
        title="Retire Vehicle"
        message={`Are you sure you want to retire ${retireConfirm?.registration_number}? This action cannot be undone — the vehicle will no longer be available for dispatch.`}
        confirmLabel="Retire Vehicle"
        loading={retireLoading}
      />
    </div>
  )
}
