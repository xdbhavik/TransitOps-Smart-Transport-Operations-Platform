import { mockDb } from './mockDb'

export const getTrips = async (params = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let list = mockDb.getTrips()
  if (params.status) {
    list = list.filter(t => t.status === params.status)
  }
  return list
}

export const getTrip = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150))
  const list = mockDb.getTrips()
  const item = list.find(t => String(t.id) === String(id))
  if (!item) throw new Error('Trip not found')
  return item
}

export const createTrip = async (payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const trips = mockDb.getTrips()
  const vehicles = mockDb.getVehicles()
  const drivers = mockDb.getDrivers()

  const vehicle = vehicles.find(v => String(v.id) === String(payload.vehicle_id))
  const driver = drivers.find(d => String(d.id) === String(payload.driver_id))

  const newTrip = {
    id: trips.length > 0 ? Math.max(...trips.map(t => t.id)) + 1 : 1,
    source: payload.source,
    destination: payload.destination,
    vehicle_id: Number(payload.vehicle_id),
    driver_id: Number(payload.driver_id),
    cargo_weight: Number(payload.cargo_weight),
    planned_distance: Number(payload.planned_distance),
    status: 'Draft',
    vehicle_name: vehicle ? vehicle.name : 'Unknown Vehicle',
    driver_name: driver ? driver.name : 'Unknown Driver',
  }

  trips.unshift(newTrip)
  mockDb.saveTrips(trips)
  return newTrip
}

export const updateTrip = async (id, payload) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const trips = mockDb.getTrips()
  const idx = trips.findIndex(t => String(t.id) === String(id))
  if (idx === -1) throw new Error('Trip not found')

  const updated = {
    ...trips[idx],
    ...payload,
    cargo_weight: Number(payload.cargo_weight || trips[idx].cargo_weight),
    planned_distance: Number(payload.planned_distance || trips[idx].planned_distance),
  }
  trips[idx] = updated
  mockDb.saveTrips(trips)
  return updated
}

export const dispatchTrip = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const trips = mockDb.getTrips()
  const idx = trips.findIndex(t => String(t.id) === String(id))
  if (idx === -1) throw new Error('Trip not found')

  const trip = trips[idx]
  trip.status = 'Dispatched'

  // Update vehicle and driver status
  const vehicles = mockDb.getVehicles()
  const drivers = mockDb.getDrivers()

  const vIdx = vehicles.findIndex(v => String(v.id) === String(trip.vehicle_id))
  if (vIdx !== -1) {
    vehicles[vIdx].status = 'On Trip'
    mockDb.saveVehicles(vehicles)
  }

  const dIdx = drivers.findIndex(d => String(d.id) === String(trip.driver_id))
  if (dIdx !== -1) {
    drivers[dIdx].status = 'On Trip'
    mockDb.saveDrivers(drivers)
  }

  mockDb.saveTrips(trips)
  return trip
}

export const completeTrip = async (id, payload) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  const trips = mockDb.getTrips()
  const idx = trips.findIndex(t => String(t.id) === String(id))
  if (idx === -1) throw new Error('Trip not found')

  const trip = trips[idx]
  trip.status = 'Completed'
  trip.final_odometer = Number(payload.final_odometer)
  trip.fuel_consumed = Number(payload.fuel_consumed)

  // Revert vehicle and driver status to Available
  const vehicles = mockDb.getVehicles()
  const drivers = mockDb.getDrivers()

  const vIdx = vehicles.findIndex(v => String(v.id) === String(trip.vehicle_id))
  if (vIdx !== -1) {
    vehicles[vIdx].status = 'Available'
    // Update odometer to final reading
    vehicles[vIdx].odometer = Number(payload.final_odometer)
    mockDb.saveVehicles(vehicles)
  }

  const dIdx = drivers.findIndex(d => String(d.id) === String(trip.driver_id))
  if (dIdx !== -1) {
    drivers[dIdx].status = 'Available'
    mockDb.saveDrivers(drivers)
  }

  // Auto-generate fuel log entry
  const fuelLogs = mockDb.getFuel()
  const vehicle = vehicles.find(v => String(v.id) === String(trip.vehicle_id))
  const newFuelLog = {
    id: fuelLogs.length > 0 ? Math.max(...fuelLogs.map(f => f.id)) + 1 : 1,
    vehicle_id: trip.vehicle_id,
    date: new Date().toISOString().split('T')[0],
    liters: Number(payload.fuel_consumed),
    cost: Math.round(Number(payload.fuel_consumed) * 2.15), // Estimating cost/liter
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }
  fuelLogs.unshift(newFuelLog)
  mockDb.saveFuel(fuelLogs)

  // Auto-generate operational expense entry for Fuel
  const expenses = mockDb.getExpenses()
  const newExpense = {
    id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
    vehicle_id: trip.vehicle_id,
    type: 'Miscellaneous',
    date: new Date().toISOString().split('T')[0],
    amount: newFuelLog.cost,
    notes: `Fuel cost for Completed Trip #${trip.id}`,
    vehicle: vehicle ? { id: vehicle.id, registration_number: vehicle.registration_number, name: vehicle.name } : null,
  }
  expenses.unshift(newExpense)
  mockDb.saveExpenses(expenses)

  mockDb.saveTrips(trips)
  return trip
}

export const cancelTrip = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const trips = mockDb.getTrips()
  const idx = trips.findIndex(t => String(t.id) === String(id))
  if (idx === -1) throw new Error('Trip not found')

  const trip = trips[idx]
  const oldStatus = trip.status
  trip.status = 'Cancelled'

  // Revert vehicle/driver to Available if dispatched
  if (oldStatus === 'Dispatched') {
    const vehicles = mockDb.getVehicles()
    const drivers = mockDb.getDrivers()

    const vIdx = vehicles.findIndex(v => String(v.id) === String(trip.vehicle_id))
    if (vIdx !== -1) {
      vehicles[vIdx].status = 'Available'
      mockDb.saveVehicles(vehicles)
    }

    const dIdx = drivers.findIndex(d => String(d.id) === String(trip.driver_id))
    if (dIdx !== -1) {
      drivers[dIdx].status = 'Available'
      mockDb.saveDrivers(drivers)
    }
  }

  mockDb.saveTrips(trips)
  return trip
}
