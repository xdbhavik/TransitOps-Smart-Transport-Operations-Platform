package com.Transitops.odoo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FuelHistoryResponse {

    private String fuelLogId;

    private String vehicleId;

    private String tripId;

    private Double liters;

    private BigDecimal cost;

    private String fuelStation;

    private LocalDate fuelDate;

    private Double mileage;
}