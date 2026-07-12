package com.Transitops.odoo.config;

import com.Transitops.odoo.entity.CarbonEmission;
import com.Transitops.odoo.entity.Driver;
import com.Transitops.odoo.entity.Expense;
import com.Transitops.odoo.entity.FuelLog;
import com.Transitops.odoo.entity.Maintenance;
import com.Transitops.odoo.entity.Role;
import com.Transitops.odoo.entity.Trip;
import com.Transitops.odoo.entity.User;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.entity.VehicleHealth;
import com.Transitops.odoo.enums.DriverStatus;
import com.Transitops.odoo.enums.ExpenseType;
import com.Transitops.odoo.enums.FuelType;
import com.Transitops.odoo.enums.MaintenanceStatus;
import com.Transitops.odoo.enums.MaintenanceType;
import com.Transitops.odoo.enums.RoleName;
import com.Transitops.odoo.enums.TripStatus;
import com.Transitops.odoo.enums.UserStatus;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.enums.VehicleType;
import com.Transitops.odoo.repository.CarbonEmissionRepository;
import com.Transitops.odoo.repository.DriverRepository;
import com.Transitops.odoo.repository.ExpenseRepository;
import com.Transitops.odoo.repository.FuelLogRepository;
import com.Transitops.odoo.repository.MaintenanceRepository;
import com.Transitops.odoo.repository.RoleRepository;
import com.Transitops.odoo.repository.TripRepository;
import com.Transitops.odoo.repository.UserRepository;
import com.Transitops.odoo.repository.VehicleHealthRepository;
import com.Transitops.odoo.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder {

    private static final String SEED_PASSWORD = "Pass@1234";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final FuelLogRepository fuelLogRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleHealthRepository vehicleHealthRepository;
    private final CarbonEmissionRepository carbonEmissionRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seed() {
        log.info("Starting TransitOps seed data initialization");

        Role adminRole = ensureRole(RoleName.ADMIN);
        Role fleetManagerRole = ensureRole(RoleName.FLEET_MANAGER);
        Role dispatcherRole = ensureRole(RoleName.DISPATCHER);
        Role safetyOfficerRole = ensureRole(RoleName.SAFETY_OFFICER);
        Role financialAnalystRole = ensureRole(RoleName.FINANCIAL_ANALYST);

        ensureUser("Seed Admin", "seed.admin@transitops.local", "9991000001", adminRole);
        ensureUser("Fleet Manager", "seed.fleet@transitops.local", "9991000002", fleetManagerRole);
        ensureUser("Dispatcher", "seed.dispatcher@transitops.local", "9991000003", dispatcherRole);
        ensureUser("Safety Officer", "seed.safety@transitops.local", "9991000004", safetyOfficerRole);
        ensureUser("Financial Analyst", "seed.finance@transitops.local", "9991000005", financialAnalystRole);

        Vehicle truck = ensureVehicle(
                "TRK-1001",
                "TransCargo Prime",
                "T-500",
                VehicleType.TRUCK,
                "Tata Motors",
                2022,
                12000.0,
                45200.0,
                new BigDecimal("4500000"),
                new BigDecimal("3900000"),
                FuelType.DIESEL,
                180.0,
                18.5,
                92,
                1250.0,
                VehicleStatus.AVAILABLE
        );

        Vehicle bus = ensureVehicle(
                "BUS-2001",
                "CityLink Cruiser",
                "B-900",
                VehicleType.BUS,
                "Ashok Leyland",
                2021,
                16000.0,
                78200.0,
                new BigDecimal("6800000"),
                new BigDecimal("5900000"),
                FuelType.DIESEL,
                220.0,
                7.8,
                76,
                2380.0,
                VehicleStatus.IN_SHOP
        );

        Vehicle van = ensureVehicle(
                "VAN-3001",
                "SwiftDrop Van",
                "V-300",
                VehicleType.VAN,
                "Mahindra",
                2023,
                2200.0,
                28000.0,
                new BigDecimal("2100000"),
                new BigDecimal("1950000"),
                FuelType.DIESEL,
                80.0,
                14.2,
                85,
                680.0,
                VehicleStatus.ON_TRIP
        );

        Driver driverOne = ensureDriver(
                "Aman Verma",
                "EMP-DRV-001",
                "DL-TRK-9001",
                "HGV",
                LocalDate.now().plusDays(12),
                "9992000001",
                "aman.verma@transitops.local",
                92,
                8,
                "9993000001",
                "Noida, UP",
                18,
                15200.0,
                DriverStatus.AVAILABLE
        );

        Driver driverTwo = ensureDriver(
                "Rohit Singh",
                "EMP-DRV-002",
                "DL-VAN-9002",
                "LMV",
                LocalDate.now().plusMonths(9),
                "9992000002",
                "rohit.singh@transitops.local",
                84,
                6,
                "9993000002",
                "Gurgaon, HR",
                24,
                18450.0,
                DriverStatus.ON_TRIP
        );

        Driver driverThree = ensureDriver(
                "Sanjay Kumar",
                "EMP-DRV-003",
                "DL-BUS-9003",
                "PSV",
                LocalDate.now().plusDays(40),
                "9992000003",
                "sanjay.kumar@transitops.local",
                76,
                5,
                "9993000003",
                "Delhi, NCR",
                12,
                9100.0,
                DriverStatus.OFF_DUTY
        );

        Trip activeTrip = ensureTrip(
                "TRP-SEED-1001",
                van,
                driverTwo,
                "Delhi Warehouse",
                "Noida Hub",
                1200.0,
                42.0,
                null,
                LocalDateTime.now().minusHours(3),
                null,
                LocalDateTime.now().plusHours(2),
                38.5,
                new BigDecimal("25000"),
                new BigDecimal("8200"),
                107.1,
                TripStatus.IN_TRANSIT
        );

        Trip completedTrip = ensureTrip(
                "TRP-SEED-1002",
                truck,
                driverOne,
                "Gurgaon DC",
                "Jaipur Plant",
                6400.0,
                280.0,
                282.0,
                LocalDateTime.now().minusDays(8).minusHours(2),
                LocalDateTime.now().minusDays(8),
                LocalDateTime.now().minusDays(8).plusHours(6),
                126.0,
                new BigDecimal("72000"),
                new BigDecimal("21400"),
                384.3,
                TripStatus.COMPLETED
        );

        Trip cancelledTrip = ensureTrip(
                "TRP-SEED-1003",
                bus,
                driverThree,
                "Pune Depot",
                "Mumbai Port",
                0.0,
                150.0,
                null,
                LocalDateTime.now().minusDays(2),
                null,
                null,
                0.0,
                new BigDecimal("0"),
                new BigDecimal("0"),
                0.0,
                TripStatus.CANCELLED
        );

        ensureTrip(
                "TRP-SEED-1004",
                truck,
                driverOne,
                "Faridabad Yard",
                "Agra Retail Hub",
                2500.0,
                195.0,
                null,
                null,
                null,
                LocalDateTime.now().plusDays(1),
                null,
                null,
                null,
                null,
                TripStatus.DRAFT
        );

        ensureMaintenance(
                "MNT-5001",
                bus,
                MaintenanceType.INSPECTION,
                "Annual safety inspection",
                "TransitCare Workshop",
                LocalDate.now().minusDays(2),
                LocalDate.now().plusMonths(6),
                78450.0,
                new BigDecimal("12000"),
                MaintenanceStatus.SCHEDULED
        );

        ensureMaintenance(
                "MNT-5002",
                truck,
                MaintenanceType.PREVENTIVE,
                "Brake pad replacement",
                "Fleet Service Center",
                LocalDate.now().minusDays(7),
                LocalDate.now().plusMonths(4),
                45320.0,
                new BigDecimal("18000"),
                MaintenanceStatus.COMPLETED
        );

        ensureFuelLog("FL-9001", van, activeTrip, 38.5, new BigDecimal("3700"), "Highway Fuel Point", LocalDate.now().minusDays(1), 14.8);
        ensureFuelLog("FL-9002", truck, completedTrip, 126.0, new BigDecimal("12450"), "Fleet Depot", LocalDate.now().minusDays(8), 18.1);

        ensureExpense(bus, cancelledTrip, ExpenseType.PARKING, new BigDecimal("450"), "Parking charge during route abort", LocalDate.now().minusDays(2));
        ensureExpense(truck, completedTrip, ExpenseType.FUEL, new BigDecimal("12450"), "Diesel refill for completed haul", LocalDate.now().minusDays(8));
        ensureExpense(truck, completedTrip, ExpenseType.TOLL, new BigDecimal("3600"), "Toll payments for Jaipur route", LocalDate.now().minusDays(8));
        ensureExpense(truck, completedTrip, ExpenseType.MAINTENANCE, new BigDecimal("18000"), "Brake maintenance expense", LocalDate.now().minusDays(7));
        ensureExpense(truck, null, ExpenseType.INSURANCE, new BigDecimal("22000"), "Annual insurance premium", LocalDate.now().minusMonths(1));

        ensureVehicleHealth(bus, 76, 74, 68, 70, 80, "Needs minor servicing", LocalDate.now().minusDays(2));
        ensureVehicleHealth(truck, 91, 92, 89, 88, 90, "Healthy and ready", LocalDate.now().minusDays(1));
        ensureVehicleHealth(van, 85, 84, 82, 79, 81, "Roadworthy", LocalDate.now());

        ensureCarbonEmission(truck, completedTrip, 126.0, 3.05, 384.3, LocalDateTime.now().minusDays(8));
        ensureCarbonEmission(van, activeTrip, 38.5, 2.78, 107.1, LocalDateTime.now().minusDays(1));

        log.info("TransitOps seed data initialization completed");
    }

    private Role ensureRole(RoleName roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }

    private User ensureUser(String fullName, String email, String phone, Role role) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName(fullName)
                        .email(email)
                        .phone(phone)
                        .role(role)
                        .password(passwordEncoder.encode(SEED_PASSWORD))
                        .status(UserStatus.ACTIVE)
                        .build()));
    }

    private Vehicle ensureVehicle(String registrationNumber,
                                  String vehicleName,
                                  String model,
                                  VehicleType type,
                                  String manufacturer,
                                  Integer manufacturingYear,
                                  Double maximumLoadCapacity,
                                  Double odometer,
                                  BigDecimal acquisitionCost,
                                  BigDecimal currentValue,
                                  FuelType fuelType,
                                  Double fuelTankCapacity,
                                  Double averageMileage,
                                  Integer healthScore,
                                  Double totalCarbonEmission,
                                  VehicleStatus status) {
        Optional<Vehicle> existing = vehicleRepository.findAll().stream()
                .filter(vehicle -> registrationNumber.equals(vehicle.getRegistrationNumber()))
                .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        return vehicleRepository.save(Vehicle.builder()
                .registrationNumber(registrationNumber)
                .vehicleName(vehicleName)
                .model(model)
                .type(type)
                .manufacturer(manufacturer)
                .manufacturingYear(manufacturingYear)
                .maximumLoadCapacity(maximumLoadCapacity)
                .odometer(odometer)
                .acquisitionCost(acquisitionCost)
                .currentValue(currentValue)
                .fuelType(fuelType)
                .fuelTankCapacity(fuelTankCapacity)
                .averageMileage(averageMileage)
                .healthScore(healthScore)
                .totalCarbonEmission(totalCarbonEmission)
                .status(status)
                .build());
    }

    private Driver ensureDriver(String fullName,
                                String employeeId,
                                String licenseNumber,
                                String licenseCategory,
                                LocalDate licenseExpiryDate,
                                String phone,
                                String email,
                                Integer safetyScore,
                                Integer experienceYears,
                                String emergencyContact,
                                String address,
                                Integer totalTrips,
                                Double totalDistance,
                                DriverStatus status) {
        Optional<Driver> existing = driverRepository.findAll().stream()
                .filter(driver -> licenseNumber.equals(driver.getLicenseNumber()) || employeeId.equals(driver.getEmployeeId()) || email.equals(driver.getEmail()))
                .findFirst();

        if (existing.isPresent()) {
                        Driver driver = existing.get();
                        driver.setFullName(fullName);
                        driver.setLicenseCategory(licenseCategory);
                        driver.setLicenseExpiryDate(licenseExpiryDate);
                        driver.setPhone(phone);
                        driver.setEmail(email);
                        driver.setSafetyScore(safetyScore);
                        driver.setExperienceYears(experienceYears);
                        driver.setEmergencyContact(emergencyContact);
                        driver.setAddress(address);
                        driver.setTotalTrips(totalTrips);
                        driver.setTotalDistance(totalDistance);
                        driver.setStatus(status);
                        return driverRepository.save(driver);
        }

        return driverRepository.save(Driver.builder()
                .fullName(fullName)
                .employeeId(employeeId)
                .licenseNumber(licenseNumber)
                .licenseCategory(licenseCategory)
                .licenseExpiryDate(licenseExpiryDate)
                .phone(phone)
                .email(email)
                .safetyScore(safetyScore)
                .experienceYears(experienceYears)
                .emergencyContact(emergencyContact)
                .address(address)
                .totalTrips(totalTrips)
                .totalDistance(totalDistance)
                .status(status)
                .build());
    }

    private Trip ensureTrip(String tripNumber,
                            Vehicle vehicle,
                            Driver driver,
                            String source,
                            String destination,
                            Double cargoWeight,
                            Double plannedDistance,
                            Double actualDistance,
                            LocalDateTime startTime,
                            LocalDateTime endTime,
                            LocalDateTime estimatedArrival,
                            Double fuelConsumed,
                            BigDecimal revenue,
                            BigDecimal profit,
                            Double carbonEmission,
                            TripStatus tripStatus) {
        Optional<Trip> existing = tripRepository.findAll().stream()
                .filter(trip -> tripNumber.equals(trip.getTripNumber()))
                .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        return tripRepository.save(Trip.builder()
                .tripNumber(tripNumber)
                .vehicle(vehicle)
                .driver(driver)
                .source(source)
                .destination(destination)
                .cargoWeight(cargoWeight)
                .plannedDistance(plannedDistance)
                .actualDistance(actualDistance)
                .startTime(startTime)
                .endTime(endTime)
                .estimatedArrival(estimatedArrival)
                .fuelConsumed(fuelConsumed)
                .revenue(revenue)
                .profit(profit)
                .carbonEmission(carbonEmission)
                .tripStatus(tripStatus)
                .build());
    }

    private void ensureMaintenance(String maintenanceCode,
                                   Vehicle vehicle,
                                   MaintenanceType maintenanceType,
                                   String description,
                                   String serviceCenter,
                                   LocalDate maintenanceDate,
                                   LocalDate nextMaintenanceDate,
                                   Double odometerReading,
                                   BigDecimal cost,
                                   MaintenanceStatus status) {
        boolean exists = maintenanceRepository.findAll().stream()
                .anyMatch(maintenance -> maintenanceCode.equals(maintenance.getMaintenanceCode()));

        if (exists) {
            return;
        }

        maintenanceRepository.save(Maintenance.builder()
                .maintenanceCode(maintenanceCode)
                .vehicle(vehicle)
                .maintenanceType(maintenanceType)
                .description(description)
                .serviceCenter(serviceCenter)
                .maintenanceDate(maintenanceDate)
                .nextMaintenanceDate(nextMaintenanceDate)
                .odometerReading(odometerReading)
                .cost(cost)
                .status(status)
                .build());
    }

    private void ensureFuelLog(String fuelLogCode,
                               Vehicle vehicle,
                               Trip trip,
                               Double liters,
                               BigDecimal cost,
                               String fuelStation,
                               LocalDate fuelDate,
                               Double mileage) {
        boolean exists = fuelLogRepository.findAll().stream()
                .anyMatch(fuelLog -> fuelLogCode.equals(fuelLog.getFuelLogCode()));

        if (exists) {
            return;
        }

        fuelLogRepository.save(FuelLog.builder()
                .fuelLogCode(fuelLogCode)
                .vehicle(vehicle)
                .trip(trip)
                .liters(liters)
                .cost(cost)
                .fuelStation(fuelStation)
                .fuelDate(fuelDate)
                .mileage(mileage)
                .build());
    }

    private void ensureExpense(Vehicle vehicle,
                               Trip trip,
                               ExpenseType expenseType,
                               BigDecimal amount,
                               String description,
                               LocalDate expenseDate) {
        boolean exists = expenseRepository.findAll().stream()
                .anyMatch(expense -> expenseType == expense.getExpenseType()
                        && amount.compareTo(expense.getAmount()) == 0
                        && description.equals(expense.getDescription()));

        if (exists) {
            return;
        }

        expenseRepository.save(Expense.builder()
                .vehicle(vehicle)
                .trip(trip)
                .expenseType(expenseType)
                .amount(amount)
                .description(description)
                .expenseDate(expenseDate)
                .build());
    }

    private void ensureVehicleHealth(Vehicle vehicle,
                                     Integer healthScore,
                                     Integer engineCondition,
                                     Integer tyreCondition,
                                     Integer brakeCondition,
                                     Integer batteryCondition,
                                     String overallRemark,
                                     LocalDate checkedDate) {
        boolean exists = vehicleHealthRepository.findAll().stream()
                .anyMatch(health -> health.getVehicle() != null
                        && vehicle.getId() != null
                        && vehicle.getId().equals(health.getVehicle().getId())
                        && checkedDate.equals(health.getCheckedDate()));

        if (exists) {
            return;
        }

        vehicleHealthRepository.save(VehicleHealth.builder()
                .vehicle(vehicle)
                .healthScore(healthScore)
                .engineCondition(engineCondition)
                .tyreCondition(tyreCondition)
                .brakeCondition(brakeCondition)
                .batteryCondition(batteryCondition)
                .overallRemark(overallRemark)
                .checkedDate(checkedDate)
                .build());
    }

    private void ensureCarbonEmission(Vehicle vehicle,
                                      Trip trip,
                                      Double fuelConsumed,
                                      Double emissionFactor,
                                      Double totalEmission,
                                      LocalDateTime emissionDate) {
        boolean exists = carbonEmissionRepository.findAll().stream()
                .anyMatch(emission -> emission.getVehicle() != null
                        && vehicle.getId() != null
                        && vehicle.getId().equals(emission.getVehicle().getId())
                        && emissionDate.toLocalDate().equals(emission.getEmissionDate().toLocalDate()));

        if (exists) {
            return;
        }

        carbonEmissionRepository.save(CarbonEmission.builder()
                .vehicle(vehicle)
                .trip(trip)
                .fuelConsumed(fuelConsumed)
                .emissionFactor(emissionFactor)
                .totalEmission(totalEmission)
                .emissionDate(emissionDate)
                .build());
    }
}