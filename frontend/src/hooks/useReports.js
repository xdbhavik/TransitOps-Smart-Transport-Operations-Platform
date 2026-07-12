import { useState, useCallback } from 'react'
import {
  getFuelEfficiencyReport,
  getFleetUtilizationReport,
  getOperationalCostReport,
  getVehicleROIReport,
} from '../api/reportService'

export function useReports() {
  const [fuelEfficiency, setFuelEfficiency] = useState([])
  const [fleetUtilization, setFleetUtilization] = useState([])
  const [operationalCost, setOperationalCost] = useState([])
  const [vehicleROI, setVehicleROI] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchReport = useCallback(async (reportType) => {
    setLoading(true)
    setError(null)
    try {
      switch (reportType) {
        case 'fuel-efficiency': {
          const data = await getFuelEfficiencyReport()
          setFuelEfficiency(Array.isArray(data) ? data : data.data || [])
          break
        }
        case 'fleet-utilization': {
          const data = await getFleetUtilizationReport()
          setFleetUtilization(Array.isArray(data) ? data : data.data || [])
          break
        }
        case 'operational-cost': {
          const data = await getOperationalCostReport()
          setOperationalCost(Array.isArray(data) ? data : data.data || [])
          break
        }
        case 'vehicle-roi': {
          const data = await getVehicleROIReport()
          setVehicleROI(Array.isArray(data) ? data : data.data || [])
          break
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    fuelEfficiency,
    fleetUtilization,
    operationalCost,
    vehicleROI,
    loading,
    error,
    fetchReport,
  }
}
