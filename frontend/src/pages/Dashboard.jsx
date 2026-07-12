import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api/reportService'
import { KPICard } from '../components/common/KPICard'
import { CardSkeleton } from '../components/common/LoadingSkeleton'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'

const VEHICLE_STATUS_COLORS = ['#f9a66c', '#4a6163', '#ffc94b', '#f17a7e']
const TRIP_STATUS_COLORS = ['#ffc94b', '#4a6163', '#f9a66c', '#f17a7e']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-xs">
        {label && <p className="text-on-surface-variant mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.fill || p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ vehicleType: '', vehicleStatus: '', region: '' })

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardStats(filters)
      setStats(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
      // Use demo data so UI is always visible
      setStats(getDemoStats())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [filters])

  const getDemoStats = () => ({
    activeVehicles: 53,
    availableVehicles: 42,
    vehiclesInMaintenance: 5,
    activeTrips: 18,
    pendingTrips: 9,
    driversOnDuty: 26,
    totalVehicles: 112,
    fleetUtilization: 47,
    vehicleStatusDistribution: [
      { name: 'Available', value: 42 },
      { name: 'On Trip', value: 53 },
      { name: 'In Shop', value: 5 },
      { name: 'Retired', value: 12 },
    ],
    tripStatusBreakdown: [
      { name: 'Draft', count: 9 },
      { name: 'Dispatched', count: 18 },
      { name: 'Completed', count: 87 },
      { name: 'Cancelled', count: 6 },
    ],
  })

  const kpis = stats ? [
    { label: 'Active Vehicles', value: stats.activeVehicles ?? '--', accent: 'primary', icon: 'directions_car' },
    { label: 'Available Vehicles', value: stats.availableVehicles ?? '--', accent: 'tertiary', icon: 'check_circle' },
    { label: 'In Maintenance', value: stats.vehiclesInMaintenance ?? '--', accent: 'error', icon: 'build' },
    { label: 'Active Trips', value: stats.activeTrips ?? '--', accent: null, icon: 'route' },
    { label: 'Pending Trips', value: stats.pendingTrips ?? '--', accent: null, icon: 'pending' },
    { label: 'Drivers On Duty', value: stats.driversOnDuty ?? '--', accent: null, icon: 'badge' },
    { label: 'Fleet Utilization', value: `${stats.fleetUtilization ?? '--'}%`, accent: null, icon: 'percent' },
  ] : []

  return (
    <div>
      {/* Page Header + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-on-surface">Dashboard</h2>
          <p className="text-sm text-on-surface-variant mt-1">Live fleet monitoring and operations matrix</p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.vehicleType}
            onChange={e => setFilters(f => ({ ...f, vehicleType: e.target.value }))}
            className="bg-surface-container border border-outline-variant text-sm text-on-surface rounded-md py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary"
          >
            <option value="">All Vehicle Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Bike">Bike</option>
            <option value="Car">Car</option>
          </select>
          <select
            value={filters.vehicleStatus}
            onChange={e => setFilters(f => ({ ...f, vehicleStatus: e.target.value }))}
            className="bg-surface-container border border-outline-variant text-sm text-on-surface rounded-md py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
          <input
            type="text"
            value={filters.region}
            onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
            placeholder="Filter by region..."
            className="bg-surface-container border border-outline-variant text-sm text-on-surface rounded-md py-2 px-3 w-40 focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50"
          />
          <button
            onClick={fetchStats}
            className="btn-secondary py-2"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">warning</span>
          <p className="text-sm text-on-surface-variant">{error} — showing demo data</p>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <CardSkeleton count={7} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>
      )}

      {/* Charts */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fleet Status Donut Chart */}
          <div className="card p-5 flex flex-col">
            <h3 className="font-bold text-on-surface text-base mb-4">Fleet Status Distribution</h3>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.vehicleStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.vehicleStatusDistribution?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={VEHICLE_STATUS_COLORS[index % VEHICLE_STATUS_COLORS.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {stats.vehicleStatusDistribution?.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: VEHICLE_STATUS_COLORS[i] }} />
                  <span className="text-xs text-on-surface-variant">{item.name}</span>
                  <span className="text-xs font-bold text-on-surface ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Status Bar Chart */}
          <div className="card p-5 flex flex-col lg:col-span-2">
            <h3 className="font-bold text-on-surface text-base mb-4">Trip Status Breakdown</h3>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.tripStatusBreakdown} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e4db" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#73796e', fontSize: 12 }}
                    axisLine={{ stroke: '#e1e4db' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#73796e', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eef0e9' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.tripStatusBreakdown?.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={TRIP_STATUS_COLORS[index % TRIP_STATUS_COLORS.length]}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
