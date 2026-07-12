package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.Maintenance;
import com.Transitops.odoo.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, String> {

	List<Maintenance> findByStatus(MaintenanceStatus status);

	Optional<Maintenance> findByMaintenanceCode(String maintenanceCode);
}