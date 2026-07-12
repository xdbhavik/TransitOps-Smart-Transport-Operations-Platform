import { useState } from 'react'
import { useDrivers } from '../hooks/useDrivers'
import { createDriver, updateDriver, suspendDriver, unsuspendDriver } from '../api/driverService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DataTable } from '../components/common/DataTable'
import { StatusBadge } from '../components/common/StatusBadge'
import { PageHeader } from '../components/common/PageHeader'
import { Modal, ModalBody, ModalFooter } from '../components/common/Modal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { FormInput } from '../components/forms/FormInput'
import { FormSelect } from '../components/forms/FormSelect'
import { FormDatePicker } from '../components/forms/FormDatePicker'
import { RoleGuard } from '../components/common/RoleGuard'

const LICENSE_CATEGORIES = ['LMV', 'HMV', 'MCWG', 'Transport', 'Hazmat'].map(c => ({ value: c, label: c }))
const DRIVER_STATUSES = ['Available', 'Off Duty', 'Suspended'].map(s => ({ value: s, label: s }))

const defaultForm = {
  name: '',
  license_number: '',
  license_category: '',
  license_expiry: '',
  contact_number: '',
  safety_score: '',
  status: 'Available',
}

function getLicenseExpiryStatus(expiry) {
  if (!expiry) return 'normal'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiryDate = new Date(expiry)
  const daysUntil = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return 'expired'
  if (daysUntil <= 30) return 'expiring'
  return 'normal'
}

function SafetyScoreBadge({ score }) {
  const s = Number(score)
  const cls = s >= 80 ? 'text-tertiary' : s >= 50 ? 'text-secondary-fixed' : 'text-error'
  return <span className={`font-mono font-bold ${cls}`}>{score ?? '--'}</span>
}

export default function Drivers() {
  const { role } = useAuth()
  const { drivers, loading, error, refetch, setDrivers } = useDrivers()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name?.toLowerCase().includes(q) || d.license_number?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const openAdd = () => {
    setForm(defaultForm)
    setFormErrors({})
    setSelectedDriver(null)
    setModalMode('add')
  }
  const openEdit = (driver) => {
    setForm({
      name: driver.name || '',
      license_number: driver.license_number || '',
      license_category: driver.license_category || '',
      license_expiry: driver.license_expiry || '',
      contact_number: driver.contact_number || '',
      safety_score: driver.safety_score ?? '',
      status: driver.status || 'Available',
    })
    setFormErrors({})
    setSelectedDriver(driver)
    setModalMode('edit')
  }
  const openView = (driver) => { setSelectedDriver(driver); setModalMode('view') }
  const closeModal = () => { setModalMode(null); setSelectedDriver(null); setForm(defaultForm); setFormErrors({}) }

  const validate = () => {
    const errors = {}
    if (!form.name) errors.name = 'Required'
    if (!form.license_number) errors.license_number = 'Required'
    if (!form.license_category) errors.license_category = 'Required'
    if (!form.license_expiry) errors.license_expiry = 'Required'
    if (!form.contact_number) errors.contact_number = 'Required'
    if (form.safety_score === '' || Number(form.safety_score) < 0 || Number(form.safety_score) > 100) {
      errors.safety_score = 'Must be 0–100'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try {
      if (modalMode === 'add') {
        const newD = await createDriver(form)
        setDrivers(prev => [newD, ...prev])
        toast.success('Driver added successfully!')
      } else {
        const updated = await updateDriver(selectedDriver.id, form)
        setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d))
        toast.success('Driver updated successfully!')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuspendToggle = async () => {
    setActionLoading(true)
    try {
      const isSuspended = confirmAction.driver.status === 'Suspended'
      const updated = isSuspended
        ? await unsuspendDriver(confirmAction.driver.id)
        : await suspendDriver(confirmAction.driver.id)
      setDrivers(prev => prev.map(d => d.id === confirmAction.driver.id ? { ...d, status: isSuspended ? 'Available' : 'Suspended' } : d))
      toast.success(`Driver ${isSuspended ? 'unsuspended' : 'suspended'} successfully.`)
      setConfirmAction(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    { key: 'license_number', label: 'License No.', render: (val) => <span className="font-mono text-xs">{val}</span> },
    { key: 'license_category', label: 'Category' },
    {
      key: 'license_expiry',
      label: 'License Expiry',
      render: (val) => {
        const expiryStatus = getLicenseExpiryStatus(val)
        return (
          <div className="flex items-center gap-1.5">
            <span className={expiryStatus === 'expired' ? 'text-error font-medium' : expiryStatus === 'expiring' ? 'text-secondary-fixed font-medium' : ''}>
              {val || '--'}
            </span>
            {expiryStatus === 'expired' && <span className="badge-cancelled text-[10px] py-0.5">Expired</span>}
            {expiryStatus === 'expiring' && <span className="badge-in-shop text-[10px] py-0.5">Expiring Soon</span>}
          </div>
        )
      },
    },
    { key: 'contact_number', label: 'Contact No.' },
    {
      key: 'safety_score',
      label: 'Safety Score',
      render: (val) => <SafetyScoreBadge score={val} />,
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
          <RoleGuard allowedRoles={['safety_officer']}>
            <button onClick={() => openEdit(row)} className="btn-ghost text-xs" title="Edit">
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
            <button
              onClick={() => setConfirmAction({ driver: row, action: row.status === 'Suspended' ? 'unsuspend' : 'suspend' })}
              className={`btn-ghost text-xs ${row.status === 'Suspended' ? 'text-tertiary' : 'text-error hover:bg-error/5'}`}
              title={row.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {row.status === 'Suspended' ? 'lock_open' : 'block'}
              </span>
            </button>
          </RoleGuard>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Driver Management"
        subtitle="Manage driver profiles, licenses, and operational statuses."
        action={role === 'safety_officer' ? { label: 'Add Driver', icon: 'person_add', onClick: openAdd, id: 'btn-add-driver' } : null}
      >
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            {['Available', 'On Trip', 'Off Duty', 'Suspended'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drivers..."
              className="bg-surface-container border border-outline-variant rounded-md text-sm h-9 pl-8 pr-3 text-on-surface focus:ring-1 focus:ring-primary w-44 placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </PageHeader>

      <DataTable columns={columns} data={filtered} loading={loading} error={error} emptyMessage="No drivers found" emptyIcon="badge" />

      {/* Add/Edit Modal */}
      <Modal isOpen={modalMode === 'add' || modalMode === 'edit'} onClose={closeModal} title={modalMode === 'add' ? 'Add Driver Profile' : 'Edit Driver'}>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput id="driver-name" label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" required error={formErrors.name} />
              <FormInput id="contact-no" label="Contact Number" value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} placeholder="+1 555 0000" required error={formErrors.contact_number} />
              <FormInput id="license-no" label="License Number" value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value.toUpperCase() }))} placeholder="DL-XXXX" required error={formErrors.license_number} />
              <FormSelect id="license-cat" label="License Category" value={form.license_category} onChange={e => setForm(f => ({ ...f, license_category: e.target.value }))} options={LICENSE_CATEGORIES} required error={formErrors.license_category} />
              <FormDatePicker id="license-expiry" label="License Expiry Date" value={form.license_expiry} onChange={e => setForm(f => ({ ...f, license_expiry: e.target.value }))} required error={formErrors.license_expiry} className="md:col-span-2" />
              <FormInput id="safety-score" label="Safety Score (0–100)" type="number" value={form.safety_score} onChange={e => setForm(f => ({ ...f, safety_score: e.target.value }))} placeholder="e.g. 85" required min="0" max="100" error={formErrors.safety_score} />
              {modalMode === 'edit' && (
                <FormSelect id="driver-status" label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={DRIVER_STATUSES} />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : modalMode === 'add' ? 'Register Driver' : 'Save Changes'}
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={modalMode === 'view'} onClose={closeModal} title="Driver Details" size="sm">
        <ModalBody>
          {selectedDriver && (
            <div className="space-y-3">
              {[
                ['Name', selectedDriver.name],
                ['License No.', selectedDriver.license_number],
                ['Category', selectedDriver.license_category],
                ['License Expiry', selectedDriver.license_expiry],
                ['Contact', selectedDriver.contact_number],
                ['Safety Score', null],
                ['Status', null],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/50 last:border-0">
                  <span className="text-sm text-on-surface-variant">{label}</span>
                  {label === 'Safety Score' ? <SafetyScoreBadge score={selectedDriver.safety_score} />
                    : label === 'Status' ? <StatusBadge status={selectedDriver.status} />
                    : <span className="text-sm font-medium text-on-surface">{val ?? '--'}</span>}
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter><button onClick={closeModal} className="btn-secondary">Close</button></ModalFooter>
      </Modal>

      {/* Suspend Confirm */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleSuspendToggle}
        title={confirmAction?.action === 'suspend' ? 'Suspend Driver' : 'Unsuspend Driver'}
        message={`Are you sure you want to ${confirmAction?.action} ${confirmAction?.driver?.name}?`}
        confirmLabel={confirmAction?.action === 'suspend' ? 'Suspend' : 'Unsuspend'}
        loading={actionLoading}
        variant={confirmAction?.action === 'suspend' ? 'danger' : 'warning'}
      />
    </div>
  )
}
