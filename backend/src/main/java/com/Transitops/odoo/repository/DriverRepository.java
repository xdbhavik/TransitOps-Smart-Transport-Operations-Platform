package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.Driver;
import com.Transitops.odoo.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, String> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    Optional<Driver> findByEmail(String email);
    Optional<Driver> findByPhone(String phone);
    List<Driver> findByStatus(DriverStatus status);
    List<Driver> findByLicenseExpiryDateLessThanEqual(LocalDate date);
}