package com.Transitops.odoo.dto.response;

import com.Transitops.odoo.enums.FuelType;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetailsResponse {

    private String vehicleId;

    private String registrationNumber;

    private String vehicleName;

    private String model;

    private VehicleType type;

    private String manufacturer;

    private Integer manufacturingYear;

    private Double maximumLoadCapacity;

    private Double odometer;

    private BigDecimal acquisitionCost;

    private BigDecimal currentValue;

    private FuelType fuelType;

    private Double fuelTankCapacity;

    private Double averageMileage;

    private Integer healthScore;

    private Double totalCarbonEmission;

    private VehicleStatus status;
}