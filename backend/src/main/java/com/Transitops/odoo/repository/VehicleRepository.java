package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {

	boolean existsByRegistrationNumber(String registrationNumber);

	List<Vehicle> findByStatus(VehicleStatus status);
}