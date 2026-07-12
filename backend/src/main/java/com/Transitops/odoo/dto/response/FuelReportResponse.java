package com.Transitops.odoo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FuelReportResponse {

    private long totalFuelEntries;

    private Double totalLiters;

    private BigDecimal totalCost;

    private Double averageMileage;
}