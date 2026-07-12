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
public class TripDispatchRequest {

    private LocalDateTime dispatchTime;
    private LocalDateTime estimatedArrival;
}
