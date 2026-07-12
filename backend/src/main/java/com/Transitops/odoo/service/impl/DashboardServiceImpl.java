package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.response.dashboard.DashboardResponses;
import com.Transitops.odoo.entity.CarbonEmission;
import com.Transitops.odoo.entity.Expense;
import com.Transitops.odoo.entity.FuelLog;
import com.Transitops.odoo.entity.Maintenance;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.entity.VehicleHealth;
import com.Transitops.odoo.enums.DriverStatus;
import com.Transitops.odoo.enums.ExpenseType;
import com.Transitops.odoo.enums.MaintenanceStatus;
import com.Transitops.odoo.enums.TripStatus;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.repository.CarbonEmissionRepository;
import com.Transitops.odoo.repository.DriverRepository;
import com.Transitops.odoo.repository.ExpenseRepository;
import com.Transitops.odoo.repository.FuelLogRepository;
import com.Transitops.odoo.repository.MaintenanceRepository;
import com.Transitops.odoo.repository.TripRepository;
import com.Transitops.odoo.repository.VehicleHealthRepository;
import com.Transitops.odoo.repository.VehicleRepository;
import com.Transitops.odoo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final FuelLogRepository fuelLogRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleHealthRepository vehicleHealthRepository;
    private final CarbonEmissionRepository carbonEmissionRepository;

    @Override
    public DashboardResponses.SummaryResponse getSummary() {
        DashboardResponses.VehicleAnalyticsResponse vehicles = getVehicleAnalytics();
        DashboardResponses.DriverAnalyticsResponse drivers = getDriverAnalytics();
        DashboardResponses.TripAnalyticsResponse trips = getTripAnalytics();
        DashboardResponses.FuelAnalyticsResponse fuel = getFuelAnalytics();
        DashboardResponses.ExpenseAnalyticsResponse expenses = getExpenseAnalytics();

        long vehiclesInMaintenance = vehicles.inShopVehicles();
        double fleetUtilization = vehicles.totalVehicles() == 0 ? 0.0 : (vehicles.activeVehicles() * 100.0) / vehicles.totalVehicles();
        BigDecimal totalOperationalCost = fuel.fuelCost().add(expenses.totalExpense()).subtract(expenses.fuelExpense());

        return new DashboardResponses.SummaryResponse(
                vehicles.totalVehicles(),
                vehicles.activeVehicles(),
                vehicles.availableVehicles(),
                vehiclesInMaintenance,
                drivers.totalDrivers(),
                drivers.availableDrivers() + drivers.onTripDrivers(),
                trips.activeTrips(),
                trips.draftTrips(),
                fleetUtilization,
                fuel.fuelCost(),
                expenses.totalExpense(),
                totalOperationalCost
        );
    }

    @Override
    public DashboardResponses.VehicleAnalyticsResponse getVehicleAnalytics() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        long availableVehicles = countVehicleStatus(vehicles, VehicleStatus.AVAILABLE);
        long onTripVehicles = countVehicleStatus(vehicles, VehicleStatus.ON_TRIP);
        long inShopVehicles = countVehicleStatus(vehicles, VehicleStatus.IN_SHOP);
        long retiredVehicles = countVehicleStatus(vehicles, VehicleStatus.RETIRED);
        return new DashboardResponses.VehicleAnalyticsResponse(
                vehicles.size(),
                availableVehicles + onTripVehicles + inShopVehicles,
                availableVehicles,
                onTripVehicles,
                inShopVehicles,
                retiredVehicles
        );
    }

    @Override
    public DashboardResponses.DriverAnalyticsResponse getDriverAnalytics() {
        return new DashboardResponses.DriverAnalyticsResponse(
                driverRepository.count(),
                driverRepository.findByStatus(DriverStatus.AVAILABLE).size(),
                driverRepository.findByStatus(DriverStatus.ON_TRIP).size(),
                driverRepository.findByStatus(DriverStatus.OFF_DUTY).size(),
                driverRepository.findByStatus(DriverStatus.SUSPENDED).size()
        );
    }

    @Override
    public DashboardResponses.TripAnalyticsResponse getTripAnalytics() {
        List<TripStatus> activeStatuses = List.of(TripStatus.DISPATCHED, TripStatus.IN_TRANSIT);
        return new DashboardResponses.TripAnalyticsResponse(
                tripRepository.count(),
                tripRepository.findByTripStatus(TripStatus.DRAFT).size(),
                tripRepository.findByTripStatusIn(activeStatuses).size(),
                tripRepository.findByTripStatus(TripStatus.COMPLETED).size(),
                tripRepository.findByTripStatus(TripStatus.CANCELLED).size()
        );
    }

    @Override
    public DashboardResponses.MaintenanceAnalyticsResponse getMaintenanceAnalytics() {
        List<Maintenance> maintenanceLogs = maintenanceRepository.findAll();
                BigDecimal totalMaintenanceCost = BigDecimal.ZERO;
                for (Maintenance maintenance : maintenanceLogs) {
                        if (maintenance.getCost() != null) {
                                totalMaintenanceCost = totalMaintenanceCost.add(maintenance.getCost());
                        }
                }

        long completedMaintenance = maintenanceRepository.findByStatus(MaintenanceStatus.COMPLETED).size();
        long vehiclesInMaintenance = countVehicleStatus(vehicleRepository.findAll(), VehicleStatus.IN_SHOP);

        return new DashboardResponses.MaintenanceAnalyticsResponse(
                vehiclesInMaintenance,
                completedMaintenance,
                totalMaintenanceCost
        );
    }

    @Override
    public DashboardResponses.FuelAnalyticsResponse getFuelAnalytics() {
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();
                double totalFuelConsumed = 0.0;
                BigDecimal fuelCost = BigDecimal.ZERO;
                double mileageTotal = 0.0;
                long mileageCount = 0;
                for (FuelLog fuelLog : fuelLogs) {
                        if (fuelLog.getLiters() != null) {
                                totalFuelConsumed += fuelLog.getLiters();
                        }
                        if (fuelLog.getCost() != null) {
                                fuelCost = fuelCost.add(fuelLog.getCost());
                        }
                        if (fuelLog.getMileage() != null) {
                                mileageTotal += fuelLog.getMileage();
                                mileageCount++;
                        }
                }
                double averageMileage = mileageCount == 0 ? 0.0 : mileageTotal / mileageCount;

                double fuelEfficiencyTotal = 0.0;
                long fuelEfficiencyCount = 0;
                for (Vehicle vehicle : vehicleRepository.findAll()) {
                        if (vehicle.getAverageMileage() != null) {
                                fuelEfficiencyTotal += vehicle.getAverageMileage();
                                fuelEfficiencyCount++;
                        }
                }
                double fuelEfficiency = fuelEfficiencyCount == 0 ? 0.0 : fuelEfficiencyTotal / fuelEfficiencyCount;

        return new DashboardResponses.FuelAnalyticsResponse(
                totalFuelConsumed,
                fuelCost,
                averageMileage,
                fuelEfficiency
        );
    }

    @Override
    public DashboardResponses.ExpenseAnalyticsResponse getExpenseAnalytics() {
        List<Expense> expenses = expenseRepository.findAll();
        BigDecimal totalExpense = sumExpenseType(expenses, null);
        return new DashboardResponses.ExpenseAnalyticsResponse(
                totalExpense,
                sumExpenseType(expenses, ExpenseType.FUEL),
                sumExpenseType(expenses, ExpenseType.TOLL),
                sumExpenseType(expenses, ExpenseType.MAINTENANCE),
                sumExpenseType(expenses, ExpenseType.PARKING),
                sumExpenseType(expenses, ExpenseType.INSURANCE),
                sumExpenseType(expenses, ExpenseType.OTHER)
        );
    }

    @Override
    public DashboardResponses.VehicleHealthResponse getVehicleHealthAnalytics() {
        List<VehicleHealth> healthRecords = vehicleHealthRepository.findAll();
                double averageHealthScore;
                double healthScoreTotal = 0.0;
                long healthScoreCount = 0;
                for (VehicleHealth health : healthRecords) {
                        if (health.getHealthScore() != null) {
                                healthScoreTotal += health.getHealthScore();
                                healthScoreCount++;
                        }
                }
                if (healthScoreCount > 0) {
                        averageHealthScore = healthScoreTotal / healthScoreCount;
                } else {
                        double vehicleHealthTotal = 0.0;
                        long vehicleHealthCount = 0;
                        for (Vehicle vehicle : vehicleRepository.findAll()) {
                                if (vehicle.getHealthScore() != null) {
                                        vehicleHealthTotal += vehicle.getHealthScore();
                                        vehicleHealthCount++;
                                }
                        }
                        averageHealthScore = vehicleHealthCount == 0 ? 0.0 : vehicleHealthTotal / vehicleHealthCount;
                }

        List<Vehicle> vehicles = vehicleRepository.findAll();
                long healthyVehicles = 0;
                long criticalVehicles = 0;
                for (Vehicle vehicle : vehicles) {
                        if (vehicle.getHealthScore() == null) {
                                continue;
                        }
                        if (vehicle.getHealthScore() >= 80) {
                                healthyVehicles++;
                        }
                        if (vehicle.getHealthScore() < 50) {
                                criticalVehicles++;
                        }
                }

        return new DashboardResponses.VehicleHealthResponse(
                averageHealthScore,
                healthyVehicles,
                criticalVehicles
        );
    }

    @Override
    public DashboardResponses.CarbonAnalyticsResponse getCarbonAnalytics() {
        List<CarbonEmission> emissions = carbonEmissionRepository.findAll();
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();

                double total = 0.0;
                double todays = 0.0;
                double monthly = 0.0;
                for (CarbonEmission emission : emissions) {
                        if (emission.getTotalEmission() == null) {
                                continue;
                        }
                        total += emission.getTotalEmission();
                        if (emission.getEmissionDate() != null) {
                                LocalDate emissionDate = emission.getEmissionDate().toLocalDate();
                                if (emissionDate.isEqual(today)) {
                                        todays += emission.getTotalEmission();
                                }
                                if (YearMonth.from(emissionDate).equals(currentMonth)) {
                                        monthly += emission.getTotalEmission();
                                }
                        }
                }

        return new DashboardResponses.CarbonAnalyticsResponse(total, todays, monthly);
    }

        @Override
        public byte[] exportDashboardPdf() {
                DashboardResponses.SummaryResponse summary = getSummary();
                DashboardResponses.VehicleAnalyticsResponse vehicles = getVehicleAnalytics();
                DashboardResponses.DriverAnalyticsResponse drivers = getDriverAnalytics();
                DashboardResponses.TripAnalyticsResponse trips = getTripAnalytics();
                DashboardResponses.MaintenanceAnalyticsResponse maintenance = getMaintenanceAnalytics();
                DashboardResponses.FuelAnalyticsResponse fuel = getFuelAnalytics();
                DashboardResponses.ExpenseAnalyticsResponse expenses = getExpenseAnalytics();
                DashboardResponses.VehicleHealthResponse health = getVehicleHealthAnalytics();
                DashboardResponses.CarbonAnalyticsResponse carbon = getCarbonAnalytics();

                try {
                        return buildDashboardPdf(summary, vehicles, drivers, trips, maintenance, fuel, expenses, health, carbon);
                } catch (IOException exception) {
                        throw new IllegalStateException("Unable to generate dashboard PDF", exception);
                }
        }

        @Override
        public byte[] exportDashboardCsv() {
                DashboardResponses.SummaryResponse summary = getSummary();
                DashboardResponses.VehicleAnalyticsResponse vehicles = getVehicleAnalytics();
                DashboardResponses.DriverAnalyticsResponse drivers = getDriverAnalytics();
                DashboardResponses.TripAnalyticsResponse trips = getTripAnalytics();
                DashboardResponses.MaintenanceAnalyticsResponse maintenance = getMaintenanceAnalytics();
                DashboardResponses.FuelAnalyticsResponse fuel = getFuelAnalytics();
                DashboardResponses.ExpenseAnalyticsResponse expenses = getExpenseAnalytics();
                DashboardResponses.VehicleHealthResponse health = getVehicleHealthAnalytics();
                DashboardResponses.CarbonAnalyticsResponse carbon = getCarbonAnalytics();

                StringBuilder csv = new StringBuilder();
                csv.append("Section,Metric,Value\n");
                appendCsvRow(csv, "Summary", "Total Vehicles", String.valueOf(summary.totalVehicles()));
                appendCsvRow(csv, "Summary", "Active Vehicles", String.valueOf(summary.activeVehicles()));
                appendCsvRow(csv, "Summary", "Available Vehicles", String.valueOf(summary.availableVehicles()));
                appendCsvRow(csv, "Summary", "Vehicles In Maintenance", String.valueOf(summary.vehiclesInMaintenance()));
                appendCsvRow(csv, "Summary", "Total Drivers", String.valueOf(summary.totalDrivers()));
                appendCsvRow(csv, "Summary", "Drivers On Duty", String.valueOf(summary.driversOnDuty()));
                appendCsvRow(csv, "Summary", "Active Trips", String.valueOf(summary.activeTrips()));
                appendCsvRow(csv, "Summary", "Pending Trips", String.valueOf(summary.pendingTrips()));
                appendCsvRow(csv, "Summary", "Fleet Utilization", String.format("%.2f%%", summary.fleetUtilization()));
                appendCsvRow(csv, "Summary", "Fuel Cost", summary.totalFuelCost().toString());
                appendCsvRow(csv, "Summary", "Expenses", summary.totalExpenses().toString());
                appendCsvRow(csv, "Summary", "Operational Cost", summary.totalOperationalCost().toString());

                appendCsvRow(csv, "Vehicles", "Total", String.valueOf(vehicles.totalVehicles()));
                appendCsvRow(csv, "Vehicles", "Available", String.valueOf(vehicles.availableVehicles()));
                appendCsvRow(csv, "Vehicles", "On Trip", String.valueOf(vehicles.onTripVehicles()));
                appendCsvRow(csv, "Vehicles", "In Shop", String.valueOf(vehicles.inShopVehicles()));
                appendCsvRow(csv, "Vehicles", "Retired", String.valueOf(vehicles.retiredVehicles()));

                appendCsvRow(csv, "Drivers", "Total", String.valueOf(drivers.totalDrivers()));
                appendCsvRow(csv, "Drivers", "Available", String.valueOf(drivers.availableDrivers()));
                appendCsvRow(csv, "Drivers", "On Trip", String.valueOf(drivers.onTripDrivers()));
                appendCsvRow(csv, "Drivers", "Off Duty", String.valueOf(drivers.offDutyDrivers()));
                appendCsvRow(csv, "Drivers", "Suspended", String.valueOf(drivers.suspendedDrivers()));

                appendCsvRow(csv, "Trips", "Total", String.valueOf(trips.totalTrips()));
                appendCsvRow(csv, "Trips", "Draft", String.valueOf(trips.draftTrips()));
                appendCsvRow(csv, "Trips", "Active", String.valueOf(trips.activeTrips()));
                appendCsvRow(csv, "Trips", "Completed", String.valueOf(trips.completedTrips()));
                appendCsvRow(csv, "Trips", "Cancelled", String.valueOf(trips.cancelledTrips()));

                appendCsvRow(csv, "Maintenance", "Vehicles In Maintenance", String.valueOf(maintenance.vehiclesInMaintenance()));
                appendCsvRow(csv, "Maintenance", "Completed Maintenance", String.valueOf(maintenance.completedMaintenance()));
                appendCsvRow(csv, "Maintenance", "Total Cost", maintenance.totalMaintenanceCost().toString());

                appendCsvRow(csv, "Fuel", "Total Fuel Consumed", String.format("%.2f", fuel.totalFuelConsumed()));
                appendCsvRow(csv, "Fuel", "Fuel Cost", fuel.fuelCost().toString());
                appendCsvRow(csv, "Fuel", "Average Mileage", String.format("%.2f", fuel.averageMileage()));
                appendCsvRow(csv, "Fuel", "Fleet Fuel Efficiency", String.format("%.2f", fuel.fuelEfficiency()));

                appendCsvRow(csv, "Expenses", "Total", expenses.totalExpense().toString());
                appendCsvRow(csv, "Expenses", "Fuel", expenses.fuelExpense().toString());
                appendCsvRow(csv, "Expenses", "Toll", expenses.tollExpense().toString());
                appendCsvRow(csv, "Expenses", "Maintenance", expenses.maintenanceExpense().toString());
                appendCsvRow(csv, "Expenses", "Parking", expenses.parkingExpense().toString());
                appendCsvRow(csv, "Expenses", "Insurance", expenses.insuranceExpense().toString());
                appendCsvRow(csv, "Expenses", "Other", expenses.otherExpense().toString());

                appendCsvRow(csv, "Vehicle Health", "Average Health Score", String.format("%.2f", health.averageHealthScore()));
                appendCsvRow(csv, "Vehicle Health", "Healthy Vehicles", String.valueOf(health.healthyVehicles()));
                appendCsvRow(csv, "Vehicle Health", "Critical Vehicles", String.valueOf(health.criticalVehicles()));

                appendCsvRow(csv, "Carbon", "Total CO2", String.format("%.2f", carbon.totalCo2Emission()));
                appendCsvRow(csv, "Carbon", "Today CO2", String.format("%.2f", carbon.todaysCo2()));
                appendCsvRow(csv, "Carbon", "Monthly CO2", String.format("%.2f", carbon.monthlyCo2()));

                return csv.toString().getBytes(StandardCharsets.UTF_8);
        }

        private byte[] buildDashboardPdf(DashboardResponses.SummaryResponse summary,
                                         DashboardResponses.VehicleAnalyticsResponse vehicles,
                                         DashboardResponses.DriverAnalyticsResponse drivers,
                                         DashboardResponses.TripAnalyticsResponse trips,
                                         DashboardResponses.MaintenanceAnalyticsResponse maintenance,
                                         DashboardResponses.FuelAnalyticsResponse fuel,
                                         DashboardResponses.ExpenseAnalyticsResponse expenses,
                                         DashboardResponses.VehicleHealthResponse health,
                                         DashboardResponses.CarbonAnalyticsResponse carbon) throws IOException {
                List<byte[]> objects = new ArrayList<>();

                StringBuilder content = new StringBuilder();
                content.append("q\n");
                content.append("0.96 0.98 1 rg\n");
                content.append("36 788 523 36 re\n");
                content.append("f\n");
                content.append("0 0 0 rg\n");

                writeText(content, 40, 800, "/F2", 18, "TransitOps Dashboard Report");
                writeText(content, 40, 785, "/F1", 9, "Generated at: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                writeText(content, 40, 772, "/F1", 8, "This report is generated from live operational data.");

                double y = 744;
                y = addSection(content, "Summary KPIs", y);
                y = addKpiGrid(content, y,
                        new String[]{"Total Vehicles", "Active Vehicles", "Available Vehicles", "Vehicles In Maintenance"},
                        new String[]{String.valueOf(summary.totalVehicles()), String.valueOf(summary.activeVehicles()), String.valueOf(summary.availableVehicles()), String.valueOf(summary.vehiclesInMaintenance())},
                        new String[]{String.valueOf(summary.totalDrivers()), String.valueOf(summary.driversOnDuty()), String.valueOf(summary.activeTrips()), String.valueOf(summary.pendingTrips())},
                        new String[]{"Total Drivers", "Drivers On Duty", "Active Trips", "Pending Trips"});
                y = addKpiGrid(content, y - 6,
                        new String[]{"Fleet Utilization", "Fuel Cost", "Expenses", "Operational Cost"},
                        new String[]{String.format("%.2f%%", summary.fleetUtilization()), summary.totalFuelCost().toString(), summary.totalExpenses().toString(), summary.totalOperationalCost().toString()},
                        null,
                        null);

                y -= 6;
                y = addSection(content, "Fleet Breakdown", y);
                y = addTable(content, y,
                        new String[]{"Module", "Metric", "Value"},
                        new String[][]{
                                {"Vehicles", "Total", String.valueOf(vehicles.totalVehicles())},
                                {"Vehicles", "Available", String.valueOf(vehicles.availableVehicles())},
                                {"Vehicles", "On Trip", String.valueOf(vehicles.onTripVehicles())},
                                {"Vehicles", "In Shop", String.valueOf(vehicles.inShopVehicles())},
                                {"Vehicles", "Retired", String.valueOf(vehicles.retiredVehicles())},
                                {"Drivers", "Total", String.valueOf(drivers.totalDrivers())},
                                {"Drivers", "Available", String.valueOf(drivers.availableDrivers())},
                                {"Drivers", "On Trip", String.valueOf(drivers.onTripDrivers())},
                                {"Drivers", "Off Duty", String.valueOf(drivers.offDutyDrivers())},
                                {"Drivers", "Suspended", String.valueOf(drivers.suspendedDrivers())}
                        });

                y -= 2;
                y = addSection(content, "Trip and Maintenance", y);
                y = addTable(content, y,
                        new String[]{"Module", "Metric", "Value"},
                        new String[][]{
                                {"Trips", "Total", String.valueOf(trips.totalTrips())},
                                {"Trips", "Draft", String.valueOf(trips.draftTrips())},
                                {"Trips", "Active", String.valueOf(trips.activeTrips())},
                                {"Trips", "Completed", String.valueOf(trips.completedTrips())},
                                {"Trips", "Cancelled", String.valueOf(trips.cancelledTrips())},
                                {"Maintenance", "Vehicles In Maintenance", String.valueOf(maintenance.vehiclesInMaintenance())},
                                {"Maintenance", "Completed", String.valueOf(maintenance.completedMaintenance())},
                                {"Maintenance", "Total Cost", maintenance.totalMaintenanceCost().toString()}
                        });

                y -= 2;
                y = addSection(content, "Fuel, Expense and Environment", y);
                y = addTable(content, y,
                        new String[]{"Module", "Metric", "Value"},
                        new String[][]{
                                {"Fuel", "Total Consumed", String.format("%.2f", fuel.totalFuelConsumed())},
                                {"Fuel", "Fuel Cost", fuel.fuelCost().toString()},
                                {"Fuel", "Average Mileage", String.format("%.2f", fuel.averageMileage())},
                                {"Fuel", "Fleet Fuel Efficiency", String.format("%.2f", fuel.fuelEfficiency())},
                                {"Expenses", "Total", expenses.totalExpense().toString()},
                                {"Expenses", "Fuel", expenses.fuelExpense().toString()},
                                {"Expenses", "Toll", expenses.tollExpense().toString()},
                                {"Expenses", "Maintenance", expenses.maintenanceExpense().toString()},
                                {"Expenses", "Parking", expenses.parkingExpense().toString()},
                                {"Expenses", "Insurance", expenses.insuranceExpense().toString()},
                                {"Expenses", "Other", expenses.otherExpense().toString()},
                                {"Health", "Average Score", String.format("%.2f", health.averageHealthScore())},
                                {"Health", "Healthy Vehicles", String.valueOf(health.healthyVehicles())},
                                {"Health", "Critical Vehicles", String.valueOf(health.criticalVehicles())},
                                {"Carbon", "Total CO2", String.format("%.2f", carbon.totalCo2Emission())},
                                {"Carbon", "Today CO2", String.format("%.2f", carbon.todaysCo2())},
                                {"Carbon", "Monthly CO2", String.format("%.2f", carbon.monthlyCo2())}
                        });

                writeText(content, 40, 40, "/F1", 8, "TransitOps confidential dashboard export");
                writeText(content, 475, 40, "/F1", 8, "Page 1");

                content.append("Q\n");
                content.append("BT\nET\n");

                byte[] contentBytes = content.toString().getBytes(StandardCharsets.US_ASCII);

                objects.add(stringObject("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"));
                objects.add(stringObject("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"));
                objects.add(stringObject("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj\n"));
                objects.add(stringObject("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"));
                objects.add(stringObject("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n"));
                objects.add(streamObject(contentBytes));

                ByteArrayOutputStream output = new ByteArrayOutputStream();
                output.write("%PDF-1.4\n".getBytes(StandardCharsets.US_ASCII));

                List<Integer> offsets = new ArrayList<>();
                offsets.add(0);

                for (byte[] object : objects) {
                        offsets.add(output.size());
                        output.write(object);
                }

                int xrefPosition = output.size();
                StringBuilder xref = new StringBuilder();
                xref.append("xref\n");
                xref.append("0 ").append(objects.size() + 1).append("\n");
                xref.append(String.format("%010d 65535 f \n", 0));
                for (int i = 1; i < offsets.size(); i++) {
                        xref.append(String.format("%010d 00000 n \n", offsets.get(i)));
                }
                output.write(xref.toString().getBytes(StandardCharsets.US_ASCII));

                String trailer = "trailer << /Size " + (objects.size() + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefPosition + "\n%%EOF";
                output.write(trailer.getBytes(StandardCharsets.US_ASCII));
                return output.toByteArray();
        }

        private double addSection(StringBuilder content, String title, double y) {
                content.append("q\n");
                content.append("0.15 0.27 0.49 rg\n");
                content.append("36 ").append(formatPdfNumber(y - 12)).append(" 523 18 re\n");
                content.append("f\n");
                content.append("Q\n");
                writeText(content, 44, y - 1, "/F2", 12, title);
                return y - 26;
        }

        private double addKpiGrid(StringBuilder content,
                                  double y,
                                  String[] labelsTop,
                                  String[] valuesTop,
                                  String[] valuesBottom,
                                  String[] labelsBottom) {
                double currentY = y;
                for (int i = 0; i < labelsTop.length; i++) {
                        double x = (i % 2 == 0) ? 40 : 300;
                        if (i == 2 || i == 3) {
                                currentY = y - 42;
                        }
                        double boxY = currentY;
                        content.append("q\n");
                        content.append("0.95 0.97 1 rg\n");
                        content.append(formatPdfNumber(x)).append(" ").append(formatPdfNumber(boxY - 20)).append(" 240 34 re\n");
                        content.append("f\n");
                        content.append("0.84 0.88 0.94 RG\n");
                        content.append("1 w\n");
                        content.append(formatPdfNumber(x)).append(" ").append(formatPdfNumber(boxY - 20)).append(" 240 34 re\n");
                        content.append("S\n");
                        content.append("Q\n");
                        writeText(content, x + 8, boxY - 2, "/F1", 9, labelsTop[i]);
                        writeText(content, x + 8, boxY - 15, "/F2", 13, valuesTop[i]);
                }

                if (labelsBottom != null && valuesBottom != null) {
                        double bottomY = y - 84;
                        for (int i = 0; i < labelsBottom.length; i++) {
                                double x = (i % 2 == 0) ? 40 : 300;
                                if (i == 2 || i == 3) {
                                        bottomY = y - 126;
                                }
                                content.append("q\n");
                                content.append("0.95 0.97 1 rg\n");
                                content.append(formatPdfNumber(x)).append(" ").append(formatPdfNumber(bottomY - 20)).append(" 240 34 re\n");
                                content.append("f\n");
                                content.append("0.84 0.88 0.94 RG\n");
                                content.append("1 w\n");
                                content.append(formatPdfNumber(x)).append(" ").append(formatPdfNumber(bottomY - 20)).append(" 240 34 re\n");
                                content.append("S\n");
                                content.append("Q\n");
                                writeText(content, x + 8, bottomY - 2, "/F1", 9, labelsBottom[i]);
                                writeText(content, x + 8, bottomY - 15, "/F2", 13, valuesBottom[i]);
                        }
                        return y - 160;
                }

                return y - 84;
        }

        private double addTable(StringBuilder content, double y, String[] headers, String[][] rows) {
                double rowY = y;
                double[] widths = {150, 220, 133};

                content.append("q\n");
                content.append("0.86 0.91 0.97 rg\n");
                content.append("36 ").append(formatPdfNumber(rowY - 10)).append(" 523 18 re\n");
                content.append("f\n");
                content.append("Q\n");

                double startX = 40;
                double cursorX = startX;
                for (int i = 0; i < headers.length; i++) {
                        writeText(content, cursorX + 4, rowY + 2, "/F2", 9, headers[i]);
                        cursorX += widths[i];
                }

                rowY -= 18;
                for (int i = 0; i < rows.length; i++) {
                        if (rowY < 70) {
                                break;
                        }

                        if (i % 2 == 0) {
                                content.append("q\n");
                                content.append("0.98 0.98 0.98 rg\n");
                                content.append("36 ").append(formatPdfNumber(rowY - 10)).append(" 523 16 re\n");
                                content.append("f\n");
                                content.append("Q\n");
                        }

                        cursorX = startX;
                        for (int col = 0; col < rows[i].length; col++) {
                                writeText(content, cursorX + 4, rowY + 1, "/F1", 8, rows[i][col]);
                                cursorX += widths[col];
                        }

                        rowY -= 16;
                }

                return rowY - 12;
        }

        private void writeText(StringBuilder content, double x, double y, String fontName, int size, String text) {
                content.append("BT\n");
                content.append(fontName).append(" ").append(size).append(" Tf\n");
                content.append("1 0 0 1 ").append(formatPdfNumber(x)).append(" ").append(formatPdfNumber(y)).append(" Tm\n");
                content.append("(").append(escapePdfText(text)).append(") Tj\n");
                content.append("ET\n");
        }

        private String formatPdfNumber(double value) {
                return String.format(java.util.Locale.US, "%.2f", value);
        }

        private byte[] stringObject(String value) {
                return (value + "\n").getBytes(StandardCharsets.US_ASCII);
        }

        private byte[] streamObject(byte[] contentBytes) throws IOException {
                ByteArrayOutputStream object = new ByteArrayOutputStream();
                object.write(("5 0 obj << /Length " + contentBytes.length + " >> stream\n").getBytes(StandardCharsets.US_ASCII));
                object.write(contentBytes);
                object.write("endstream\nendobj\n".getBytes(StandardCharsets.US_ASCII));
                return object.toByteArray();
        }

        private void appendCsvRow(StringBuilder csv, String section, String metric, String value) {
                csv.append(escapeCsv(section)).append(',')
                                .append(escapeCsv(metric)).append(',')
                                .append(escapeCsv(value)).append('\n');
        }

        private String escapeCsv(String value) {
                if (value == null) {
                        return "";
                }
                if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
                        return '"' + value.replace("\"", "\"\"") + '"';
                }
                return value;
        }

        private String escapePdfText(String text) {
                return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
        }

    private long countVehicleStatus(List<Vehicle> vehicles, VehicleStatus status) {
        return vehicles.stream().filter(vehicle -> vehicle.getStatus() == status).count();
    }

    private BigDecimal sumExpenseType(List<Expense> expenses, ExpenseType expenseType) {
                BigDecimal total = BigDecimal.ZERO;
                for (Expense expense : expenses) {
                        if (expense.getAmount() == null) {
                                continue;
                        }
                        if (expenseType != null && expense.getExpenseType() != expenseType) {
                                continue;
                        }
                        total = total.add(expense.getAmount());
                }
                return total;
    }
}