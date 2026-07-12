package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.request.VehicleHealthUpdateRequest;
import com.Transitops.odoo.dto.request.VehicleRequest;
import com.Transitops.odoo.dto.request.VehicleStatusUpdateRequest;
import com.Transitops.odoo.dto.response.VehicleDetailsResponse;
import com.Transitops.odoo.dto.response.VehicleResponse;
import com.Transitops.odoo.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(@RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.createVehicle(request));
    }

    @GetMapping
    public ResponseEntity<List<VehicleDetailsResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/available")
    public ResponseEntity<List<VehicleDetailsResponse>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleDetailsResponse> getVehicleById(@PathVariable String vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleById(vehicleId));
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleDetailsResponse> updateVehicle(
            @PathVariable String vehicleId,
            @RequestBody VehicleRequest request
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicle(vehicleId, request));
    }

    @PatchMapping("/{vehicleId}/status")
    public ResponseEntity<VehicleResponse> updateVehicleStatus(
            @PathVariable String vehicleId,
            @RequestBody VehicleStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(vehicleId, request));
    }

    @PatchMapping("/{vehicleId}/health-score")
    public ResponseEntity<VehicleResponse> updateVehicleHealthScore(
            @PathVariable String vehicleId,
            @RequestBody VehicleHealthUpdateRequest request
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicleHealthScore(vehicleId, request));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> deleteVehicle(@PathVariable String vehicleId) {
        return ResponseEntity.ok(vehicleService.deleteVehicle(vehicleId));
    }
}