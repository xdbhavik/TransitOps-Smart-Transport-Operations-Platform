package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.Trip;
import com.Transitops.odoo.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {

    List<Trip> findByTripStatus(TripStatus tripStatus);

    List<Trip> findByTripStatusIn(List<TripStatus> tripStatuses);

    boolean existsByDriver_IdAndTripStatusIn(String driverId, List<TripStatus> tripStatuses);

    boolean existsByVehicle_IdAndTripStatusIn(String vehicleId, List<TripStatus> tripStatuses);
}