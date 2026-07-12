package com.Transitops.odoo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FuelRequest {

    private String vehicleId;

    private String tripId;

    private Double liters;

    private BigDecimal cost;

    private String fuelStation;
}