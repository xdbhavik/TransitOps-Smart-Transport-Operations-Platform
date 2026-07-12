package com.Transitops.odoo.service.impl;

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
import com.Transitops.odoo.entity.Driver;
import com.Transitops.odoo.entity.LiveTracking;
import com.Transitops.odoo.entity.Trip;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.enums.DriverStatus;
import com.Transitops.odoo.enums.TripStatus;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.repository.DriverRepository;
import com.Transitops.odoo.repository.LiveTrackingRepository;
import com.Transitops.odoo.repository.TripRepository;
import com.Transitops.odoo.repository.VehicleRepository;
import com.Transitops.odoo.service.SequenceNumberService;
import com.Transitops.odoo.service.TripService;
import com.Transitops.odoo.service.VehicleService;
import com.Transitops.odoo.dto.request.VehicleStatusUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TripServiceImpl implements TripService {

    private static final List<TripStatus> ACTIVE_STATUSES = List.of(TripStatus.DISPATCHED, TripStatus.IN_TRANSIT);

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final LiveTrackingRepository liveTrackingRepository;
    private final SequenceNumberService sequenceNumberService;
    private final VehicleService vehicleService;

    @Override
    public TripResponse createTrip(TripRequest request) {
        validateTripRequest(request);
        Driver driver = validateDriverForAssignment(request.getDriverId());
        Vehicle vehicle = validateVehicleForAssignment(request.getVehicleId(), request.getCargoWeight());
        assertNoActiveAssignment(driver.getId(), vehicle.getId());

        Trip trip = Trip.builder()
                .tripNumber(sequenceNumberService.nextCode("TRIP-"))
                .source(request.getSource())
                .destination(request.getDestination())
                .cargoWeight(request.getCargoWeight())
                .plannedDistance(request.getPlannedDistance())
                .startTime(request.getScheduledStart())
                .endTime(request.getScheduledEnd())
                .estimatedArrival(request.getEstimatedArrival())
                .driver(driver)
                .vehicle(vehicle)
                .tripStatus(TripStatus.DRAFT)
                .build();

        Trip saved = tripRepository.save(trip);
        return toResponse(saved);
    }

    @Override
    public TripResponse updateTrip(String tripId, TripRequest request) {
        validateTripRequest(request);
        Trip trip = findTripById(tripId);
        verifyDraftOnly(trip, "Only draft trips can be updated");

        Driver driver = validateDriverForAssignment(request.getDriverId());
        Vehicle vehicle = validateVehicleForAssignment(request.getVehicleId(), request.getCargoWeight());
        if (!trip.getDriver().getId().equals(driver.getId()) || !trip.getVehicle().getId().equals(vehicle.getId())) {
            assertNoActiveAssignment(driver.getId(), vehicle.getId());
        }

        trip.setSource(request.getSource());
        trip.setDestination(request.getDestination());
        trip.setCargoWeight(request.getCargoWeight());
        trip.setPlannedDistance(request.getPlannedDistance());
        trip.setStartTime(request.getScheduledStart());
        trip.setEndTime(request.getScheduledEnd());
        trip.setEstimatedArrival(request.getEstimatedArrival());
        trip.setDriver(driver);
        trip.setVehicle(vehicle);

        return toResponse(tripRepository.save(trip));
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripById(String tripId) {
        return toResponse(findTripById(tripId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getAllTrips() {
        return mapTrips(tripRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getActiveTrips() {
        return mapTrips(tripRepository.findByTripStatusIn(ACTIVE_STATUSES));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getCompletedTrips() {
        return mapTrips(tripRepository.findByTripStatus(TripStatus.COMPLETED));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getCancelledTrips() {
        return mapTrips(tripRepository.findByTripStatus(TripStatus.CANCELLED));
    }

    @Override
    public TripResponse dispatchTrip(String tripId, TripDispatchRequest request) {
        Trip trip = findTripById(tripId);
        if (trip.getTripStatus() != TripStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only draft trips can be dispatched");
        }

        Driver driver = validateDriverForAssignment(trip.getDriver().getId());
        Vehicle vehicle = validateVehicleForAssignment(trip.getVehicle().getId(), trip.getCargoWeight());
        assertNoActiveAssignment(driver.getId(), vehicle.getId());

        if (request.getDispatchTime() != null) {
            trip.setStartTime(request.getDispatchTime());
        } else if (trip.getStartTime() == null) {
            trip.setStartTime(LocalDateTime.now());
        }

        if (request.getEstimatedArrival() != null) {
            trip.setEstimatedArrival(request.getEstimatedArrival());
        }

        trip.setTripStatus(TripStatus.DISPATCHED);
        Trip saved = tripRepository.save(trip);
        updateDriverStatus(driver, DriverStatus.ON_TRIP);
        vehicleService.updateVehicleStatus(vehicle.getId(), new VehicleStatusUpdateRequest(VehicleStatus.ON_TRIP));

        return toResponse(saved);
    }

    @Override
    public TripResponse completeTrip(String tripId, TripCompleteRequest request) {
        Trip trip = findTripById(tripId);
        if (!ACTIVE_STATUSES.contains(trip.getTripStatus()) && trip.getTripStatus() != TripStatus.DISPATCHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only dispatched or in-transit trips can be completed");
        }

        if (request.getActualEnd() != null) {
            trip.setEndTime(request.getActualEnd());
        } else if (trip.getEndTime() == null) {
            trip.setEndTime(LocalDateTime.now());
        }

        if (request.getActualDistance() != null) {
            trip.setActualDistance(request.getActualDistance());
        }
        if (request.getFuelConsumed() != null) {
            trip.setFuelConsumed(request.getFuelConsumed());
        }

        trip.setTripStatus(TripStatus.COMPLETED);
        Trip saved = tripRepository.save(trip);
        updateDriverStatus(saved.getDriver(), DriverStatus.AVAILABLE);
        vehicleService.updateVehicleStatus(saved.getVehicle().getId(), new VehicleStatusUpdateRequest(VehicleStatus.AVAILABLE));

        return toResponse(saved);
    }

    @Override
    public TripResponse cancelTrip(String tripId, TripCancelRequest request) {
        Trip trip = findTripById(tripId);
        if (trip.getTripStatus() == TripStatus.COMPLETED || trip.getTripStatus() == TripStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed or cancelled trips cannot be changed");
        }

        trip.setTripStatus(TripStatus.CANCELLED);
        if (request.getCancelledAt() != null) {
            trip.setEndTime(request.getCancelledAt());
        }

        Trip saved = tripRepository.save(trip);
        updateDriverStatus(saved.getDriver(), DriverStatus.AVAILABLE);
        vehicleService.updateVehicleStatus(saved.getVehicle().getId(), new VehicleStatusUpdateRequest(VehicleStatus.AVAILABLE));

        return toResponse(saved);
    }

    @Override
    public TripTrackingResponse addTracking(String tripId, TripTrackingRequest request) {
        Trip trip = findTripById(tripId);
        if (trip.getTripStatus() == TripStatus.DRAFT || trip.getTripStatus() == TripStatus.COMPLETED || trip.getTripStatus() == TripStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tracking updates are only allowed for active trips");
        }

        if (trip.getTripStatus() == TripStatus.DISPATCHED) {
            trip.setTripStatus(TripStatus.IN_TRANSIT);
        }

        if (request.getEta() != null) {
            trip.setEstimatedArrival(request.getEta());
        }

        tripRepository.save(trip);

        LiveTracking tracking = LiveTracking.builder()
                .trip(trip)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .distanceRemaining(request.getDistanceRemaining())
                .eta(request.getEta())
                .timestamp(request.getTimestamp())
                .build();

        return toTrackingResponse(liveTrackingRepository.save(tracking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripTrackingResponse> getTracking(String tripId) {
        verifyTripExists(tripId);
        return liveTrackingRepository.findByTrip_IdOrderByTimestampDesc(tripId).stream()
                .map(this::toTrackingResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TripLocationResponse getCurrentLocation(String tripId) {
        verifyTripExists(tripId);
        LiveTracking latest = findLatestTracking(tripId);
        return new TripLocationResponse(
                latest.getLatitude(),
                latest.getLongitude(),
                latest.getSpeed(),
                latest.getHeading(),
                latest.getTimestamp()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TripEtaResponse getEta(String tripId) {
        verifyTripExists(tripId);
        List<LiveTracking> trackingHistory = liveTrackingRepository.findByTrip_IdOrderByTimestampDesc(tripId);
        Optional<LiveTracking> latest = trackingHistory.stream().filter(t -> t.getEta() != null).findFirst();
        if (latest.isPresent()) {
            return new TripEtaResponse(latest.get().getEta(), latest.get().getDistanceRemaining());
        }

        Trip trip = findTripById(tripId);
        if (trip.getEstimatedArrival() != null) {
            return new TripEtaResponse(trip.getEstimatedArrival(), null);
        }

        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No ETA available for this trip");
    }

    @Override
    @Transactional(readOnly = true)
    public TripAnalyticsResponse getAnalytics() {
        List<Trip> activeTrips = tripRepository.findByTripStatusIn(ACTIVE_STATUSES);
        List<Trip> completedTrips = tripRepository.findByTripStatus(TripStatus.COMPLETED);
        List<Trip> cancelledTrips = tripRepository.findByTripStatus(TripStatus.CANCELLED);

        double averageDistance = completedTrips.stream()
                .mapToDouble(trip -> trip.getActualDistance() != null ? trip.getActualDistance() : (trip.getPlannedDistance() != null ? trip.getPlannedDistance() : 0.0))
                .average()
                .orElse(0.0);

        double averageDurationMinutes = completedTrips.stream()
                .filter(trip -> trip.getStartTime() != null && trip.getEndTime() != null)
                .mapToLong(trip -> Duration.between(trip.getStartTime(), trip.getEndTime()).toMinutes())
                .average()
                .orElse(0.0);

        return new TripAnalyticsResponse(
                (long) activeTrips.size(),
                (long) completedTrips.size(),
                (long) cancelledTrips.size(),
                averageDistance,
                averageDurationMinutes
        );
    }

    private void validateTripRequest(TripRequest request) {
        if (request.getSource() == null || request.getSource().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source is required");
        }
        if (request.getDestination() == null || request.getDestination().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destination is required");
        }
        if (request.getDriverId() == null || request.getDriverId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver ID is required");
        }
        if (request.getVehicleId() == null || request.getVehicleId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle ID is required");
        }
        if (request.getCargoWeight() == null || request.getCargoWeight() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cargo weight must be greater than zero");
        }
        if (request.getPlannedDistance() == null || request.getPlannedDistance() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Planned distance must be greater than zero");
        }
    }

    private Driver validateDriverForAssignment(String driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver is not available for assignment");
        }
        if (driver.getLicenseExpiryDate() == null || driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver license is expired or invalid");
        }
        return driver;
    }

    private Vehicle validateVehicleForAssignment(String vehicleId, Double cargoWeight) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle is not available for assignment");
        }
        if (vehicle.getMaximumLoadCapacity() == null || cargoWeight > vehicle.getMaximumLoadCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cargo weight exceeds vehicle capacity");
        }
        if (vehicle.getHealthScore() == null || vehicle.getHealthScore() < 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle health is not sufficient for dispatch");
        }
        return vehicle;
    }

    private void assertNoActiveAssignment(String driverId, String vehicleId) {
        if (tripRepository.existsByDriver_IdAndTripStatusIn(driverId, ACTIVE_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected driver is already assigned to an active trip");
        }
        if (tripRepository.existsByVehicle_IdAndTripStatusIn(vehicleId, ACTIVE_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected vehicle is already assigned to an active trip");
        }
    }

    private Trip findTripById(String tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
    }

    private void verifyDraftOnly(Trip trip, String message) {
        if (trip.getTripStatus() != TripStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private void verifyTripExists(String tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found");
        }
    }

    private TripTrackingResponse toTrackingResponse(LiveTracking tracking) {
        return new TripTrackingResponse(
                tracking.getId(),
                tracking.getLatitude(),
                tracking.getLongitude(),
                tracking.getSpeed(),
                tracking.getHeading(),
                tracking.getDistanceRemaining(),
                tracking.getEta(),
                tracking.getTimestamp()
        );
    }

    private TripResponse toResponse(Trip trip) {
        return new TripResponse(
                trip.getId(),
                trip.getTripNumber(),
                trip.getSource(),
                trip.getDestination(),
                trip.getDriver() != null ? trip.getDriver().getId() : null,
                trip.getVehicle() != null ? trip.getVehicle().getId() : null,
                trip.getCargoWeight(),
                trip.getPlannedDistance(),
                trip.getActualDistance(),
                trip.getStartTime(),
                trip.getEndTime(),
                trip.getEstimatedArrival(),
                trip.getEndTime(),
                trip.getFuelConsumed(),
                trip.getTripStatus() != null ? trip.getTripStatus().name() : null,
                trip.getCreatedAt(),
                trip.getUpdatedAt()
        );
    }

    private List<TripResponse> mapTrips(List<Trip> trips) {
        List<TripResponse> responses = new ArrayList<>();
        trips.forEach(trip -> responses.add(toResponse(trip)));
        return responses;
    }

    private LiveTracking findLatestTracking(String tripId) {
        return liveTrackingRepository.findByTrip_IdOrderByTimestampDesc(tripId).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No tracking data available for this trip"));
    }

    private void updateDriverStatus(Driver driver, DriverStatus status) {
        driver.setStatus(status);
        driverRepository.save(driver);
    }
}
