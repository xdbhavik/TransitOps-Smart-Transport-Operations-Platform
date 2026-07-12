package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VehicleStatusUpdateRequest {

    private VehicleStatus status;
}