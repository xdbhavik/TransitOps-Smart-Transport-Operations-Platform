package com.Transitops.odoo.dto.response.dashboard;

import java.math.BigDecimal;

public final class DashboardResponses {

    private DashboardResponses() {
    }

    public record SummaryResponse(
            long totalVehicles,
            long activeVehicles,
            long availableVehicles,
            long vehiclesInMaintenance,
            long totalDrivers,
            long driversOnDuty,
            long activeTrips,
            long pendingTrips,
            double fleetUtilization,
            BigDecimal totalFuelCost,
            BigDecimal totalExpenses,
            BigDecimal totalOperationalCost
    ) {
    }

    public record VehicleAnalyticsResponse(
            long totalVehicles,
            long activeVehicles,
            long availableVehicles,
            long onTripVehicles,
            long inShopVehicles,
            long retiredVehicles
    ) {
    }

    public record DriverAnalyticsResponse(
            long totalDrivers,
            long availableDrivers,
            long onTripDrivers,
            long offDutyDrivers,
            long suspendedDrivers
    ) {
    }

    public record TripAnalyticsResponse(
            long totalTrips,
            long draftTrips,
            long activeTrips,
            long completedTrips,
            long cancelledTrips
    ) {
    }

    public record MaintenanceAnalyticsResponse(
            long vehiclesInMaintenance,
            long completedMaintenance,
            BigDecimal totalMaintenanceCost
    ) {
    }

    public record FuelAnalyticsResponse(
            double totalFuelConsumed,
            BigDecimal fuelCost,
            double averageMileage,
            double fuelEfficiency
    ) {
    }

    public record ExpenseAnalyticsResponse(
            BigDecimal totalExpense,
            BigDecimal fuelExpense,
            BigDecimal tollExpense,
            BigDecimal maintenanceExpense,
            BigDecimal parkingExpense,
            BigDecimal insuranceExpense,
            BigDecimal otherExpense
    ) {
    }

    public record VehicleHealthResponse(
            double averageHealthScore,
            long healthyVehicles,
            long criticalVehicles
    ) {
    }

    public record CarbonAnalyticsResponse(
            double totalCo2Emission,
            double todaysCo2,
            double monthlyCo2
    ) {
    }
}