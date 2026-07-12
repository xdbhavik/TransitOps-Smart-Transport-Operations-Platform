import { getVehicles } from './vehicleService'
import { getDrivers } from './driverService'
import { getTrips } from './tripService'
import { getExpenses } from './expenseService'
import { getFuelLogs } from './fuelService'

export const getDashboardStats = async (filters = {}) => {
  const [vehicles, trips, drivers] = await Promise.all([getVehicles(), getTrips(), getDrivers()])

  let filteredVehicles = [...vehicles]
  if (filters.vehicleType) {
    filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.type === filters.vehicleType)
  }
  if (filters.vehicleStatus) {
    filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.status === filters.vehicleStatus)
  }

  const filteredVehicleIds = new Set(filteredVehicles.map((vehicle) => String(vehicle.id)))
  const filteredTrips = trips.filter((trip) => !filteredVehicleIds.size || filteredVehicleIds.has(String(trip.vehicle_id)))
  const filteredDrivers = drivers

  const activeVehicles = filteredVehicles.filter((vehicle) => vehicle.status === 'On Trip').length
  const availableVehicles = filteredVehicles.filter((vehicle) => vehicle.status === 'Available').length
  const vehiclesInMaintenance = filteredVehicles.filter((vehicle) => vehicle.status === 'In Shop').length
  const retiredVehicles = filteredVehicles.filter((vehicle) => vehicle.status === 'Retired').length

  const activeTrips = filteredTrips.filter((trip) => trip.status === 'Dispatched' || trip.status === 'In Transit').length
  const pendingTrips = filteredTrips.filter((trip) => trip.status === 'Draft').length
  const completedTrips = filteredTrips.filter((trip) => trip.status === 'Completed').length
  const cancelledTrips = filteredTrips.filter((trip) => trip.status === 'Cancelled').length

  const driversOnDuty = filteredDrivers.filter((driver) => driver.status === 'On Trip').length

  const totalVehicles = filteredVehicles.length
  const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalVehicles,
    fleetUtilization,
    vehicleStatusDistribution: [
      { name: 'Available', value: availableVehicles },
      { name: 'On Trip', value: activeVehicles },
      { name: 'In Shop', value: vehiclesInMaintenance },
      { name: 'Retired', value: retiredVehicles },
    ],
    tripStatusBreakdown: [
      { name: 'Draft', count: pendingTrips },
      { name: 'Dispatched', count: activeTrips },
      { name: 'Completed', count: completedTrips },
      { name: 'Cancelled', count: cancelledTrips },
    ],
  }
}

export const getFuelEfficiencyReport = async () => {
  const [vehicles, trips] = await Promise.all([getVehicles(), getTrips()])
  const completedTrips = trips.filter((trip) => trip.status === 'Completed')

  return vehicles.map((vehicle) => {
    const vehicleTrips = completedTrips.filter((trip) => String(trip.vehicle_id) === String(vehicle.id))
    const totalDistance = vehicleTrips.reduce((sum, trip) => sum + (Number(trip.actual_distance ?? trip.planned_distance) || 0), 0)
    const totalFuel = vehicleTrips.reduce((sum, trip) => sum + (Number(trip.fuel_consumed) || 0), 0)
    const fallbackEfficiency = 8.0
    const efficiency = totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : fallbackEfficiency

    return {
      vehicle: vehicle.registration_number,
      total_distance: totalDistance,
      total_fuel: totalFuel,
      efficiency,
    }
  })
}

export const getFleetUtilizationReport = async () => {
  const [vehicles, trips] = await Promise.all([getVehicles(), getTrips()])
  const currentTotal = vehicles.length || 1
  const now = new Date()

  return Array.from({ length: 6 }).map((_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const period = monthDate.toLocaleString('en-US', { month: 'short' })
    const periodTrips = trips.filter((trip) => trip.created_at && new Date(trip.created_at).getMonth() === monthDate.getMonth())
    const onTrip = periodTrips.filter((trip) => trip.status === 'Dispatched' || trip.status === 'In Transit').length
    const utilization = Math.round((onTrip / currentTotal) * 100)

    return { period, total: currentTotal, on_trip: onTrip, utilization }
  })
}

export const getOperationalCostReport = async () => {
  const [vehicles, expenses, fuelLogs] = await Promise.all([getVehicles(), getExpenses(), getFuelLogs()])

  return vehicles.map((vehicle) => {
    const vFuelLogs = fuelLogs.filter((log) => String(log.vehicle_id) === String(vehicle.id))
    const fuelCost = vFuelLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0)

    const vExpenses = expenses.filter((expense) => String(expense.vehicle_id) === String(vehicle.id))
    const maintenanceCost = vExpenses
      .filter((expense) => expense.type === 'Maintenance')
      .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

    return {
      vehicle: vehicle.registration_number,
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      total_cost: fuelCost + maintenanceCost,
    }
  })
}

export const getVehicleROIReport = async () => {
  const [vehicles, trips] = await Promise.all([getVehicles(), getTrips()])
  const costReport = await getOperationalCostReport()
  const completedTrips = trips.filter((trip) => trip.status === 'Completed')

  return vehicles.map((vehicle) => {
    const vehicleTrips = completedTrips.filter((trip) => String(trip.vehicle_id) === String(vehicle.id))
    const calculatedRevenue = vehicleTrips.reduce((sum, trip) => sum + (Number(trip.planned_distance) || 0) * 2.5, 0)
    const costData = costReport.find((entry) => entry.vehicle === vehicle.registration_number)
    const totalCost = costData ? costData.total_cost : 0
    const roi = vehicle.acquisition_cost > 0
      ? Number((((calculatedRevenue - totalCost) / Number(vehicle.acquisition_cost)) * 100).toFixed(2))
      : 0

    return {
      vehicle: vehicle.registration_number,
      revenue: vehicle.status === 'Retired' ? null : calculatedRevenue,
      total_cost: vehicle.status === 'Retired' ? null : totalCost,
      acquisition_cost: vehicle.acquisition_cost,
      roi: vehicle.status === 'Retired' ? null : roi,
    }
  })
}
