import { mockDb } from './mockDb'

export const getDashboardStats = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  let vehicles = mockDb.getVehicles()
  let trips = mockDb.getTrips()
  let drivers = mockDb.getDrivers()

  // Apply filters if present
  if (filters.vehicleType) {
    vehicles = vehicles.filter(v => v.type === filters.vehicleType)
  }
  if (filters.vehicleStatus) {
    vehicles = vehicles.filter(v => v.status === filters.vehicleStatus)
  }

  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length
  const vehiclesInMaintenance = vehicles.filter(v => v.status === 'In Shop').length
  const retiredVehicles = vehicles.filter(v => v.status === 'Retired').length

  const activeTrips = trips.filter(t => t.status === 'Dispatched').length
  const pendingTrips = trips.filter(t => t.status === 'Draft').length
  const completedTrips = trips.filter(t => t.status === 'Completed').length
  const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length

  const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length

  const totalVehicles = vehicles.length
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
  await new Promise(resolve => setTimeout(resolve, 300))
  const vehicles = mockDb.getVehicles()
  const trips = mockDb.getTrips().filter(t => t.status === 'Completed')

  return vehicles.map(v => {
    // Sum distance of completed trips
    const vehicleTrips = trips.filter(t => String(t.vehicle_id) === String(v.id))
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.planned_distance || 0), 0)
    const totalFuel = vehicleTrips.reduce((sum, t) => sum + (t.fuel_consumed || 0), 0)

    // Fallback to stable default efficiency if no trips recorded yet
    const fallbackEfficiency = {
      1: 8.4,
      2: 9.1,
      3: 6.2,
      4: 5.5,
      5: 7.8
    }[v.id] || 8.0

    const efficiency = totalFuel > 0 ? Number((totalDistance / totalFuel).toFixed(2)) : fallbackEfficiency

    return {
      vehicle: v.registration_number,
      total_distance: totalDistance || (v.id === 1 ? 2500 : v.id === 2 ? 1800 : 0),
      total_fuel: totalFuel || (v.id === 1 ? 300 : v.id === 2 ? 200 : 0),
      efficiency,
    }
  })
}

export const getFleetUtilizationReport = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    { period: 'Jan', total: 100, on_trip: 78, utilization: 78 },
    { period: 'Feb', total: 105, on_trip: 82, utilization: 78 },
    { period: 'Mar', total: 110, on_trip: 92, utilization: 84 },
    { period: 'Apr', total: 112, on_trip: 95, utilization: 85 },
    { period: 'May', total: 112, on_trip: 99, utilization: 88 },
    { period: 'Jun', total: 112, on_trip: 103, utilization: 92 },
  ]
}

export const getOperationalCostReport = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const vehicles = mockDb.getVehicles()
  const expenses = mockDb.getExpenses()
  const fuelLogs = mockDb.getFuel()

  return vehicles.map(v => {
    // Aggregate fuel costs
    const vFuelLogs = fuelLogs.filter(f => String(f.vehicle_id) === String(v.id))
    const fuelCost = vFuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0)

    // Aggregate maintenance costs
    const vExpenses = expenses.filter(e => String(e.vehicle_id) === String(v.id))
    const maintenanceCost = vExpenses
      .filter(e => e.type === 'Maintenance')
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    const fallbackFuel = { 1: 1200, 2: 1500, 3: 400 }[v.id] || 0
    const fallbackMaint = { 1: 850, 3: 1200 }[v.id] || 0

    const fCost = fuelCost || fallbackFuel
    const mCost = maintenanceCost || fallbackMaint

    return {
      vehicle: v.registration_number,
      fuel_cost: fCost,
      maintenance_cost: mCost,
      total_cost: fCost + mCost,
    }
  })
}

export const getVehicleROIReport = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const vehicles = mockDb.getVehicles()
  const trips = mockDb.getTrips().filter(t => t.status === 'Completed')

  // Load operational costs
  const costReport = await getOperationalCostReport()

  return vehicles.map(v => {
    // Generate revenue: e.g. $2.50 per km on completed trips
    const vehicleTrips = trips.filter(t => String(t.vehicle_id) === String(v.id))
    const calculatedRevenue = vehicleTrips.reduce((sum, t) => sum + (t.planned_distance || 0) * 2.5, 0)

    const costData = costReport.find(c => c.vehicle === v.registration_number)
    const totalCost = costData ? costData.total_cost : 0

    const fallbackRevenue = { 1: 8500, 2: 9500, 3: 2100 }[v.id] || 0
    const revenue = calculatedRevenue || fallbackRevenue

    // ROI = (Revenue - Total Cost) / Acquisition Cost * 100
    const roi = v.acquisition_cost > 0
      ? Number((((revenue - totalCost) / v.acquisition_cost) * 100).toFixed(2))
      : 0

    return {
      vehicle: v.registration_number,
      revenue: v.status === 'Retired' ? null : revenue,
      total_cost: v.status === 'Retired' ? null : totalCost,
      acquisition_cost: v.acquisition_cost,
      roi: v.status === 'Retired' ? null : roi,
    }
  })
}
