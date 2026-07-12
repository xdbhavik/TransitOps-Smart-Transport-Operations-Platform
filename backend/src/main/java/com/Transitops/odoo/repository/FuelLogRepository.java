package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, String> {

	List<FuelLog> findByVehicle_IdOrderByFuelDateDesc(String vehicleId);

	Optional<FuelLog> findByFuelLogCode(String fuelLogCode);
}