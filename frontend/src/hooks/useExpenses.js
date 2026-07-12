import { useState, useEffect, useCallback } from 'react'
import { getExpenses } from '../api/expenseService'

export function useExpenses(initialParams = {}) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchExpenses = useCallback(async (queryParams = params) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getExpenses(queryParams)
      setExpenses(Array.isArray(data) ? data : data.results || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const refetch = (newParams) => {
    if (newParams) setParams(prev => ({ ...prev, ...newParams }))
    fetchExpenses(newParams ? { ...params, ...newParams } : params)
  }

  return { expenses, loading, error, refetch, setExpenses }
}
