export const humanizeEnum = (value) => {
  if (value == null) return ''
  if (typeof value !== 'string') return String(value)
  return value
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export const toDateOnly = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10)
  }
  return date.toISOString().split('T')[0]
}

export const toLocalDateTime = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19)
  }
  return date.toISOString().slice(0, 19)
}

export const toNumber = (value) => {
  if (value === '' || value == null) return null
  const number = Number(value)
  return Number.isNaN(number) ? null : number
}

export const toVehicleTypeEnum = (value) => {
  const normalized = String(value || '').trim().toUpperCase()
  if (!['VAN', 'TRUCK', 'BUS'].includes(normalized)) {
    throw new Error(`Unsupported vehicle type: ${value}`)
  }
  return normalized
}

export const toDriverStatusEnum = (value) => {
  const normalized = String(value || '').trim().replace(/\s+/g, '_').toUpperCase()
  if (!normalized) return null
  return normalized
}

export const toExpenseTypeEnum = (value) => {
  const normalized = String(value || '').trim().replace(/\s+/g, '_').toUpperCase()
  if (normalized === 'MISCELLANEOUS') return 'OTHER'
  return normalized
}

export const apiErrorMessage = (error, fallback = 'Request failed') => {
  return error?.response?.data?.message || error?.response?.data?.detail || error?.message || fallback
}
