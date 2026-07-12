package com.Transitops.odoo.entity;

import com.Transitops.odoo.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips", uniqueConstraints = {
        @UniqueConstraint(name = "uk_trip_number", columnNames = "trip_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"vehicle", "driver", "liveTrackings", "fuelLogs", "expenses", "carbonEmissions"})
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private String id;

    @Column(name = "trip_number", nullable = false, unique = true)
    private String tripNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    private Double cargoWeight;

    private Double plannedDistance;

    private Double actualDistance;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime estimatedArrival;

    private Double fuelConsumed;

    private BigDecimal revenue;

    private BigDecimal profit;

    private Double carbonEmission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus tripStatus;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY)
    @Builder.Default
    private List<LiveTracking> liveTrackings = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY)
    @Builder.Default
    private List<FuelLog> fuelLogs = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Expense> expenses = new ArrayList<>();

    @OneToMany(mappedBy = "trip", fetch = FetchType.LAZY)
    @Builder.Default
    private List<CarbonEmission> carbonEmissions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (tripStatus == null) {
            tripStatus = TripStatus.DRAFT;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}