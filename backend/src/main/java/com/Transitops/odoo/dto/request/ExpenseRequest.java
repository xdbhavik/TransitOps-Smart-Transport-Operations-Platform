package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.ExpenseType;
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
public class ExpenseRequest {

    private String tripId;
    private String vehicleId;
    private ExpenseType expenseType;
    private String description;
    private BigDecimal amount;
    private Double fuelQuantity;
    private BigDecimal fuelCost;
    private BigDecimal tollCost;
    private BigDecimal maintenanceCost;
    private BigDecimal otherCost;
    private LocalDate expenseDate;
}
