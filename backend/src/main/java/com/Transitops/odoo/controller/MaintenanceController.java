package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.request.MaintenanceRequest;
import com.Transitops.odoo.dto.response.MaintenanceResponse;
import com.Transitops.odoo.entity.Maintenance;
import com.Transitops.odoo.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceResponse> createMaintenance(@RequestBody MaintenanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.createMaintenance(request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<MaintenanceResponse> completeMaintenance(@PathVariable("id") String maintenanceId) {
        return ResponseEntity.ok(maintenanceService.completeMaintenance(maintenanceId));
    }

    @GetMapping
    public ResponseEntity<List<Maintenance>> getAllMaintenance() {
        return ResponseEntity.ok(maintenanceService.getAllMaintenance());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Maintenance>> getUpcomingMaintenance() {
        return ResponseEntity.ok(maintenanceService.getUpcomingMaintenance());
    }
}