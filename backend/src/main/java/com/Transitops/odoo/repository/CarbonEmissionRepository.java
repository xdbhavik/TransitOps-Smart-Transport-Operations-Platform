package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.CarbonEmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarbonEmissionRepository extends JpaRepository<CarbonEmission, String> {
}