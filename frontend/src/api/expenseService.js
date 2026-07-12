import axiosInstance from './axiosInstance'
import { apiErrorMessage, humanizeEnum, toDateOnly, toExpenseTypeEnum, toLocalDateTime, toNumber } from './backendTransforms'
import { getTrips } from './tripService'
import { getVehicles } from './vehicleService'

const mapExpense = (expense, vehicleMap = {}, tripMap = {}) => {
  const vehicle = vehicleMap[expense.vehicleId] || vehicleMap[expense.vehicle_id] || null
  const trip = tripMap[expense.tripId] || tripMap[expense.trip_id] || null

  return {
    id: expense.id,
    vehicle_id: expense.vehicleId,
    trip_id: expense.tripId,
    type: humanizeEnum(expense.expenseType || expense.type),
    date: toDateOnly(expense.expenseDate || expense.date),
    amount: expense.amount,
    notes: expense.description || expense.notes,
    vehicle,
    trip,
  }
}

const buildExpenseRequest = async (payload) => {
  const trips = await getTrips()
  const matchingTrips = trips.filter((trip) => String(trip.vehicle_id) === String(payload.vehicle_id))
  const tripId = payload.trip_id || matchingTrips[0]?.id || trips[0]?.id

  return {
    vehicleId: payload.vehicle_id,
    tripId,
    expenseType: toExpenseTypeEnum(payload.type),
    amount: toNumber(payload.amount),
    description: payload.notes,
    expenseDate: payload.date,
  }
}

export const getExpenses = async (params = {}) => {
  const [vehicles, trips, response] = await Promise.all([
    getVehicles(),
    getTrips(),
    axiosInstance.get('/api/expenses'),
  ])

  const vehicleMap = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle]))
  const tripMap = Object.fromEntries(trips.map((trip) => [trip.id, trip]))
  let list = Array.isArray(response.data) ? response.data.map((expense) => mapExpense(expense, vehicleMap, tripMap)) : []

  if (params.vehicle_id) {
    list = list.filter((expense) => String(expense.vehicle_id) === String(params.vehicle_id))
  }
  return list
}

export const getExpense = async (id) => {
  const expenses = await getExpenses()
  const item = expenses.find((expense) => String(expense.id) === String(id))
  if (!item) throw new Error('Expense not found')
  return item
}

export const createExpense = async (payload) => {
  try {
    const requestBody = await buildExpenseRequest(payload)
    const { data } = await axiosInstance.post('/api/expenses', requestBody)
    const vehicles = await getVehicles()
    const trips = await getTrips()
    const vehicle = vehicles.find((item) => String(item.id) === String(payload.vehicle_id)) || null
    const trip = trips.find((item) => String(item.id) === String(data.tripId)) || null

    return {
      id: data.id,
      vehicle_id: data.vehicleId,
      trip_id: data.tripId,
      type: humanizeEnum(data.expenseType),
      date: toDateOnly(data.expenseDate),
      amount: data.amount,
      notes: data.description,
      vehicle,
      trip,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    }
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to create expense'))
  }
}

export const updateExpense = async (id, payload) => {
  try {
    const requestBody = await buildExpenseRequest(payload)
    const { data } = await axiosInstance.put(`/api/expenses/${id}`, requestBody)
    return mapExpense(data, Object.create(null), Object.create(null))
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to update expense'))
  }
}

export const deleteExpense = async (id) => {
  try {
    await axiosInstance.delete(`/api/expenses/${id}`)
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to delete expense'))
  }
}

export const getExpensesByVehicle = async (vehicleId) => {
  try {
    const { data } = await axiosInstance.get(`/api/expenses/vehicle/${vehicleId}`)
    return Array.isArray(data) ? data.map((expense) => mapExpense(expense, Object.create(null), Object.create(null))) : []
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to load vehicle expenses'))
  }
}

export const getExpensesByTrip = async (tripId) => {
  try {
    const { data } = await axiosInstance.get(`/api/expenses/trip/${tripId}`)
    return Array.isArray(data) ? data.map((expense) => mapExpense(expense, Object.create(null), Object.create(null))) : []
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Failed to load trip expenses'))
  }
}

export const getOperationalCostSummary = async () => {
  const [expenses, vehicles] = await Promise.all([getExpenses(), getVehicles()])
  return vehicles.map((vehicle) => {
    const totalExpense = expenses
      .filter((expense) => String(expense.vehicle_id) === String(vehicle.id))
      .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

    return {
      vehicle_id: vehicle.id,
      registration_number: vehicle.registration_number,
      name: vehicle.name,
      total_cost: totalExpense,
    }
  })
}
