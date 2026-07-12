import { useState, useEffect, useCallback } from 'react'
import { getVehicles } from '../api/vehicleService'

export function useVehicles(initialParams = {}) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchVehicles = useCallback(async (queryParams = params) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getVehicles(queryParams)
      // Support both array and paginated response
      setVehicles(Array.isArray(data) ? data : data.results || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const refetch = (newParams) => {
    if (newParams) setParams(prev => ({ ...prev, ...newParams }))
    fetchVehicles(newParams ? { ...params, ...newParams } : params)
  }

  return { vehicles, loading, error, refetch, setVehicles }
}
