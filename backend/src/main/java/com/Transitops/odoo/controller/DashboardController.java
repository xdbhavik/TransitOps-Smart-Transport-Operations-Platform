package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.response.dashboard.DashboardResponses;
import com.Transitops.odoo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardResponses.SummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/vehicles")
    public ResponseEntity<DashboardResponses.VehicleAnalyticsResponse> getVehicles() {
        return ResponseEntity.ok(dashboardService.getVehicleAnalytics());
    }

    @GetMapping("/drivers")
    public ResponseEntity<DashboardResponses.DriverAnalyticsResponse> getDrivers() {
        return ResponseEntity.ok(dashboardService.getDriverAnalytics());
    }

    @GetMapping("/trips")
    public ResponseEntity<DashboardResponses.TripAnalyticsResponse> getTrips() {
        return ResponseEntity.ok(dashboardService.getTripAnalytics());
    }

    @GetMapping("/maintenance")
    public ResponseEntity<DashboardResponses.MaintenanceAnalyticsResponse> getMaintenance() {
        return ResponseEntity.ok(dashboardService.getMaintenanceAnalytics());
    }

    @GetMapping("/fuel")
    public ResponseEntity<DashboardResponses.FuelAnalyticsResponse> getFuel() {
        return ResponseEntity.ok(dashboardService.getFuelAnalytics());
    }

    @GetMapping("/expenses")
    public ResponseEntity<DashboardResponses.ExpenseAnalyticsResponse> getExpenses() {
        return ResponseEntity.ok(dashboardService.getExpenseAnalytics());
    }

    @GetMapping("/vehicle-health")
    public ResponseEntity<DashboardResponses.VehicleHealthResponse> getVehicleHealth() {
        return ResponseEntity.ok(dashboardService.getVehicleHealthAnalytics());
    }

    @GetMapping("/carbon")
    public ResponseEntity<DashboardResponses.CarbonAnalyticsResponse> getCarbon() {
        return ResponseEntity.ok(dashboardService.getCarbonAnalytics());
    }

    @GetMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf() {
        byte[] pdf = dashboardService.exportDashboardPdf();
        String filename = "dashboard-report-" + LocalDate.now() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = dashboardService.exportDashboardCsv();
        String filename = "dashboard-report-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}