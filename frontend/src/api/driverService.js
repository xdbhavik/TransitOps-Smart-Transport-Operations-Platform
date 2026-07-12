import { mockDb } from './mockDb'

export const getDrivers = async (params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = mockDb.getDrivers()
  if (params.status) {
    list = list.filter(d => d.status === params.status)
  }
  return list
}

export const getDriver = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const list = mockDb.getDrivers()
  const item = list.find(d => String(d.id) === String(id))
  if (!item) throw new Error('Driver not found')
  return item
}

export const createDriver = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const list = mockDb.getDrivers()
  const newD = {
    id: list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1,
    ...payload,
    safety_score: Number(payload.safety_score),
    status: payload.status || 'Available',
  }
  list.unshift(newD)
  mockDb.saveDrivers(list)
  return newD
}

export const updateDriver = async (id, payload) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const list = mockDb.getDrivers()
  const idx = list.findIndex(d => String(d.id) === String(id))
  if (idx === -1) throw new Error('Driver not found')

  const updated = {
    ...list[idx],
    ...payload,
    safety_score: Number(payload.safety_score || list[idx].safety_score),
  }
  list[idx] = updated
  mockDb.saveDrivers(list)
  return updated
}

export const suspendDriver = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const list = mockDb.getDrivers()
  const idx = list.findIndex(d => String(d.id) === String(id))
  if (idx === -1) throw new Error('Driver not found')
  list[idx].status = 'Suspended'
  mockDb.saveDrivers(list)
  return list[idx]
}

export const unsuspendDriver = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const list = mockDb.getDrivers()
  const idx = list.findIndex(d => String(d.id) === String(id))
  if (idx === -1) throw new Error('Driver not found')
  list[idx].status = 'Available'
  mockDb.saveDrivers(list)
  return list[idx]
}

export const getAvailableDrivers = async () => {
  const list = mockDb.getDrivers()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return list.filter(d => d.status === 'Available' && new Date(d.license_expiry) >= today)
}
