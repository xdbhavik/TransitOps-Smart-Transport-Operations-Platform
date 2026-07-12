package com.Transitops.odoo.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ExpenseType {
    FUEL("Fuel"),
    TOLL("Toll"),
    MAINTENANCE("Maintenance"),
    PARKING("Parking"),
    INSURANCE("Insurance"),
    OTHER("Other");

    private final String value;

    ExpenseType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ExpenseType fromValue(String value) {
        for (ExpenseType expenseType : ExpenseType.values()) {
            if (expenseType.value.equalsIgnoreCase(value) || expenseType.name().equalsIgnoreCase(value)) {
                return expenseType;
            }
        }
        throw new IllegalArgumentException("Unknown expense type: " + value);
    }
}