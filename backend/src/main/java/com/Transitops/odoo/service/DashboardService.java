package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.response.dashboard.DashboardResponses;

public interface DashboardService {

    DashboardResponses.SummaryResponse getSummary();

    DashboardResponses.VehicleAnalyticsResponse getVehicleAnalytics();

    DashboardResponses.DriverAnalyticsResponse getDriverAnalytics();

    DashboardResponses.TripAnalyticsResponse getTripAnalytics();

    DashboardResponses.MaintenanceAnalyticsResponse getMaintenanceAnalytics();

    DashboardResponses.FuelAnalyticsResponse getFuelAnalytics();

    DashboardResponses.ExpenseAnalyticsResponse getExpenseAnalytics();

    DashboardResponses.VehicleHealthResponse getVehicleHealthAnalytics();

    DashboardResponses.CarbonAnalyticsResponse getCarbonAnalytics();

    byte[] exportDashboardPdf();

    byte[] exportDashboardCsv();
}