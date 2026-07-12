package com.Transitops.odoo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {

    private String tripId;
    private String tripNumber;
    private String source;
    private String destination;
    private String driverId;
    private String vehicleId;
    private Double cargoWeight;
    private Double plannedDistance;
    private Double actualDistance;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private LocalDateTime estimatedArrival;
    private LocalDateTime actualEnd;
    private Double fuelConsumed;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
