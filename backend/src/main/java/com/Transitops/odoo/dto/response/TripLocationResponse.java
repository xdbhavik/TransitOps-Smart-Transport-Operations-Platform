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
public class TripLocationResponse {

    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private LocalDateTime timestamp;
}
