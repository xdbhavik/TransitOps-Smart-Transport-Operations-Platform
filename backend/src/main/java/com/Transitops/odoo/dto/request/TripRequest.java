package com.Transitops.odoo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripRequest {

    private String source;
    private String destination;
    private String driverId;
    private String vehicleId;
    private Double cargoWeight;
    private Double plannedDistance;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private LocalDateTime estimatedArrival;
}
