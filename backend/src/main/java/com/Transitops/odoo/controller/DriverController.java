package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.request.DriverRequest;
import com.Transitops.odoo.dto.response.DriverAvailabilityResponse;
import com.Transitops.odoo.dto.response.DriverResponse;
import com.Transitops.odoo.dto.response.LicenseStatusResponse;
import com.Transitops.odoo.enums.DriverStatus;
import com.Transitops.odoo.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<DriverResponse> registerDriver(@RequestBody DriverRequest request) {
        DriverResponse response = driverService.registerDriver(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable String id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable String id, @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable String id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @GetMapping("/on-trip")
    public ResponseEntity<List<DriverResponse>> getOnTripDrivers() {
        return ResponseEntity.ok(driverService.getOnTripDrivers());
    }

    @GetMapping("/license-expiring")
    public ResponseEntity<List<DriverResponse>> getLicenseExpiringDrivers() {
        return ResponseEntity.ok(driverService.getLicenseExpiringDrivers());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DriverResponse> updateDriverStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.badRequest().build();
        }
        DriverStatus status = DriverStatus.fromValue(statusStr);
        return ResponseEntity.ok(driverService.updateDriverStatus(id, status));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<DriverAvailabilityResponse> checkAvailability(@PathVariable String id) {
        return ResponseEntity.ok(driverService.checkAvailability(id));
    }

    @GetMapping("/{id}/license-status")
    public ResponseEntity<LicenseStatusResponse> checkLicenseStatus(@PathVariable String id) {
        return ResponseEntity.ok(driverService.checkLicenseStatus(id));
    }
}
