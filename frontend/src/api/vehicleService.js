import { mockDb } from './mockDb'

export const getVehicles = async (params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = mockDb.getVehicles()
  if (params.status) {
    list = list.filter(v => v.status === params.status)
  }
  if (params.type) {
    list = list.filter(v => v.type === params.type)
  }
  return list
}

export const getVehicle = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const list = mockDb.getVehicles()
  const item = list.find(v => String(v.id) === String(id))
  if (!item) throw new Error('Vehicle not found')
  return item
}

export const createVehicle = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const list = mockDb.getVehicles()
  // Check unique registration number
  if (list.some(v => v.registration_number === payload.registration_number)) {
    throw new Error('Registration number already exists')
  }
  const newV = {
    id: list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1,
    ...payload,
    status: payload.status || 'Available',
    max_load_capacity: Number(payload.max_load_capacity),
    odometer: Number(payload.odometer),
    acquisition_cost: Number(payload.acquisition_cost),
  }
  list.unshift(newV)
  mockDb.saveVehicles(list)
  return newV
}

export const updateVehicle = async (id, payload) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const list = mockDb.getVehicles()
  const idx = list.findIndex(v => String(v.id) === String(id))
  if (idx === -1) throw new Error('Vehicle not found')

  const updated = {
    ...list[idx],
    ...payload,
    max_load_capacity: Number(payload.max_load_capacity || list[idx].max_load_capacity),
    odometer: Number(payload.odometer || list[idx].odometer),
    acquisition_cost: Number(payload.acquisition_cost || list[idx].acquisition_cost),
  }
  list[idx] = updated
  mockDb.saveVehicles(list)
  return updated
}

export const retireVehicle = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const list = mockDb.getVehicles()
  const idx = list.findIndex(v => String(v.id) === String(id))
  if (idx === -1) throw new Error('Vehicle not found')
  list[idx].status = 'Retired'
  mockDb.saveVehicles(list)
  return list[idx]
}

export const getAvailableVehicles = async () => {
  return getVehicles({ status: 'Available' })
}

export const uploadVehicleDocument = async (id, fileObj) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  const list = mockDb.getVehicles()
  const idx = list.findIndex(v => String(v.id) === String(id))
  if (idx === -1) throw new Error('Vehicle not found')

  const doc = {
    id: Date.now(),
    name: fileObj.name || 'document.pdf',
    type: fileObj.type || 'application/pdf',
    size: fileObj.size || 1024,
    upload_date: new Date().toISOString().split('T')[0]
  }

  const updated = {
    ...list[idx],
    documents: [...(list[idx].documents || []), doc]
  }
  list[idx] = updated
  mockDb.saveVehicles(list)
  return updated
}
