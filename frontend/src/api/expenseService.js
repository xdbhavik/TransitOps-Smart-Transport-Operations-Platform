import { mockDb } from './mockDb'

export const getExpenses = async (params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = mockDb.getExpenses()
  if (params.vehicle_id) {
    list = list.filter(e => String(e.vehicle_id) === String(params.vehicle_id))
  }
  return list
}

export const getExpense = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const list = mockDb.getExpenses()
  const item = list.find(e => String(e.id) === String(id))
  if (!item) throw new Error('Expense not found')
  return item
}

export const createExpense = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const list = mockDb.getExpenses()
  const vehicles = mockDb.getVehicles()
  const vehicle = vehicles.find(v => String(v.id) === String(payload.vehicle_id))

  const newE = {
    id: list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1,
    vehicle_id: Number(payload.vehicle_id),
    type: payload.type,
    date: payload.date,
    amount: Number(payload.amount),
    notes: payload.notes,
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }
  list.unshift(newE)
  mockDb.saveExpenses(list)
  return newE
}

export const getOperationalCostSummary = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const expenses = mockDb.getExpenses()
  const vehicles = mockDb.getVehicles()

  const summary = vehicles.map(v => {
    const totalExp = expenses
      .filter(e => String(e.vehicle_id) === String(v.id))
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      vehicle_id: v.id,
      registration_number: v.registration_number,
      name: v.name,
      total_cost: totalExp,
    }
  })
  return summary
}
