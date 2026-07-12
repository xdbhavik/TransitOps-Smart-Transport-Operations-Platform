import { useState } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { useVehicles } from '../hooks/useVehicles'
import { createExpense } from '../api/expenseService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DataTable } from '../components/common/DataTable'
import { PageHeader } from '../components/common/PageHeader'
import { Modal, ModalBody, ModalFooter } from '../components/common/Modal'
import { FormSelect } from '../components/forms/FormSelect'
import { FormInput } from '../components/forms/FormInput'
import { FormDatePicker } from '../components/forms/FormDatePicker'
import { FormTextarea } from '../components/forms/FormTextarea'

const EXPENSE_TYPES = ['Toll', 'Maintenance', 'Miscellaneous'].map(t => ({ value: t, label: t }))

export default function Expenses() {
  const { role } = useAuth()
  const { expenses, loading, error, setExpenses } = useExpenses()
  const { vehicles } = useVehicles()
  const toast = useToast()

  const today = new Date().toISOString().split('T')[0]
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ vehicle_id: '', type: '', date: today, amount: '', notes: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const nonRetiredVehicles = vehicles.filter(v => v.status !== 'Retired')
  const vehicleOptions = nonRetiredVehicles.map(v => ({ value: v.id, label: `${v.registration_number} — ${v.name}` }))

  const filtered = expenses.filter(e => {
    const matchVehicle = !vehicleFilter || String(e.vehicle_id) === vehicleFilter || String(e.vehicle?.id) === vehicleFilter
    const matchType = !typeFilter || e.type === typeFilter
    const matchFrom = !dateFrom || e.date >= dateFrom
    const matchTo = !dateTo || e.date <= dateTo
    return matchVehicle && matchType && matchFrom && matchTo
  })

  // Per-vehicle cost summary
  const vehicleSummary = expenses.reduce((acc, e) => {
    const vid = e.vehicle?.registration_number || e.vehicle_id || 'Unknown'
    if (!acc[vid]) acc[vid] = 0
    acc[vid] += Number(e.amount) || 0
    return acc
  }, {})

  const validate = () => {
    const errors = {}
    if (!form.vehicle_id) errors.vehicle_id = 'Required'
    if (!form.type) errors.type = 'Required'
    if (!form.date) errors.date = 'Required'
    if (!form.amount || Number(form.amount) <= 0) errors.amount = 'Must be > 0'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    try {
      const newExp = await createExpense(form)
      setExpenses(prev => [newExp, ...prev])
      toast.success('Expense recorded successfully!')
      setModalOpen(false)
      setForm({ vehicle_id: '', type: '', date: today, amount: '', notes: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense')
    } finally {
      setSubmitting(false)
    }
  }

  const uniqueVehicles = [...new Map(expenses.map(e => [e.vehicle?.id || e.vehicle_id, e.vehicle?.registration_number || e.vehicle_id])).entries()]

  const columns = [
    { key: 'id', label: 'Expense ID', render: (val) => <span className="font-mono text-xs text-on-surface-variant">#{val}</span> },
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
    {
      key: 'type',
      label: 'Type',
      render: (val) => (
        <span className="badge bg-secondary/10 text-secondary border border-secondary/20">{val}</span>
      ),
    },
    { key: 'date', label: 'Date' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span className="font-mono font-semibold">{val ? `$${Number(val).toLocaleString()}` : '--'}</span>,
    },
    { key: 'notes', label: 'Notes', render: (val) => <span className="text-on-surface-variant text-xs truncate max-w-[150px] block">{val || '—'}</span> },
    { key: 'id', label: 'Actions', render: () => <button className="btn-ghost text-xs"><span className="material-symbols-outlined text-[16px]">visibility</span></button> },
  ]

  return (
    <div>
      <PageHeader
        title="Expense Management"
        subtitle="Track and manage operational expenses across the fleet."
        action={role === 'fleet_manager' ? { label: 'Add Expense', icon: 'add', onClick: () => setModalOpen(true), id: 'btn-add-expense' } : null}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)} className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary">
            <option value="">All Vehicles</option>
            {uniqueVehicles.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-surface-container border border-outline-variant text-sm rounded-md py-2 pl-3 pr-6 text-on-surface focus:ring-1 focus:ring-primary">
            <option value="">All Types</option>
            {EXPENSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input py-2 text-sm w-36" />
            <span className="text-on-surface-variant text-sm">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input py-2 text-sm w-36" />
          </div>
        </div>
      </PageHeader>

      <DataTable columns={columns} data={filtered} loading={loading} error={error} emptyMessage="No expenses found" emptyIcon="receipt_long" pageSize={5} />

      {/* Per-vehicle summary */}
      {Object.keys(vehicleSummary).length > 0 && (
        <div className="mt-6">
          <h3 className="text-base font-bold text-on-surface mb-3">Per-Vehicle Operational Cost Summary</h3>
          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Vehicle</th>
                  <th className="table-th text-right">Total Expenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {Object.entries(vehicleSummary).sort((a, b) => b[1] - a[1]).map(([vid, total]) => (
                  <tr key={vid} className="table-row">
                    <td className="table-td font-medium">{vid}</td>
                    <td className="table-td text-right font-mono font-semibold text-on-surface">${total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" size="sm">
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <FormSelect id="exp-vehicle" label="Vehicle" value={form.vehicle_id} onChange={e => setForm(f => ({ ...f, vehicle_id: e.target.value }))} options={vehicleOptions} required error={formErrors.vehicle_id} />
              <FormSelect id="exp-type" label="Expense Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={EXPENSE_TYPES} required error={formErrors.type} />
              <FormDatePicker id="exp-date" label="Date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required error={formErrors.date} />
              <FormInput id="exp-amount" label="Amount ($)" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 250.00" required min="0.01" step="0.01" error={formErrors.amount} />
              <FormTextarea id="exp-notes" label="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." rows={2} />
            </div>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Add Expense'}</button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
