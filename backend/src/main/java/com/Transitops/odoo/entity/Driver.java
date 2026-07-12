package com.Transitops.odoo.entity;

import com.Transitops.odoo.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "drivers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_driver_employee_id", columnNames = "employee_id"),
        @UniqueConstraint(name = "uk_driver_license_number", columnNames = "license_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "trips")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "employee_id", nullable = false, unique = true)
    private String employeeId;

    @Column(name = "license_number", nullable = false, unique = true)
    private String licenseNumber;

    private String licenseCategory;

    private LocalDate licenseExpiryDate;

    private String phone;

    private String email;

    private Integer safetyScore;

    private Integer experienceYears;

    private String emergencyContact;

    private String address;

    private Integer totalTrips;

    private Double totalDistance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "driver", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Trip> trips = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = DriverStatus.AVAILABLE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}