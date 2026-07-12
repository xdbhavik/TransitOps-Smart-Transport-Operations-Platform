package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.FuelType;
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
public class VehicleRequest {

    private String registrationNumber;

    private String vehicleName;

    private String model;

    private VehicleType type;

    private String manufacturer;

    private Integer manufacturingYear;

    private Double maximumLoadCapacity;

    private FuelType fuelType;

    private Double fuelTankCapacity;

    private Double averageMileage;

    private BigDecimal acquisitionCost;
}