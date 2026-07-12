package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.DriverRequest;
import com.Transitops.odoo.dto.response.DriverAvailabilityResponse;
import com.Transitops.odoo.dto.response.DriverResponse;
import com.Transitops.odoo.dto.response.LicenseReminderResponse;
import com.Transitops.odoo.dto.response.LicenseStatusResponse;
import com.Transitops.odoo.enums.DriverStatus;

import java.util.List;

public interface DriverService {
    DriverResponse registerDriver(DriverRequest request);
    List<DriverResponse> getAllDrivers();
    DriverResponse getDriverById(String id);
    DriverResponse updateDriver(String id, DriverRequest request);
    void deleteDriver(String id);
    
    List<DriverResponse> getAvailableDrivers();
    List<DriverResponse> getOnTripDrivers();
    List<DriverResponse> getLicenseExpiringDrivers();
    DriverResponse updateDriverStatus(String id, DriverStatus status);
    DriverAvailabilityResponse checkAvailability(String id);
    LicenseStatusResponse checkLicenseStatus(String id);
    LicenseReminderResponse sendLicenseExpiryReminders();
}
