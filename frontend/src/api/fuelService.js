import { mockDb } from './mockDb'

export const getFuelLogs = async (params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = mockDb.getFuel()
  if (params.vehicle_id) {
    list = list.filter(l => String(l.vehicle_id) === String(params.vehicle_id))
  }
  return list
}

export const getFuelLog = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const list = mockDb.getFuel()
  const item = list.find(l => String(l.id) === String(id))
  if (!item) throw new Error('Fuel log not found')
  return item
}

export const createFuelLog = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const logs = mockDb.getFuel()
  const vehicles = mockDb.getVehicles()
  const vehicle = vehicles.find(v => String(v.id) === String(payload.vehicle_id))

  const newLog = {
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    vehicle_id: Number(payload.vehicle_id),
    date: payload.date,
    liters: Number(payload.liters),
    cost: Number(payload.cost),
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }

  logs.unshift(newLog)
  mockDb.saveFuel(logs)

  // Also auto-add to operational expenses as a fuel expense (Miscellaneous/Toll/Maintenance, let's map to Miscellaneous or create/retain custom text)
  const expenses = mockDb.getExpenses()
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    vehicle_id: Number(payload.vehicle_id),
    type: 'Miscellaneous', // Toll / Maintenance / Miscellaneous
    date: payload.date,
    amount: Number(payload.cost),
    notes: `Fuel Log entry: ${Number(payload.liters)}L @ $${Number(payload.cost)}`,
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }
  expenses.unshift(newExpense)
  mockDb.saveExpenses(expenses)

  return newLog
}
