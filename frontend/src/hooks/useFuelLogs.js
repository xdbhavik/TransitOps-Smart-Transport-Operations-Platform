import { useState, useEffect, useCallback } from 'react'
import { getFuelLogs } from '../api/fuelService'

export function useFuelLogs(initialParams = {}) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchLogs = useCallback(async (queryParams = params) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFuelLogs(queryParams)
      setLogs(Array.isArray(data) ? data : data.results || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load fuel logs')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const refetch = (newParams) => {
    if (newParams) setParams(prev => ({ ...prev, ...newParams }))
    fetchLogs(newParams ? { ...params, ...newParams } : params)
  }

  return { logs, loading, error, refetch, setLogs }
}
