package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.request.MaintenanceRequest;
import com.Transitops.odoo.dto.response.MaintenanceResponse;
import com.Transitops.odoo.entity.Maintenance;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.enums.MaintenanceStatus;
import com.Transitops.odoo.enums.VehicleStatus;
import com.Transitops.odoo.repository.MaintenanceRepository;
import com.Transitops.odoo.repository.VehicleRepository;
import com.Transitops.odoo.service.MaintenanceService;
import com.Transitops.odoo.service.SequenceNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final SequenceNumberService sequenceNumberService;

    @Override
    public MaintenanceResponse createMaintenance(MaintenanceRequest request) {
        Vehicle vehicle = findVehicleOrThrow(request.getVehicleId());
        vehicle.setStatus(VehicleStatus.IN_SHOP);
        vehicleRepository.save(vehicle);

        Maintenance maintenance = Maintenance.builder()
            .maintenanceCode(sequenceNumberService.nextCode("MNT"))
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .serviceCenter(request.getServiceCenter())
                .cost(request.getCost())
                .status(MaintenanceStatus.IN_PROGRESS)
                .maintenanceDate(LocalDate.now())
                .build();

        Maintenance savedMaintenance = maintenanceRepository.save(maintenance);

        return new MaintenanceResponse(
            savedMaintenance.getMaintenanceCode(),
                vehicle.getStatus().name(),
                "Maintenance created successfully"
        );
    }

    @Override
    public MaintenanceResponse completeMaintenance(String maintenanceId) {
        Maintenance maintenance = maintenanceRepository.findByMaintenanceCode(maintenanceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance not found"));

        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenanceRepository.save(maintenance);

        Vehicle vehicle = maintenance.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        return new MaintenanceResponse(
            maintenance.getMaintenanceCode(),
                vehicle.getStatus().name(),
                "Maintenance completed successfully"
        );
    }

    @Override
    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    @Override
    public List<Maintenance> getUpcomingMaintenance() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.SCHEDULED).stream()
                .filter(maintenance -> maintenance.getNextMaintenanceDate() == null
                        || !maintenance.getNextMaintenanceDate().isBefore(LocalDate.now()))
                .toList();
    }

    private Vehicle findVehicleOrThrow(String vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
    }

}