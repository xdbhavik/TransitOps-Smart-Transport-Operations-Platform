import axiosInstance from './axiosInstance'
import { apiErrorMessage, humanizeEnum, toNumber, toVehicleTypeEnum } from './backendTransforms'

const mapVehicle = (vehicle) => ({
  id: vehicle.vehicleId,
  registration_number: vehicle.registrationNumber,
  name: vehicle.vehicleName,
  model: vehicle.model,
  type: humanizeEnum(vehicle.type),
  manufacturer: vehicle.manufacturer,
  manufacturing_year: vehicle.manufacturingYear,
  max_load_capacity: vehicle.maximumLoadCapacity,
  odometer: vehicle.odometer,
  acquisition_cost: vehicle.acquisitionCost,
  current_value: vehicle.currentValue,
  fuel_type: humanizeEnum(vehicle.fuelType),
  fuel_tank_capacity: vehicle.fuelTankCapacity,
  average_mileage: vehicle.averageMileage,
  health_score: vehicle.healthScore,
  total_carbon_emission: vehicle.totalCarbonEmission,
  status: humanizeEnum(vehicle.status),
})

const buildVehicleRequest = (payload, existing = {}) => {
  const typeValue = payload.type ?? existing.type
  return {
    registrationNumber: payload.registration_number ?? existing.registration_number,
    vehicleName: payload.name ?? existing.name,
    model: payload.model ?? existing.model ?? payload.name ?? existing.name,
    type: typeValue ? toVehicleTypeEnum(typeValue) : undefined,
    manufacturer: payload.manufacturer ?? existing.manufacturer ?? payload.name ?? existing.name,
    manufacturingYear: toNumber(payload.manufacturing_year ?? existing.manufacturing_year),
    maximumLoadCapacity: toNumber(payload.max_load_capacity ?? existing.max_load_capacity),
    fuelType: payload.fuel_type ? String(payload.fuel_type).trim().toUpperCase() : existing.fuel_type ? String(existing.fuel_type).trim().toUpperCase() : undefined,
    fuelTankCapacity: toNumber(payload.fuel_tank_capacity ?? existing.fuel_tank_capacity),
    averageMileage: toNumber(payload.average_mileage ?? existing.average_mileage),
    acquisitionCost: toNumber(payload.acquisition_cost ?? existing.acquisition_cost),
  }
}

export const getVehicles = async (params = {}) => {
  const { data } = await axiosInstance.get('/api/vehicles')
  let list = Array.isArray(data) ? data.map(mapVehicle) : []

  if (params.status) {
    list = list.filter((vehicle) => vehicle.status === params.status)
  }
  if (params.type) {
    list = list.filter((vehicle) => vehicle.type === params.type)
  }

  return list
}

export const getVehicle = async (id) => {
  const { data } = await axiosInstance.get(`/api/vehicles/${id}`)
  return mapVehicle(data)
}

export const createVehicle = async (payload) => {
  try {
    const requestBody = buildVehicleRequest(payload)
    const { data } = await axiosInstance.post('/api/vehicles', requestBody)
    return await getVehicle(data.vehicleId)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to create vehicle'))
  }
}

export const updateVehicle = async (id, payload) => {
  try {
    const existing = await getVehicle(id)
    const requestBody = buildVehicleRequest(payload, existing)
    await axiosInstance.put(`/api/vehicles/${id}`, requestBody)
    return await getVehicle(id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update vehicle'))
  }
}

export const retireVehicle = async (id) => {
  try {
    const { data } = await axiosInstance.patch(`/api/vehicles/${id}/status`, { status: 'RETIRED' })
    return { id: data.vehicleId, status: 'Retired', message: data.message }
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to retire vehicle'))
  }
}

export const getAvailableVehicles = async () => {
  const { data } = await axiosInstance.get('/api/vehicles/available')
  return Array.isArray(data) ? data.map(mapVehicle) : []
}

export const uploadVehicleDocument = async () => {
  throw new Error('Vehicle document upload is not available in the backend yet')
}
