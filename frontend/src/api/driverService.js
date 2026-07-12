import axiosInstance from './axiosInstance'
import { apiErrorMessage, humanizeEnum, toDateOnly, toDriverStatusEnum } from './backendTransforms'

const mapDriver = (driver) => ({
  id: driver.id,
  name: driver.name,
  license_number: driver.license_number,
  license_category: driver.license_category,
  license_expiry: toDateOnly(driver.license_expiry),
  contact_number: driver.contact_number,
  safety_score: driver.safety_score,
  status: humanizeEnum(driver.status),
  email: driver.email,
  experience_years: driver.experience_years,
  employee_id: driver.employee_id,
  created_at: driver.created_at,
  updated_at: driver.updated_at,
})

const buildDriverRequest = (payload, existing = {}) => ({
  name: payload.name ?? existing.name,
  license_number: payload.license_number ?? existing.license_number,
  license_category: payload.license_category ?? existing.license_category,
  license_expiry: payload.license_expiry ?? existing.license_expiry,
  contact_number: payload.contact_number ?? existing.contact_number,
  safety_score: payload.safety_score ?? existing.safety_score,
  status: payload.status ? toDriverStatusEnum(payload.status) : existing.status ? toDriverStatusEnum(existing.status) : undefined,
  email: payload.email ?? existing.email,
  experience_years: payload.experience_years ?? existing.experience_years,
})

export const getDrivers = async (params = {}) => {
  const { data } = await axiosInstance.get('/drivers')
  let list = Array.isArray(data) ? data.map(mapDriver) : []
  if (params.status) {
    list = list.filter((driver) => driver.status === params.status)
  }
  return list
}

export const getDriver = async (id) => {
  const { data } = await axiosInstance.get(`/drivers/${id}`)
  return mapDriver(data)
}

export const createDriver = async (payload) => {
  try {
    const { data } = await axiosInstance.post('/drivers', buildDriverRequest(payload))
    return await getDriver(data.id || data.driverId || data.userId || data.id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to create driver'))
  }
}

export const updateDriver = async (id, payload) => {
  try {
    const existing = await getDriver(id)
    await axiosInstance.put(`/drivers/${id}`, buildDriverRequest(payload, existing))
    return await getDriver(id)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update driver'))
  }
}

export const suspendDriver = async (id) => updateDriverStatus(id, 'SUSPENDED')

export const unsuspendDriver = async (id) => updateDriverStatus(id, 'AVAILABLE')

export const getAvailableDrivers = async () => {
  const { data } = await axiosInstance.get('/drivers/available')
  return Array.isArray(data) ? data.map(mapDriver) : []
}

export const updateDriverStatus = async (id, status) => {
  try {
    const { data } = await axiosInstance.patch(`/drivers/${id}/status`, { status })
    return await getDriver(id).catch(() => ({ id, status: humanizeEnum(status), message: data?.message }))
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update driver status'))
  }
}

export const getOnTripDrivers = async () => {
  const { data } = await axiosInstance.get('/drivers/on-trip')
  return Array.isArray(data) ? data.map(mapDriver) : []
}

export const getLicenseExpiringDrivers = async () => {
  const { data } = await axiosInstance.get('/drivers/license-expiring')
  return Array.isArray(data) ? data.map(mapDriver) : []
}
