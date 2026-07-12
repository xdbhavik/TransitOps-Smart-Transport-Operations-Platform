package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.request.FuelRequest;
import com.Transitops.odoo.dto.response.FuelHistoryResponse;
import com.Transitops.odoo.dto.response.FuelReportResponse;
import com.Transitops.odoo.dto.response.FuelResponse;
import com.Transitops.odoo.service.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;

    @PostMapping
    public ResponseEntity<FuelResponse> createFuelLog(@RequestBody FuelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fuelService.createFuelLog(request));
    }

    @GetMapping("/history/{vehicleId}")
    public ResponseEntity<List<FuelHistoryResponse>> getFuelHistory(@PathVariable String vehicleId) {
        return ResponseEntity.ok(fuelService.getFuelHistory(vehicleId));
    }

    @GetMapping("/report")
    public ResponseEntity<FuelReportResponse> getFuelReport() {
        return ResponseEntity.ok(fuelService.getFuelReport());
    }
}