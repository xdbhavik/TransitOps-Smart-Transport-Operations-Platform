import { useState, useEffect, useCallback } from 'react'
import { getTrips } from '../api/tripService'

export function useTrips(initialParams = {}) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchTrips = useCallback(async (queryParams = params) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTrips(queryParams)
      setTrips(Array.isArray(data) ? data : data.results || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const refetch = (newParams) => {
    if (newParams) setParams(prev => ({ ...prev, ...newParams }))
    fetchTrips(newParams ? { ...params, ...newParams } : params)
  }

  return { trips, loading, error, refetch, setTrips }
}
