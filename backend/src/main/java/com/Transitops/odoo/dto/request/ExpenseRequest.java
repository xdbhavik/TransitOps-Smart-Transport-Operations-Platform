package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.ExpenseType;
import com.fasterxml.jackson.annotation.JsonAlias;
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

    @JsonAlias({"vehicleId", "vehicle_id"})
    private String vehicleId;

    @JsonAlias({"tripId", "trip_id"})
    private String tripId;

    @JsonAlias({"expenseType", "expense_type"})
    private ExpenseType expenseType;

    @JsonAlias({"amount"})
    private BigDecimal amount;

    @JsonAlias({"description"})
    private String description;

    @JsonAlias({"expenseDate", "expense_date"})
    private LocalDate expenseDate;
}