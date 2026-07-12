package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.MaintenanceType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequest {

    private String vehicleId;

    private MaintenanceType maintenanceType;

    private String description;

    private String serviceCenter;

    private BigDecimal cost;
}