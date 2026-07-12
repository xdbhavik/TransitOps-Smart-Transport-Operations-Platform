package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.MaintenanceRequest;
import com.Transitops.odoo.dto.response.MaintenanceResponse;
import com.Transitops.odoo.entity.Maintenance;

import java.util.List;

public interface MaintenanceService {

    MaintenanceResponse createMaintenance(MaintenanceRequest request);

    MaintenanceResponse completeMaintenance(String maintenanceId);

    List<Maintenance> getAllMaintenance();

    List<Maintenance> getUpcomingMaintenance();
}