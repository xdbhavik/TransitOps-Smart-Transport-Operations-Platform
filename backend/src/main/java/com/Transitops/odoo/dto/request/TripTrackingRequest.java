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
public class TripTrackingRequest {

    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private Double distanceRemaining;
    private LocalDateTime eta;
    private LocalDateTime timestamp;
}
