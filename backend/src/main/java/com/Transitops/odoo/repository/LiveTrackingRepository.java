package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.LiveTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveTrackingRepository extends JpaRepository<LiveTracking, String> {

    List<LiveTracking> findByTrip_IdOrderByTimestampDesc(String tripId);
}