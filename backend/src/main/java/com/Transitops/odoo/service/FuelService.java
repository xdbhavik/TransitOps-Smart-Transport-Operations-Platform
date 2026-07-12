package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.FuelRequest;
import com.Transitops.odoo.dto.response.FuelHistoryResponse;
import com.Transitops.odoo.dto.response.FuelReportResponse;
import com.Transitops.odoo.dto.response.FuelResponse;

import java.util.List;

public interface FuelService {

    FuelResponse createFuelLog(FuelRequest request);

    List<FuelHistoryResponse> getFuelHistory(String vehicleId);

    FuelReportResponse getFuelReport();
}