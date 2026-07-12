// Mock database wrapper to emulate a real backend API using localStorage
const SEED_VEHICLES = [
  { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia', type: 'Truck', max_load_capacity: 80000, odometer: 142500, acquisition_cost: 165000, status: 'Available', region: 'North' },
  { id: 2, registration_number: 'TRX-0104', name: 'Volvo VNL 860', type: 'Truck', max_load_capacity: 80000, odometer: 84200, acquisition_cost: 172500, status: 'On Trip', region: 'South' },
  { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350', type: 'Van', max_load_capacity: 4200, odometer: 210050, acquisition_cost: 48000, status: 'In Shop', region: 'West' },
  { id: 4, registration_number: 'TRX-0012', name: 'Peterbilt 579', type: 'Truck', max_load_capacity: 80000, odometer: 850900, acquisition_cost: 145000, status: 'Retired', region: 'East' },
  { id: 5, registration_number: 'TRL-904', name: 'Wabash Duraplate', type: 'Truck', max_load_capacity: 45000, odometer: 12000, acquisition_cost: 38000, status: 'Available', region: 'North' },
  { id: 6, registration_number: 'TRX-0512', name: 'Kenworth T680', type: 'Truck', max_load_capacity: 80000, odometer: 62300, acquisition_cost: 180000, status: 'Available', region: 'West' },
  { id: 7, registration_number: 'V-8812', name: 'Mercedes Sprinter', type: 'Van', max_load_capacity: 5000, odometer: 45200, acquisition_cost: 52000, status: 'On Trip', region: 'South' },
  { id: 8, registration_number: 'TRX-0990', name: 'Mack Anthem', type: 'Truck', max_load_capacity: 82000, odometer: 112000, acquisition_cost: 169000, status: 'In Shop', region: 'East' },
  { id: 9, registration_number: 'C-1022', name: 'Chevrolet Express', type: 'Van', max_load_capacity: 4100, odometer: 98100, acquisition_cost: 42000, status: 'Available', region: 'North' },
  { id: 10, registration_number: 'TRX-0789', name: 'International LT', type: 'Truck', max_load_capacity: 80000, odometer: 135400, acquisition_cost: 158000, status: 'On Trip', region: 'West' },
  { id: 11, registration_number: 'TRL-102', name: 'Great Dane Dry Van', type: 'Truck', max_load_capacity: 48000, odometer: 24000, acquisition_cost: 41000, status: 'Available', region: 'East' },
  { id: 12, registration_number: 'V-5099', name: 'RAM ProMaster', type: 'Van', max_load_capacity: 4600, odometer: 73000, acquisition_cost: 46000, status: 'Available', region: 'South' },
  { id: 13, registration_number: 'TRX-0331', name: 'Peterbilt 389', type: 'Truck', max_load_capacity: 80000, odometer: 320400, acquisition_cost: 155000, status: 'On Trip', region: 'North' },
  { id: 14, registration_number: 'V-6601', name: 'Nissan NV2500', type: 'Van', max_load_capacity: 4000, odometer: 115000, acquisition_cost: 35000, status: 'Available', region: 'West' },
  { id: 15, registration_number: 'TRX-0442', name: 'Hino 268', type: 'Truck', max_load_capacity: 26000, odometer: 94000, acquisition_cost: 85000, status: 'Available', region: 'South' },
  // 13 additional vehicles to make 28 total
  { id: 16, registration_number: 'TRX-1011', name: 'Western Star 4900', type: 'Truck', max_load_capacity: 80000, odometer: 312000, acquisition_cost: 172000, status: 'Available', region: 'North' },
  { id: 17, registration_number: 'V-2022', name: 'Ford Transit 150', type: 'Van', max_load_capacity: 3500, odometer: 61000, acquisition_cost: 39000, status: 'Available', region: 'West' },
  { id: 18, registration_number: 'TRX-1022', name: 'Kenworth W900', type: 'Truck', max_load_capacity: 85000, odometer: 421000, acquisition_cost: 195000, status: 'In Shop', region: 'South' },
  { id: 19, registration_number: 'V-3033', name: 'Chevrolet City Express', type: 'Van', max_load_capacity: 3000, odometer: 88000, acquisition_cost: 31000, status: 'Retired', region: 'East' },
  { id: 20, registration_number: 'TRX-1033', name: 'Freightliner M2', type: 'Truck', max_load_capacity: 33000, odometer: 154000, acquisition_cost: 95000, status: 'On Trip', region: 'North' },
  { id: 21, registration_number: 'TRX-1044', name: 'Volvo VHD', type: 'Truck', max_load_capacity: 66000, odometer: 122000, acquisition_cost: 148000, status: 'Available', region: 'East' },
  { id: 22, registration_number: 'V-4044', name: 'GMC Savana', type: 'Van', max_load_capacity: 4300, odometer: 185000, acquisition_cost: 40000, status: 'Available', region: 'West' },
  { id: 23, registration_number: 'TRX-1055', name: 'Peterbilt 348', type: 'Truck', max_load_capacity: 35000, odometer: 205000, acquisition_cost: 110000, status: 'Available', region: 'South' },
  { id: 24, registration_number: 'V-5055', name: 'Mercedes Sprinter Cargo', type: 'Van', max_load_capacity: 5200, odometer: 34000, acquisition_cost: 55000, status: 'On Trip', region: 'North' },
  { id: 25, registration_number: 'TRX-1066', name: 'International MV', type: 'Truck', max_load_capacity: 30000, odometer: 75000, acquisition_cost: 89000, status: 'Available', region: 'East' },
  { id: 26, registration_number: 'V-6066', name: 'RAM ProMaster City', type: 'Van', max_load_capacity: 2000, odometer: 49000, acquisition_cost: 28000, status: 'In Shop', region: 'West' },
  { id: 27, registration_number: 'TRX-1077', name: 'Mack Granite', type: 'Truck', max_load_capacity: 70000, odometer: 198000, acquisition_cost: 162000, status: 'Available', region: 'South' },
  { id: 28, registration_number: 'V-7077', name: 'Ford Transit Connect', type: 'Van', max_load_capacity: 1600, odometer: 27000, acquisition_cost: 26000, status: 'Available', region: 'North' },
]

const SEED_DRIVERS = [
  { id: 1, name: 'Marcus Vance', license_number: 'CDL-X99-442', license_category: 'HMV', license_expiry: '2027-10-12', contact_number: '555-0192', safety_score: 98, status: 'Available' },
  { id: 2, name: 'Elena Rostova', license_number: 'CDL-B44-901', license_category: 'HMV', license_expiry: '2026-01-05', contact_number: '555-0233', safety_score: 92, status: 'On Trip' },
  { id: 3, name: 'Jameson West', license_number: 'CDL-A11-002', license_category: 'HMV', license_expiry: '2025-06-01', contact_number: '555-0811', safety_score: 45, status: 'Suspended' },
  { id: 4, name: 'David Chen', license_number: 'CDL-C77-319', license_category: 'LMV', license_expiry: '2027-11-22', contact_number: '555-0455', safety_score: 99, status: 'Off Duty' },
  { id: 5, name: 'Sarah Jenkins', license_number: 'CDL-D88-124', license_category: 'HMV', license_expiry: '2028-04-15', contact_number: '555-0741', safety_score: 95, status: 'Available' },
  { id: 6, name: 'Michael O\'Connor', license_number: 'CDL-E55-890', license_category: 'HMV', license_expiry: '2026-09-30', contact_number: '555-0882', safety_score: 88, status: 'On Trip' },
  { id: 7, name: 'Amara Diop', license_number: 'CDL-F33-671', license_category: 'LMV', license_expiry: '2027-02-18', contact_number: '555-0912', safety_score: 91, status: 'Available' },
  { id: 8, name: 'Carlos Santana', license_number: 'CDL-G22-455', license_category: 'HMV', license_expiry: '2025-12-25', contact_number: '555-0104', safety_score: 82, status: 'On Trip' },
  { id: 9, name: 'Yuki Tanaka', license_number: 'CDL-H11-789', license_category: 'LMV', license_expiry: '2026-08-11', contact_number: '555-0322', safety_score: 96, status: 'Available' },
  { id: 10, name: 'Robert Miller', license_number: 'CDL-K44-012', license_category: 'HMV', license_expiry: '2027-05-19', contact_number: '555-0671', safety_score: 87, status: 'On Trip' },
  { id: 11, name: 'Aisha Rahman', license_number: 'CDL-L33-401', license_category: 'HMV', license_expiry: '2028-11-04', contact_number: '555-0552', safety_score: 94, status: 'Available' },
  { id: 12, name: 'Thomas Wright', license_number: 'CDL-M22-908', license_category: 'LMV', license_expiry: '2025-08-23', contact_number: '555-0988', safety_score: 79, status: 'Available' },
  // 8 additional drivers to make 20 total
  { id: 13, name: 'Lucas Silva', license_number: 'CDL-N11-003', license_category: 'HMV', license_expiry: '2027-04-12', contact_number: '555-0120', safety_score: 93, status: 'Available' },
  { id: 14, name: 'Chao Li', license_number: 'CDL-P22-441', license_category: 'HMV', license_expiry: '2026-11-15', contact_number: '555-0391', safety_score: 90, status: 'On Trip' },
  { id: 15, name: 'Fatima Al-Sayed', license_number: 'CDL-Q33-519', license_category: 'HMV', license_expiry: '2028-02-28', contact_number: '555-0482', safety_score: 97, status: 'Available' },
  { id: 16, name: 'John Doe', license_number: 'CDL-R44-122', license_category: 'LMV', license_expiry: '2025-04-30', contact_number: '555-0610', safety_score: 38, status: 'Suspended' },
  { id: 17, name: 'Kofi Mensah', license_number: 'CDL-S55-883', license_category: 'HMV', license_expiry: '2027-09-09', contact_number: '555-0722', safety_score: 92, status: 'Available' },
  { id: 18, name: 'Sofia Rodriguez', license_number: 'CDL-T66-091', license_category: 'HMV', license_expiry: '2026-07-22', contact_number: '555-0819', safety_score: 89, status: 'On Trip' },
  { id: 19, name: 'Viktor Smirnov', license_number: 'CDL-U77-332', license_category: 'HMV', license_expiry: '2028-06-12', contact_number: '555-0902', safety_score: 95, status: 'Available' },
  { id: 20, name: 'Emma Watson', license_number: 'CDL-V88-554', license_category: 'LMV', license_expiry: '2027-01-14', contact_number: '555-0551', safety_score: 94, status: 'Off Duty' },
]

const SEED_TRIPS = [
  { id: 1, source: 'Mumbai Warehouse', destination: 'Delhi Hub', vehicle_id: 2, driver_id: 2, cargo_weight: 5000, planned_distance: 1450, status: 'Dispatched', vehicle_name: 'Volvo VNL 860', driver_name: 'Elena Rostova' },
  { id: 2, source: 'Pune Center', destination: 'Mumbai Port', vehicle_id: 1, driver_id: 1, cargo_weight: 8000, planned_distance: 150, status: 'Completed', vehicle_name: 'Freightliner Cascadia', driver_name: 'Marcus Vance', final_odometer: 142650, fuel_consumed: 310 },
  { id: 3, source: 'Chennai Depot', destination: 'Bangalore Hub', vehicle_id: 5, driver_id: 4, cargo_weight: 3500, planned_distance: 350, status: 'Draft', vehicle_name: 'Wabash Duraplate', driver_name: 'David Chen' },
  { id: 4, source: 'Kolkata Port', destination: 'Patna Warehouse', vehicle_id: 7, driver_id: 6, cargo_weight: 4200, planned_distance: 580, status: 'Dispatched', vehicle_name: 'Mercedes Sprinter', driver_name: 'Michael O\'Connor' },
  { id: 5, source: 'Hyderabad Factory', destination: 'Chennai Hub', vehicle_id: 10, driver_id: 8, cargo_weight: 7500, planned_distance: 630, status: 'Dispatched', vehicle_name: 'International LT', driver_name: 'Carlos Santana' },
  { id: 6, source: 'Delhi Warehouse', destination: 'Jaipur Hub', vehicle_id: 1, driver_id: 5, cargo_weight: 6000, planned_distance: 270, status: 'Completed', vehicle_name: 'Freightliner Cascadia', driver_name: 'Sarah Jenkins', final_odometer: 142920, fuel_consumed: 68 },
  { id: 7, source: 'Ahmedabad Plant', destination: 'Indore Depot', vehicle_id: 9, driver_id: 7, cargo_weight: 3800, planned_distance: 400, status: 'Completed', vehicle_name: 'Chevrolet Express', driver_name: 'Amara Diop', final_odometer: 98500, fuel_consumed: 85 },
  { id: 8, source: 'Bangalore Hub', destination: 'Kochi Center', vehicle_id: 12, driver_id: 9, cargo_weight: 4500, planned_distance: 510, status: 'Completed', vehicle_name: 'RAM ProMaster', driver_name: 'Yuki Tanaka', final_odometer: 73510, fuel_consumed: 110 },
  { id: 9, source: 'Nagpur Warehouse', destination: 'Bhopal Depot', vehicle_id: 13, driver_id: 10, cargo_weight: 7800, planned_distance: 350, status: 'Dispatched', vehicle_name: 'Peterbilt 389', driver_name: 'Robert Miller' },
  { id: 10, source: 'Ludhiana Factory', destination: 'Delhi Hub', vehicle_id: 6, driver_id: 11, cargo_weight: 5200, planned_distance: 310, status: 'Completed', vehicle_name: 'Kenworth T680', driver_name: 'Aisha Rahman', final_odometer: 62610, fuel_consumed: 80 },
  { id: 11, source: 'Guwahati Depot', destination: 'Shillong Hub', vehicle_id: 15, driver_id: 12, cargo_weight: 2100, planned_distance: 100, status: 'Completed', vehicle_name: 'Hino 268', driver_name: 'Thomas Wright', final_odometer: 94100, fuel_consumed: 30 },
  { id: 12, source: 'Jaipur Factory', destination: 'Delhi Warehouse', vehicle_id: 20, driver_id: 14, cargo_weight: 7000, planned_distance: 260, status: 'Dispatched', vehicle_name: 'Freightliner M2', driver_name: 'Chao Li' },
  { id: 13, source: 'Chennai Depot', destination: 'Madurai Hub', vehicle_id: 24, driver_id: 18, cargo_weight: 4800, planned_distance: 460, status: 'Dispatched', vehicle_name: 'Mercedes Sprinter Cargo', driver_name: 'Sofia Rodriguez' },
]

const SEED_MAINTENANCE = [
  { id: 1, vehicle_id: 3, type_of_work: 'Engine Tuning & Brake Repair', date_created: '2026-07-10', status: 'Open', notes: 'Hearing squeaking noise from rear axle.', vehicle: { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350' } },
  { id: 2, vehicle_id: 8, type_of_work: 'Transmission Fluid Flush & Filter Replacement', date_created: '2026-07-09', status: 'Open', notes: 'Slight delay in gear shifting.', vehicle: { id: 8, registration_number: 'TRX-0990', name: 'Mack Anthem' } },
  { id: 3, vehicle_id: 1, type_of_work: 'Scheduled Oil Change & Tire Rotation', date_created: '2026-07-08', status: 'Completed', notes: 'Completed as scheduled.', vehicle: { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia' } },
  { id: 4, vehicle_id: 4, type_of_work: 'Alternator Replacement & Battery Check', date_created: '2026-07-05', status: 'Completed', notes: 'Vehicle refused to start, replaced alternator.', vehicle: { id: 4, registration_number: 'TRX-0012', name: 'Peterbilt 579' } },
  { id: 5, vehicle_id: 3, type_of_work: 'Radiator Leak Inspection & Repair', date_created: '2026-07-04', status: 'Completed', notes: 'Fixed minor coolant leak.', vehicle: { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350' } },
  { id: 6, vehicle_id: 13, type_of_work: 'Suspension & Shock Absorber Replacement', date_created: '2026-07-02', status: 'Open', notes: 'Rough ride reported by driver.', vehicle: { id: 13, registration_number: 'TRX-0331', name: 'Peterbilt 389' } },
  { id: 7, vehicle_id: 6, type_of_work: 'New Tires Fitting (Front Set)', date_created: '2026-06-28', status: 'Completed', notes: 'Replaced worn out front tires.', vehicle: { id: 6, registration_number: 'TRX-0512', name: 'Kenworth T680' } },
  { id: 8, vehicle_id: 18, type_of_work: 'Electrical System Diagnostic', date_created: '2026-07-11', status: 'Open', notes: 'Headlights flickering intermittently.', vehicle: { id: 18, registration_number: 'TRX-1022', name: 'Kenworth W900' } },
  { id: 9, vehicle_id: 26, type_of_work: 'A/C Compressor Replacement', date_created: '2026-07-12', status: 'Open', notes: 'A/C blowing warm air.', vehicle: { id: 26, registration_number: 'V-6066', name: 'RAM ProMaster City' } },
]

const SEED_FUEL = [
  { id: 1, vehicle_id: 1, date: '2026-07-11', liters: 120, cost: 240, vehicle: { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia' } },
  { id: 2, vehicle_id: 2, date: '2026-07-10', liters: 150, cost: 310, vehicle: { id: 2, registration_number: 'TRX-0104', name: 'Volvo VNL 860' } },
  { id: 3, vehicle_id: 6, date: '2026-07-11', liters: 110, cost: 220, vehicle: { id: 6, registration_number: 'TRX-0512', name: 'Kenworth T680' } },
  { id: 4, vehicle_id: 7, date: '2026-07-09', liters: 45, cost: 95, vehicle: { id: 7, registration_number: 'V-8812', name: 'Mercedes Sprinter' } },
  { id: 5, vehicle_id: 10, date: '2026-07-08', liters: 180, cost: 380, vehicle: { id: 10, registration_number: 'TRX-0789', name: 'International LT' } },
  { id: 6, vehicle_id: 12, date: '2026-07-07', liters: 50, cost: 110, vehicle: { id: 12, registration_number: 'V-5099', name: 'RAM ProMaster' } },
  { id: 7, vehicle_id: 13, date: '2026-07-05', liters: 210, cost: 440, vehicle: { id: 13, registration_number: 'TRX-0331', name: 'Peterbilt 389' } },
  { id: 8, vehicle_id: 15, date: '2026-07-06', liters: 75, cost: 160, vehicle: { id: 15, registration_number: 'TRX-0442', name: 'Hino 268' } },
  { id: 9, vehicle_id: 9, date: '2026-07-04', liters: 40, cost: 88, vehicle: { id: 9, registration_number: 'C-1022', name: 'Chevrolet Express' } },
  { id: 10, vehicle_id: 20, date: '2026-07-10', liters: 115, cost: 235, vehicle: { id: 20, registration_number: 'TRX-1033', name: 'Freightliner M2' } },
  { id: 11, vehicle_id: 24, date: '2026-07-09', liters: 65, cost: 135, vehicle: { id: 24, registration_number: 'V-5055', name: 'Mercedes Sprinter Cargo' } },
]

const SEED_EXPENSES = [
  { id: 1, vehicle_id: 1, type: 'Toll', date: '2026-07-11', amount: 45, notes: 'Highway toll', vehicle: { id: 1, registration_number: 'TRX-0092', name: 'Freightliner Cascadia' } },
  { id: 2, vehicle_id: 3, type: 'Maintenance', date: '2026-07-10', amount: 850, notes: 'Scheduled service check', vehicle: { id: 3, registration_number: 'V-4022', name: 'Ford Transit 350' } },
  { id: 3, vehicle_id: 2, type: 'Permit', date: '2026-07-09', amount: 150, notes: 'Interstate commercial permit', vehicle: { id: 2, registration_number: 'TRX-0104', name: 'Volvo VNL 860' } },
  { id: 4, vehicle_id: 7, type: 'Parking', date: '2026-07-08', amount: 30, notes: 'Overnight terminal parking', vehicle: { id: 7, registration_number: 'V-8812', name: 'Mercedes Sprinter' } },
  { id: 5, vehicle_id: 6, type: 'Toll', date: '2026-07-11', amount: 60, notes: 'Expressway tolls', vehicle: { id: 6, registration_number: 'TRX-0512', name: 'Kenworth T680' } },
  { id: 6, vehicle_id: 10, type: 'Toll', date: '2026-07-08', amount: 85, notes: 'National corridor toll fee', vehicle: { id: 10, registration_number: 'TRX-0789', name: 'International LT' } },
  { id: 7, vehicle_id: 13, type: 'Insurance', date: '2026-07-01', amount: 1200, notes: 'Quarterly fleet insurance premium', vehicle: { id: 13, registration_number: 'TRX-0331', name: 'Peterbilt 389' } },
  { id: 8, vehicle_id: 15, type: 'Toll', date: '2026-07-05', amount: 25, notes: 'State line border crossing toll', vehicle: { id: 15, registration_number: 'TRX-0442', name: 'Hino 268' } },
  { id: 9, vehicle_id: 20, type: 'Toll', date: '2026-07-08', amount: 40, notes: 'Expressway tolls', vehicle: { id: 20, registration_number: 'TRX-1033', name: 'Freightliner M2' } },
  { id: 10, vehicle_id: 24, type: 'Parking', date: '2026-07-09', amount: 20, notes: 'Depot parking charge', vehicle: { id: 24, registration_number: 'V-5055', name: 'Mercedes Sprinter Cargo' } },
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
  getVehicles: () => getStorageItem('to_vehicles_v4', SEED_VEHICLES),
  saveVehicles: (data) => setStorageItem('to_vehicles_v4', data),

  getDrivers: () => getStorageItem('to_drivers_v4', SEED_DRIVERS),
  saveDrivers: (data) => setStorageItem('to_drivers_v4', data),

  getTrips: () => getStorageItem('to_trips_v4', SEED_TRIPS),
  saveTrips: (data) => setStorageItem('to_trips_v4', data),

  getMaintenance: () => getStorageItem('to_maintenance_v4', SEED_MAINTENANCE),
  saveMaintenance: (data) => setStorageItem('to_maintenance_v4', data),

  getFuel: () => getStorageItem('to_fuel_v4', SEED_FUEL),
  saveFuel: (data) => setStorageItem('to_fuel_v4', data),

  getExpenses: () => getStorageItem('to_expenses_v4', SEED_EXPENSES),
  saveExpenses: (data) => setStorageItem('to_expenses_v4', data),
}
