package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.request.VehicleHealthUpdateRequest;
import com.Transitops.odoo.dto.request.VehicleRequest;
import com.Transitops.odoo.dto.request.VehicleStatusUpdateRequest;
import com.Transitops.odoo.dto.response.VehicleDetailsResponse;
import com.Transitops.odoo.dto.response.VehicleResponse;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.repository.VehicleRepository;
import com.Transitops.odoo.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vehicle registration number already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .vehicleName(request.getVehicleName())
                .model(request.getModel())
                .type(request.getType())
                .manufacturer(request.getManufacturer())
                .manufacturingYear(request.getManufacturingYear())
                .maximumLoadCapacity(request.getMaximumLoadCapacity())
                .fuelType(request.getFuelType())
                .fuelTankCapacity(request.getFuelTankCapacity())
                .averageMileage(request.getAverageMileage())
                .acquisitionCost(request.getAcquisitionCost())
                .build();

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return new VehicleResponse(savedVehicle.getId(), "Vehicle Created Successfully");
    }

    @Override
    public VehicleDetailsResponse getVehicleById(String vehicleId) {
        return toDetailsResponse(findVehicleOrThrow(vehicleId));
    }

    @Override
    public List<VehicleDetailsResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream().map(this::toDetailsResponse).toList();
    }

    @Override
    public List<VehicleDetailsResponse> getAvailableVehicles() {
        return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).stream().map(this::toDetailsResponse).toList();
    }

    @Override
    public VehicleDetailsResponse updateVehicle(String vehicleId, VehicleRequest request) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);

        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setVehicleName(request.getVehicleName());
        vehicle.setModel(request.getModel());
        vehicle.setType(request.getType());
        vehicle.setManufacturer(request.getManufacturer());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setMaximumLoadCapacity(request.getMaximumLoadCapacity());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setFuelTankCapacity(request.getFuelTankCapacity());
        vehicle.setAverageMileage(request.getAverageMileage());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        vehicle.setCurrentValue(request.getAcquisitionCost());

        return toDetailsResponse(vehicleRepository.save(vehicle));
    }

    @Override
    public VehicleResponse updateVehicleStatus(String vehicleId, VehicleStatusUpdateRequest request) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        vehicle.setStatus(request.getStatus());
        vehicleRepository.save(vehicle);
        return new VehicleResponse(vehicle.getId(), "Vehicle status updated successfully");
    }

    @Override
    public VehicleResponse updateVehicleHealthScore(String vehicleId, VehicleHealthUpdateRequest request) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        vehicle.setHealthScore(request.getHealthScore());
        vehicleRepository.save(vehicle);
        return new VehicleResponse(vehicle.getId(), "Vehicle health score updated successfully");
    }

    @Override
    public VehicleResponse deleteVehicle(String vehicleId) {
        Vehicle vehicle = findVehicleOrThrow(vehicleId);
        vehicleRepository.delete(vehicle);
        return new VehicleResponse(vehicleId, "Vehicle deleted successfully");
    }

    private Vehicle findVehicleOrThrow(String vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

    private VehicleDetailsResponse toDetailsResponse(Vehicle vehicle) {
        return new VehicleDetailsResponse(
                vehicle.getId(),
                vehicle.getRegistrationNumber(),
                vehicle.getVehicleName(),
                vehicle.getModel(),
                vehicle.getType(),
                vehicle.getManufacturer(),
                vehicle.getManufacturingYear(),
                vehicle.getMaximumLoadCapacity(),
                vehicle.getOdometer(),
                vehicle.getAcquisitionCost(),
                vehicle.getCurrentValue(),
                vehicle.getFuelType(),
                vehicle.getFuelTankCapacity(),
                vehicle.getAverageMileage(),
                vehicle.getHealthScore(),
                vehicle.getTotalCarbonEmission(),
                vehicle.getStatus()
        );
    }
}