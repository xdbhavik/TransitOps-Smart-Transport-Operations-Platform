import axiosInstance from './axiosInstance'
import { apiErrorMessage, humanizeEnum, toDateOnly } from './backendTransforms'

const mapVehicle = (vehicle) => vehicle ? ({
  id: vehicle.vehicleId || vehicle.id,
  registration_number: vehicle.registrationNumber || vehicle.registration_number,
  name: vehicle.vehicleName || vehicle.name,
  status: humanizeEnum(vehicle.status),
}) : null

const mapMaintenance = (record) => ({
  id: record.maintenanceCode || record.id,
  vehicle_id: record.vehicle?.vehicleId || record.vehicle?.id || record.vehicleId,
  type_of_work: record.description || record.type_of_work || record.maintenanceType,
  notes: record.description || record.notes,
  date_created: toDateOnly(record.maintenanceDate || record.createdAt || record.date_created),
  status: record.status === 'COMPLETED' || record.status === 'Closed' ? 'Closed' : 'Open',
  vehicle: mapVehicle(record.vehicle),
  vehicle_status: humanizeEnum(record.vehicleStatus),
})

export const getMaintenanceRecords = async (params = {}) => {
  const { data } = await axiosInstance.get('/api/maintenance')
  let list = Array.isArray(data) ? data.map(mapMaintenance) : []
  if (params.status) {
    list = list.filter((record) => record.status === params.status)
  }
  return list
}

export const getMaintenance = async (id) => {
  const records = await getMaintenanceRecords()
  const item = records.find((record) => String(record.id) === String(id))
  if (!item) throw new Error('Record not found')
  return item
}

export const createMaintenance = async (payload) => {
  try {
    const { data } = await axiosInstance.post('/api/maintenance', {
      vehicleId: payload.vehicle_id,
      maintenanceType: 'ROUTINE',
      description: payload.type_of_work,
      serviceCenter: payload.notes || 'TransitOps Workshop',
      cost: 0,
    })

    const vehicles = await axiosInstance.get('/api/vehicles')
    const vehicleList = Array.isArray(vehicles.data) ? vehicles.data : []
    const vehicle = vehicleList.find((item) => String(item.vehicleId) === String(payload.vehicle_id)) || null

    const created = {
      id: data.maintenanceId,
      vehicle_id: payload.vehicle_id,
      type_of_work: payload.type_of_work,
      notes: payload.notes,
      date_created: new Date().toISOString().split('T')[0],
      status: 'Open',
      vehicle_status: data.vehicleStatus,
      vehicle: vehicle ? {
        id: vehicle.vehicleId,
        registration_number: vehicle.registrationNumber,
        name: vehicle.vehicleName,
      } : null,
    }

    return created
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to create maintenance record'))
  }
}

export const closeMaintenance = async (id) => {
  try {
    const { data } = await axiosInstance.patch(`/api/maintenance/${id}/complete`)
    return { id: data.maintenanceId, status: 'Closed', vehicle_status: data.vehicleStatus, message: data.message }
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to close maintenance record'))
  }
}
