package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.Expense;
import com.Transitops.odoo.entity.Trip;
import com.Transitops.odoo.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {

	List<Expense> findByVehicle(Vehicle vehicle);

	List<Expense> findByTrip(Trip trip);
}