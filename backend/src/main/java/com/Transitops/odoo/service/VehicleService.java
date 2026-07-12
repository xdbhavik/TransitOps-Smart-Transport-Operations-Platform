package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.VehicleHealthUpdateRequest;
import com.Transitops.odoo.dto.request.VehicleRequest;
import com.Transitops.odoo.dto.request.VehicleStatusUpdateRequest;
import com.Transitops.odoo.dto.response.VehicleDetailsResponse;
import com.Transitops.odoo.dto.response.VehicleResponse;

import java.util.List;

public interface VehicleService {

    VehicleResponse createVehicle(VehicleRequest request);

    VehicleDetailsResponse getVehicleById(String vehicleId);

    List<VehicleDetailsResponse> getAllVehicles();

    List<VehicleDetailsResponse> getAvailableVehicles();

    VehicleDetailsResponse updateVehicle(String vehicleId, VehicleRequest request);

    VehicleResponse updateVehicleStatus(String vehicleId, VehicleStatusUpdateRequest request);

    VehicleResponse updateVehicleHealthScore(String vehicleId, VehicleHealthUpdateRequest request);

    VehicleResponse deleteVehicle(String vehicleId);
}