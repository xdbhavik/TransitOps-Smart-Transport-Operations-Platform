// Mock database wrapper to emulate a real backend API using localStorage
const SEED_VEHICLES = [
  { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia', type: 'Truck', max_load_capacity: 80000, odometer: 142500, acquisition_cost: 165000, status: 'Available' },
  { id: 2, registration_number: 'TRX-0104', name: 'Volvo VNL 860', type: 'Truck', max_load_capacity: 80000, odometer: 84200, acquisition_cost: 172500, status: 'On Trip' },
  { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350', type: 'Van', max_load_capacity: 4200, odometer: 210050, acquisition_cost: 48000, status: 'In Shop' },
  { id: 4, registration_number: 'TRX-0012', name: 'Peterbilt 579', type: 'Truck', max_load_capacity: 80000, odometer: 850900, acquisition_cost: 145000, status: 'Retired' },
  { id: 5, registration_number: 'TRL-904', name: 'Wabash Duraplate', type: 'Truck', max_load_capacity: 45000, odometer: 12000, acquisition_cost: 38000, status: 'Available' },
]

const SEED_DRIVERS = [
  { id: 1, name: 'Marcus Vance', license_number: 'CDL-X99-442', license_category: 'HMV', license_expiry: '2027-10-12', contact_number: '555-0192', safety_score: 98, status: 'Available' },
  { id: 2, name: 'Elena Rostova', license_number: 'CDL-B44-901', license_category: 'HMV', license_expiry: '2026-01-05', contact_number: '555-0233', safety_score: 92, status: 'On Trip' },
  { id: 3, name: 'Jameson West', license_number: 'CDL-A11-002', license_category: 'HMV', license_expiry: '2025-06-01', contact_number: '555-0811', safety_score: 45, status: 'Suspended' },
  { id: 4, name: 'David Chen', license_number: 'CDL-C77-319', license_category: 'LMV', license_expiry: '2027-11-22', contact_number: '555-0455', safety_score: 99, status: 'Off Duty' },
]

const SEED_TRIPS = [
  { id: 1, source: 'Mumbai Warehouse', destination: 'Delhi Hub', vehicle_id: 2, driver_id: 2, cargo_weight: 5000, planned_distance: 1450, status: 'Dispatched', vehicle_name: 'Volvo VNL 860', driver_name: 'Elena Rostova' },
  { id: 2, source: 'Pune Center', destination: 'Mumbai Port', vehicle_id: 1, driver_id: 1, cargo_weight: 8000, planned_distance: 150, status: 'Completed', vehicle_name: 'Freightliner Cascadia', driver_name: 'Marcus Vance', final_odometer: 142650, fuel_consumed: 310 },
  { id: 3, source: 'Chennai Depot', destination: 'Bangalore Hub', vehicle_id: 5, driver_id: 4, cargo_weight: 3500, planned_distance: 350, status: 'Draft', vehicle_name: 'Wabash Duraplate', driver_name: 'David Chen' },
]

const SEED_MAINTENANCE = [
  { id: 1, vehicle_id: 3, type_of_work: 'Engine Tuning & Brake Repair', date_created: '2026-07-10', status: 'Open', notes: 'Hearing squeaking noise from rear axle.', vehicle: { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350' } },
]

const SEED_FUEL = [
  { id: 1, vehicle_id: 1, date: '2026-07-11', liters: 120, cost: 240, vehicle: { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia' } },
  { id: 2, vehicle_id: 2, date: '2026-07-10', liters: 150, cost: 310, vehicle: { id: 2, registration_number: 'TRX-0104', name: 'Volvo VNL 860' } },
]

const SEED_EXPENSES = [
  { id: 1, vehicle_id: 1, type: 'Toll', date: '2026-07-11', amount: 45, notes: 'Highway toll', vehicle: { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia' } },
  { id: 2, vehicle_id: 3, type: 'Maintenance', date: '2026-07-10', amount: 850, notes: 'Scheduled service check', vehicle: { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350' } },
]

const getStorageItem = (key, seedData) => {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seedData))
    return seedData
  }
  return JSON.parse(data)
}

const setStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const mockDb = {
  getVehicles: () => getStorageItem('to_vehicles', SEED_VEHICLES),
  saveVehicles: (data) => setStorageItem('to_vehicles', data),

  getDrivers: () => getStorageItem('to_drivers', SEED_DRIVERS),
  saveDrivers: (data) => setStorageItem('to_drivers', data),

  getTrips: () => getStorageItem('to_trips', SEED_TRIPS),
  saveTrips: (data) => setStorageItem('to_trips', data),

  getMaintenance: () => getStorageItem('to_maintenance', SEED_MAINTENANCE),
  saveMaintenance: (data) => setStorageItem('to_maintenance', data),

  getFuel: () => getStorageItem('to_fuel', SEED_FUEL),
  saveFuel: (data) => setStorageItem('to_fuel', data),

  getExpenses: () => getStorageItem('to_expenses', SEED_EXPENSES),
  saveExpenses: (data) => setStorageItem('to_expenses', data),
}
