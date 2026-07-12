import { useState, useEffect, useCallback } from 'react'
import { getDrivers } from '../api/driverService'

export function useDrivers(initialParams = {}) {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchDrivers = useCallback(async (queryParams = params) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDrivers(queryParams)
      setDrivers(Array.isArray(data) ? data : data.results || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const refetch = (newParams) => {
    if (newParams) setParams(prev => ({ ...prev, ...newParams }))
    fetchDrivers(newParams ? { ...params, ...newParams } : params)
  }

  return { drivers, loading, error, refetch, setDrivers }
}
