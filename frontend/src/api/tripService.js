import axiosInstance from './axiosInstance'
import { apiErrorMessage, humanizeEnum, toLocalDateTime, toNumber } from './backendTransforms'

const mapVehicle = (vehicle) => vehicle ? ({
  id: vehicle.id,
  registration_number: vehicle.registration_number,
  name: vehicle.name,
  max_load_capacity: vehicle.max_load_capacity,
  odometer: vehicle.odometer,
  status: vehicle.status,
}) : null

const mapDriver = (driver) => driver ? ({
  id: driver.id,
  name: driver.name,
  license_number: driver.license_number,
  license_expiry: driver.license_expiry,
  status: driver.status,
}) : null

const mapTrip = (trip, vehicleMap = {}, driverMap = {}) => {
  const vehicle = vehicleMap[trip.vehicleId] || vehicleMap[trip.vehicle_id] || null
  const driver = driverMap[trip.driverId] || driverMap[trip.driver_id] || null

  return {
    id: trip.tripId,
    trip_number: trip.tripNumber,
    source: trip.source,
    destination: trip.destination,
    driver_id: trip.driverId,
    vehicle_id: trip.vehicleId,
    cargo_weight: trip.cargoWeight,
    planned_distance: trip.plannedDistance,
    actual_distance: trip.actualDistance,
    scheduled_start: trip.scheduledStart,
    scheduled_end: trip.scheduledEnd,
    estimated_arrival: trip.estimatedArrival,
    actual_end: trip.actualEnd,
    fuel_consumed: trip.fuelConsumed,
    status: humanizeEnum(trip.status),
    created_at: trip.createdAt,
    updated_at: trip.updatedAt,
    vehicle_name: vehicle?.name || null,
    driver_name: driver?.name || null,
    vehicle: vehicle,
    driver: driver,
  }
}

const fetchEnrichmentMaps = async () => {
  const [vehiclesResponse, driversResponse] = await Promise.all([
    axiosInstance.get('/api/vehicles'),
    axiosInstance.get('/drivers'),
  ])

  const vehicles = Array.isArray(vehiclesResponse.data) ? vehiclesResponse.data.map((vehicle) => ({
    id: vehicle.vehicleId,
    registration_number: vehicle.registrationNumber,
    name: vehicle.vehicleName,
    status: humanizeEnum(vehicle.status),
    odometer: vehicle.odometer,
    max_load_capacity: vehicle.maximumLoadCapacity,
  })) : []
  const drivers = Array.isArray(driversResponse.data) ? driversResponse.data.map((driver) => ({
    id: driver.id,
    name: driver.name,
    status: driver.status,
    license_number: driver.license_number,
    license_expiry: driver.license_expiry,
  })) : []

  return {
    vehicleMap: Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    driverMap: Object.fromEntries(drivers.map((driver) => [driver.id, driver])),
  }
}

const buildTripRequest = (payload) => ({
  source: payload.source,
  destination: payload.destination,
  driverId: payload.driver_id,
  vehicleId: payload.vehicle_id,
  cargoWeight: toNumber(payload.cargo_weight),
  plannedDistance: toNumber(payload.planned_distance),
  scheduledStart: payload.scheduled_start,
  scheduledEnd: payload.scheduled_end,
  estimatedArrival: payload.estimated_arrival,
})

export const getTrips = async (params = {}) => {
  const endpointMap = {
    Dispatched: '/api/trips/active',
    Completed: '/api/trips/completed',
    Cancelled: '/api/trips/cancelled',
  }

  const { data } = await axiosInstance.get(endpointMap[params.status] || '/api/trips')
  const trips = Array.isArray(data) ? data : []
  const { vehicleMap, driverMap } = await fetchEnrichmentMaps()
  let list = trips.map((trip) => mapTrip(trip, vehicleMap, driverMap))

  if (params.status) {
    list = list.filter((trip) => trip.status === params.status)
  }

  return list
}

export const getTrip = async (id) => {
  const { data } = await axiosInstance.get(`/api/trips/${id}`)
  const { vehicleMap, driverMap } = await fetchEnrichmentMaps()
  return mapTrip(data, vehicleMap, driverMap)
}

export const createTrip = async (payload) => {
  try {
    const { data } = await axiosInstance.post('/api/trips', buildTripRequest(payload))
    return await getTrip(data.tripId)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to create trip'))
  }
}

export const updateTrip = async (id, payload) => {
  try {
    await axiosInstance.put(`/api/trips/${id}`, buildTripRequest(payload))
    return await getTrip(id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update trip'))
  }
}

export const dispatchTrip = async (id) => {
  try {
    await axiosInstance.post(`/api/trips/${id}/dispatch`, {
      dispatchTime: toLocalDateTime(),
    })
    return await getTrip(id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to dispatch trip'))
  }
}

export const completeTrip = async (id, payload) => {
  try {
    const trip = await getTrip(id)
    const currentVehicle = trip.vehicle || (await axiosInstance.get(`/api/vehicles/${trip.vehicle_id}`)).data
    const currentOdometer = currentVehicle?.odometer ?? 0
    const finalOdometer = toNumber(payload.final_odometer)
    if (finalOdometer == null) {
      throw new Error('Final odometer is required')
    }

    const actualDistance = finalOdometer >= currentOdometer ? finalOdometer - currentOdometer : finalOdometer

    await axiosInstance.post(`/api/trips/${id}/complete`, {
      actualDistance,
      fuelConsumed: toNumber(payload.fuel_consumed),
      actualEnd: toLocalDateTime(),
    })

    return await getTrip(id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to complete trip'))
  }
}

export const cancelTrip = async (id) => {
  try {
    await axiosInstance.post(`/api/trips/${id}/cancel`, {
      reason: 'Cancelled from frontend',
      cancelledAt: toLocalDateTime(),
    })
    return await getTrip(id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to cancel trip'))
  }
}

export const addTracking = async (id, payload) => {
  try {
    const { data } = await axiosInstance.post(`/api/trips/${id}/tracking`, payload)
    return data
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update trip tracking'))
  }
}

export const getTripTracking = async (id) => {
  const { data } = await axiosInstance.get(`/api/trips/${id}/tracking`)
  return Array.isArray(data) ? data : []
}

export const getTripLocation = async (id) => {
  const { data } = await axiosInstance.get(`/api/trips/${id}/location`)
  return data
}

export const getTripEta = async (id) => {
  const { data } = await axiosInstance.get(`/api/trips/${id}/eta`)
  return data
}

export const getTripAnalytics = async () => {
  const { data } = await axiosInstance.get('/api/trips/analytics')
  return data
}
