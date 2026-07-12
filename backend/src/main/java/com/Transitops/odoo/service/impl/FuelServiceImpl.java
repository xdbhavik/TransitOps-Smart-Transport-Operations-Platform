package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.request.FuelRequest;
import com.Transitops.odoo.dto.response.FuelHistoryResponse;
import com.Transitops.odoo.dto.response.FuelReportResponse;
import com.Transitops.odoo.dto.response.FuelResponse;
import com.Transitops.odoo.entity.FuelLog;
import com.Transitops.odoo.entity.Trip;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.repository.FuelLogRepository;
import com.Transitops.odoo.repository.TripRepository;
import com.Transitops.odoo.repository.VehicleRepository;
import com.Transitops.odoo.service.FuelService;
import com.Transitops.odoo.service.SequenceNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FuelServiceImpl implements FuelService {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final SequenceNumberService sequenceNumberService;

    @Override
    public FuelResponse createFuelLog(FuelRequest request) {
        Vehicle vehicle = findVehicleOrThrow(request.getVehicleId());
        Trip trip = null;

        if (request.getTripId() != null && !request.getTripId().isBlank()) {
            trip = tripRepository.findById(request.getTripId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        }

        Double mileage = vehicle.getAverageMileage();

        FuelLog fuelLog = FuelLog.builder()
            .fuelLogCode(sequenceNumberService.nextCode("FL"))
                .vehicle(vehicle)
                .trip(trip)
                .liters(request.getLiters())
                .cost(request.getCost())
                .fuelStation(request.getFuelStation())
                .fuelDate(LocalDate.now())
                .mileage(mileage)
                .build();

        FuelLog savedFuelLog = fuelLogRepository.save(fuelLog);
        return new FuelResponse(savedFuelLog.getFuelLogCode(), mileage, "Fuel log created successfully");
    }

    @Override
    public List<FuelHistoryResponse> getFuelHistory(String vehicleId) {
        return fuelLogRepository.findByVehicle_IdOrderByFuelDateDesc(vehicleId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Override
    public FuelReportResponse getFuelReport() {
        List<FuelLog> logs = fuelLogRepository.findAll();
        double totalLiters = logs.stream().map(FuelLog::getLiters).filter(Objects::nonNull).mapToDouble(Double::doubleValue).sum();
        java.math.BigDecimal totalCost = logs.stream()
                .map(FuelLog::getCost)
                .filter(Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        double averageMileage = logs.stream().map(FuelLog::getMileage).filter(Objects::nonNull).mapToDouble(Double::doubleValue).average().orElse(0.0);

        return new FuelReportResponse(logs.size(), totalLiters, totalCost, averageMileage);
    }

    private Vehicle findVehicleOrThrow(String vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    private FuelHistoryResponse toHistoryResponse(FuelLog fuelLog) {
        return new FuelHistoryResponse(
                fuelLog.getFuelLogCode(),
                fuelLog.getVehicle() != null ? fuelLog.getVehicle().getId() : null,
                fuelLog.getTrip() != null ? fuelLog.getTrip().getId() : null,
                fuelLog.getLiters(),
                fuelLog.getCost(),
                fuelLog.getFuelStation(),
                fuelLog.getFuelDate(),
                fuelLog.getMileage()
        );
    }
}