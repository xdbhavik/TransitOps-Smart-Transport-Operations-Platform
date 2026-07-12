import axiosInstance from './axiosInstance'
import { apiErrorMessage, toDateOnly, toLocalDateTime, toNumber } from './backendTransforms'
import { getVehicles } from './vehicleService'

const mapFuelLog = (log, vehicleMap = {}) => {
  const vehicle = vehicleMap[log.vehicleId] || vehicleMap[log.vehicle_id] || null
  return {
    id: log.fuelLogId,
    vehicle_id: log.vehicleId || log.vehicle_id,
    trip_id: log.tripId || log.trip_id,
    date: toDateOnly(log.fuelDate || log.date),
    liters: log.liters,
    cost: log.cost,
    fuel_station: log.fuelStation,
    mileage: log.mileage,
    vehicle,
  }
}

export const getFuelLogs = async (params = {}) => {
  const vehicles = await getVehicles()
  const vehicleMap = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle]))

  const logs = []
  for (const vehicle of vehicles) {
    const { data } = await axiosInstance.get(`/api/fuel/history/${vehicle.id}`)
    const vehicleLogs = Array.isArray(data) ? data.map((log) => mapFuelLog(log, vehicleMap)) : []
    logs.push(...vehicleLogs)
  }

  let list = logs
  if (params.vehicle_id) {
    list = list.filter((log) => String(log.vehicle_id) === String(params.vehicle_id))
  }
  return list.sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export const getFuelLog = async (id) => {
  const logs = await getFuelLogs()
  const item = logs.find((log) => String(log.id) === String(id))
  if (!item) throw new Error('Fuel log not found')
  return item
}

export const createFuelLog = async (payload) => {
  try {
    const { data } = await axiosInstance.post('/api/fuel', {
      vehicleId: payload.vehicle_id,
      tripId: payload.trip_id || undefined,
      liters: toNumber(payload.liters),
      cost: toNumber(payload.cost),
      fuelStation: payload.fuel_station || 'TransitOps Fuel Station',
    })

    const vehicles = await getVehicles()
    const vehicle = vehicles.find((item) => String(item.id) === String(payload.vehicle_id)) || null

    return {
      id: data.fuelLogId,
      vehicle_id: payload.vehicle_id,
      date: payload.date || new Date().toISOString().split('T')[0],
      liters: toNumber(payload.liters),
      cost: toNumber(payload.cost),
      fuel_station: payload.fuel_station || 'TransitOps Fuel Station',
      mileage: data.mileage,
      vehicle,
      created_at: toLocalDateTime(),
    }
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to create fuel log'))
  }
}
