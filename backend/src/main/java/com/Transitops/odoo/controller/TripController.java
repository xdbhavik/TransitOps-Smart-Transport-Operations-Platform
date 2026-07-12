package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.request.TripCancelRequest;
import com.Transitops.odoo.dto.request.TripCompleteRequest;
import com.Transitops.odoo.dto.request.TripDispatchRequest;
import com.Transitops.odoo.dto.request.TripRequest;
import com.Transitops.odoo.dto.request.TripTrackingRequest;
import com.Transitops.odoo.dto.response.TripAnalyticsResponse;
import com.Transitops.odoo.dto.response.TripEtaResponse;
import com.Transitops.odoo.dto.response.TripLocationResponse;
import com.Transitops.odoo.dto.response.TripResponse;
import com.Transitops.odoo.dto.response.TripTrackingResponse;
import com.Transitops.odoo.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@RequestBody TripRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(request));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable String tripId,
            @RequestBody TripRequest request
    ) {
        return ResponseEntity.ok(tripService.updateTrip(tripId, request));
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/active")
    public ResponseEntity<List<TripResponse>> getActiveTrips() {
        return ResponseEntity.ok(tripService.getActiveTrips());
    }

    @GetMapping("/completed")
    public ResponseEntity<List<TripResponse>> getCompletedTrips() {
        return ResponseEntity.ok(tripService.getCompletedTrips());
    }

    @GetMapping("/cancelled")
    public ResponseEntity<List<TripResponse>> getCancelledTrips() {
        return ResponseEntity.ok(tripService.getCancelledTrips());
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getTripById(tripId));
    }

    @PostMapping("/{tripId}/dispatch")
    public ResponseEntity<TripResponse> dispatchTrip(
            @PathVariable String tripId,
            @RequestBody TripDispatchRequest request
    ) {
        return ResponseEntity.ok(tripService.dispatchTrip(tripId, request));
    }

    @PostMapping("/{tripId}/complete")
    public ResponseEntity<TripResponse> completeTrip(
            @PathVariable String tripId,
            @RequestBody TripCompleteRequest request
    ) {
        return ResponseEntity.ok(tripService.completeTrip(tripId, request));
    }

    @PostMapping("/{tripId}/cancel")
    public ResponseEntity<TripResponse> cancelTrip(
            @PathVariable String tripId,
            @RequestBody TripCancelRequest request
    ) {
        return ResponseEntity.ok(tripService.cancelTrip(tripId, request));
    }

    @PostMapping("/{tripId}/tracking")
    public ResponseEntity<TripTrackingResponse> addTracking(
            @PathVariable String tripId,
            @RequestBody TripTrackingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.addTracking(tripId, request));
    }

    @GetMapping("/{tripId}/tracking")
    public ResponseEntity<List<TripTrackingResponse>> getTracking(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getTracking(tripId));
    }

    @GetMapping("/{tripId}/location")
    public ResponseEntity<TripLocationResponse> getCurrentLocation(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getCurrentLocation(tripId));
    }

    @GetMapping("/{tripId}/eta")
    public ResponseEntity<TripEtaResponse> getEta(@PathVariable String tripId) {
        return ResponseEntity.ok(tripService.getEta(tripId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<TripAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(tripService.getAnalytics());
    }
}
