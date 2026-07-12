package com.Transitops.odoo.entity;

import com.Transitops.odoo.enums.FuelType;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_vehicle_registration_number", columnNames = "registration_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"trips", "maintenanceLogs", "fuelLogs", "expenses", "healthChecks", "carbonEmissions"})
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @Column(name = "vehicle_name", nullable = false)
    private String vehicleName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    @Column(nullable = false)
    private String manufacturer;

    private Integer manufacturingYear;

    private Double maximumLoadCapacity;

    private Double odometer;

    private BigDecimal acquisitionCost;

    private BigDecimal currentValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType;

    private Double fuelTankCapacity;

    private Double averageMileage;

    private Integer healthScore;

    private Double totalCarbonEmission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Trip> trips = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Maintenance> maintenanceLogs = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<FuelLog> fuelLogs = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Expense> expenses = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<VehicleHealth> healthChecks = new ArrayList<>();

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.LAZY)
    @Builder.Default
    private List<CarbonEmission> carbonEmissions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = VehicleStatus.AVAILABLE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}