package com.Transitops.odoo.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DriverStatus {
    AVAILABLE("Available"),
    ON_TRIP("On Trip"),
    OFF_DUTY("Off Duty"),
    SUSPENDED("Suspended");

    private final String value;

    DriverStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DriverStatus fromValue(String value) {
        for (DriverStatus status : DriverStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown driver status: " + value);
    }
}