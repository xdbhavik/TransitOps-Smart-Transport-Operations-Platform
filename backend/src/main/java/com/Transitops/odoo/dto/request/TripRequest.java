package com.Transitops.odoo.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    @JsonAlias({"source"})
    private String source;

    @JsonAlias({"destination"})
    private String destination;

    @JsonAlias({"driverId", "driver_id"})
    private String driverId;

    @JsonAlias({"vehicleId", "vehicle_id"})
    private String vehicleId;

    @JsonAlias({"cargoWeight", "cargo_weight"})
    private Double cargoWeight;

    @JsonAlias({"plannedDistance", "planned_distance"})
    private Double plannedDistance;

    @JsonAlias({"scheduledStart", "scheduled_start"})
    private LocalDateTime scheduledStart;

    @JsonAlias({"scheduledEnd", "scheduled_end"})
    private LocalDateTime scheduledEnd;

    @JsonAlias({"estimatedArrival", "estimated_arrival"})
    private LocalDateTime estimatedArrival;
}
