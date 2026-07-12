import { useState, useEffect, useCallback } from 'react'
import { getMaintenanceRecords } from '../api/maintenanceService'

export function useMaintenance(initialParams = {}) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchRecords = useCallback(async (queryParams = params) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMaintenanceRecords(queryParams)
      setRecords(Array.isArray(data) ? data : data.results || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load maintenance records')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const refetch = (newParams) => {
    if (newParams) setParams(prev => ({ ...prev, ...newParams }))
    fetchRecords(newParams ? { ...params, ...newParams } : params)
  }

  return { records, loading, error, refetch, setRecords }
}
