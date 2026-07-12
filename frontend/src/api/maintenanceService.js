import { mockDb } from './mockDb'

export const getMaintenanceRecords = async (params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = mockDb.getMaintenance()
  if (params.status) {
    list = list.filter(r => r.status === params.status)
  }
  return list
}

export const getMaintenance = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const list = mockDb.getMaintenance()
  const item = list.find(r => String(r.id) === String(id))
  if (!item) throw new Error('Record not found')
  return item
}

export const createMaintenance = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const records = mockDb.getMaintenance()
  const vehicles = mockDb.getVehicles()

  const vehicle = vehicles.find(v => String(v.id) === String(payload.vehicle_id))

  const newRecord = {
    id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
    vehicle_id: Number(payload.vehicle_id),
    type_of_work: payload.type_of_work,
    notes: payload.notes,
    date_created: payload.date_created || new Date().toISOString().split('T')[0],
    status: 'Open',
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }

  // Update vehicle status to In Shop
  const vIdx = vehicles.findIndex(v => String(v.id) === String(payload.vehicle_id))
  if (vIdx !== -1) {
    vehicles[vIdx].status = 'In Shop'
    mockDb.saveVehicles(vehicles)
  }

  records.unshift(newRecord)
  mockDb.saveMaintenance(records)
  return newRecord
}

export const closeMaintenance = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const records = mockDb.getMaintenance()
  const idx = records.findIndex(r => String(r.id) === String(id))
  if (idx === -1) throw new Error('Record not found')

  const record = records[idx]
  record.status = 'Closed'

  // Update vehicle status back to Available (unless Retired)
  const vehicles = mockDb.getVehicles()
  const vIdx = vehicles.findIndex(v => String(v.id) === String(record.vehicle_id))
  if (vIdx !== -1 && vehicles[vIdx].status !== 'Retired') {
    vehicles[vIdx].status = 'Available'
    mockDb.saveVehicles(vehicles)
  }

  // Add a maintenance expense automatically
  const expenses = mockDb.getExpenses()
  const vehicle = vehicles.find(v => String(v.id) === String(record.vehicle_id))
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    vehicle_id: record.vehicle_id,
    type: 'Maintenance',
    date: new Date().toISOString().split('T')[0],
    amount: Math.floor(200 + Math.random() * 800), // Random maintenance cost
    notes: `Close Maintenance record #${record.id}: ${record.type_of_work}`,
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }
  expenses.unshift(newExpense)
  mockDb.saveExpenses(expenses)

  mockDb.saveMaintenance(records)
  return record
}
