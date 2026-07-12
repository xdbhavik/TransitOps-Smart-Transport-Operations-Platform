import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useReports } from '../hooks/useReports'
import { ExportButton } from '../components/common/ExportButton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'

const TABS = [
  { id: 'fuel-efficiency', label: 'Fuel Efficiency', icon: 'local_gas_station' },
  { id: 'fleet-utilization', label: 'Fleet Utilization', icon: 'airport_shuttle' },
  { id: 'operational-cost', label: 'Operational Cost', icon: 'payments' },
  { id: 'vehicle-roi', label: 'Vehicle ROI', icon: 'account_balance_wallet' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-xs">
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

export default function Reports() {
  const { role } = useAuth()
  const [activeTab, setActiveTab] = useState('fuel-efficiency')
  const { fuelEfficiency, fleetUtilization, operationalCost, vehicleROI, loading, error, fetchReport } = useReports()

  useEffect(() => {
    fetchReport(activeTab)
  }, [activeTab])

  const getCurrentData = () => {
    switch (activeTab) {
      case 'fuel-efficiency': return fuelEfficiency
      case 'fleet-utilization': return fleetUtilization
      case 'operational-cost': return operationalCost
      case 'vehicle-roi': return vehicleROI
      default: return []
    }
  }

  const getExportHeaders = () => {
    switch (activeTab) {
      case 'fuel-efficiency':
        return [{ key: 'vehicle', label: 'Vehicle' }, { key: 'total_distance', label: 'Distance (km)' }, { key: 'total_fuel', label: 'Fuel (L)' }, { key: 'efficiency', label: 'Efficiency (km/L)' }]
      case 'fleet-utilization':
        return [{ key: 'period', label: 'Period' }, { key: 'total', label: 'Total Vehicles' }, { key: 'on_trip', label: 'On Trip' }, { key: 'utilization', label: 'Utilization (%)' }]
      case 'operational-cost':
        return [{ key: 'vehicle', label: 'Vehicle' }, { key: 'fuel_cost', label: 'Fuel Cost ($)' }, { key: 'maintenance_cost', label: 'Maintenance ($)' }, { key: 'total_cost', label: 'Total Cost ($)' }]
      case 'vehicle-roi':
        return [{ key: 'vehicle', label: 'Vehicle' }, { key: 'revenue', label: 'Revenue ($)' }, { key: 'total_cost', label: 'Total Cost ($)' }, { key: 'acquisition_cost', label: 'Acquisition ($)' }, { key: 'roi', label: 'ROI (%)' }]
      default: return []
    }
  }

  const currentData = getCurrentData()
  const canExport = ['financial_analyst', 'fleet_manager', 'admin'].includes(role)

  const renderFuelEfficiency = () => (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold text-on-surface mb-4">Fuel Efficiency by Vehicle (km/L)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={currentData} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e4db" vertical={false} />
            <XAxis dataKey="vehicle" tick={{ fill: '#73796e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#73796e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eef0e9' }} />
            <Bar dataKey="efficiency" name="km/L" fill="#4a6163" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card overflow-hidden">
        <div className="table-head p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Fuel Efficiency Details</p>
        </div>
        <table className="w-full">
          <thead><tr className="table-head"><th className="table-th">Vehicle</th><th className="table-th text-right">Distance (km)</th><th className="table-th text-right">Fuel (L)</th><th className="table-th text-right">Efficiency (km/L)</th></tr></thead>
          <tbody className="divide-y divide-outline-variant">
            {currentData.map((row, i) => (
              <tr key={i} className="table-row">
                <td className="table-td font-medium">{row.vehicle}</td>
                <td className="table-td text-right font-mono text-xs">{row.total_distance}</td>
                <td className="table-td text-right font-mono text-xs">{row.total_fuel}</td>
                <td className="table-td text-right"><span className="font-bold text-tertiary font-mono">{row.efficiency}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderFleetUtilization = () => (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold text-on-surface mb-4">Fleet Utilization Over Time (%)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={currentData} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e4db" vertical={false} />
            <XAxis dataKey="period" tick={{ fill: '#73796e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#73796e', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="#f9a66c" strokeWidth={2} dot={{ fill: '#f9a66c', r: 4 }} activeDot={{ fill: '#4a6163', r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderOperationalCost = () => (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-bold text-on-surface mb-4">Operational Cost by Vehicle ($)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={currentData} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e4db" vertical={false} />
            <XAxis dataKey="vehicle" tick={{ fill: '#73796e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#73796e', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eef0e9' }} />
            <Bar dataKey="fuel_cost" name="Fuel Cost" fill="#f9a66c" fillOpacity={0.8} radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="maintenance_cost" name="Maintenance" fill="#f17a7e" fillOpacity={0.8} radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="table-head"><th className="table-th">Vehicle</th><th className="table-th text-right">Fuel Cost</th><th className="table-th text-right">Maintenance</th><th className="table-th text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-outline-variant">
            {currentData.map((row, i) => (
              <tr key={i} className="table-row">
                <td className="table-td font-medium">{row.vehicle}</td>
                <td className="table-td text-right font-mono text-xs">${(row.fuel_cost || 0).toLocaleString()}</td>
                <td className="table-td text-right font-mono text-xs">${(row.maintenance_cost || 0).toLocaleString()}</td>
                <td className="table-td text-right"><span className="font-bold text-on-surface font-mono">${(row.total_cost || 0).toLocaleString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderVehicleROI = () => (
    <div className="space-y-6">
      <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-md text-sm font-mono text-on-surface-variant flex items-center">
        <span className="material-symbols-outlined text-primary mr-2 text-[18px]">functions</span>
        <span className="text-primary mr-1">Formula:</span> ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost × 100
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="table-head"><th className="table-th">Vehicle</th><th className="table-th text-right">Revenue</th><th className="table-th text-right">Total Cost</th><th className="table-th text-right">Acquisition</th><th className="table-th text-right">ROI</th></tr></thead>
          <tbody className="divide-y divide-outline-variant">
            {currentData.map((row, i) => {
              const roi = row.roi
              const roiColor = roi === null || roi === undefined ? 'text-on-surface-variant' : roi > 0 ? 'text-tertiary' : 'text-error'
              return (
                <tr key={i} className="table-row">
                  <td className="table-td font-medium">{row.vehicle}</td>
                  <td className="table-td text-right font-mono text-xs">{row.revenue ? `$${Number(row.revenue).toLocaleString()}` : 'N/A'}</td>
                  <td className="table-td text-right font-mono text-xs">{row.total_cost ? `$${Number(row.total_cost).toLocaleString()}` : '--'}</td>
                  <td className="table-td text-right font-mono text-xs">{row.acquisition_cost ? `$${Number(row.acquisition_cost).toLocaleString()}` : '--'}</td>
                  <td className="table-td text-right"><span className={`font-bold font-mono ${roiColor}`}>{roi !== null && roi !== undefined ? `${Number(roi).toFixed(1)}%` : 'N/A'}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="card p-5 h-72 skeleton" />
          <div className="card h-48 skeleton" />
        </div>
      )
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="material-symbols-outlined text-error text-5xl">error_outline</span>
          <p className="text-on-surface-variant text-sm">{error}</p>
        </div>
      )
    }
    if (!currentData.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">analytics</span>
          <p className="text-on-surface text-sm">No report data available yet.</p>
        </div>
      )
    }
    switch (activeTab) {
      case 'fuel-efficiency': return renderFuelEfficiency()
      case 'fleet-utilization': return renderFleetUtilization()
      case 'operational-cost': return renderOperationalCost()
      case 'vehicle-roi': return renderVehicleROI()
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-on-surface">Reports & Analytics</h2>
          <p className="text-sm text-on-surface-variant mt-1">Comprehensive fleet performance and financial reports.</p>
        </div>
        {canExport && (
          <ExportButton
            data={currentData}
            filename={activeTab}
            headers={getExportHeaders()}
            label="Export CSV"
          />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mb-6 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  )
}
