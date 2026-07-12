package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.VehicleHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleHealthRepository extends JpaRepository<VehicleHealth, String> {
}