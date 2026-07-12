package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.request.ExpenseRequest;
import com.Transitops.odoo.dto.response.ExpenseResponse;
import com.Transitops.odoo.entity.Expense;
import com.Transitops.odoo.entity.Trip;
import com.Transitops.odoo.entity.Vehicle;
import com.Transitops.odoo.repository.ExpenseRepository;
import com.Transitops.odoo.repository.TripRepository;
import com.Transitops.odoo.repository.VehicleRepository;
import com.Transitops.odoo.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;

    @Override
    public ExpenseResponse createExpense(ExpenseRequest request) {
        validateRequest(request);
        Expense expense = mapToEntity(new Expense(), request);
        return toResponse(expenseRepository.save(expense));
    }

    @Override
    public ExpenseResponse updateExpense(String id, ExpenseRequest request) {
        validateRequest(request);
        Expense expense = findExpenseById(id);
        mapToEntity(expense, request);
        return toResponse(expenseRepository.save(expense));
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(String id) {
        return toResponse(findExpenseById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void deleteExpense(String id) {
        Expense expense = findExpenseById(id);
        expenseRepository.delete(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByVehicle(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        return expenseRepository.findByVehicle(vehicle).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByTrip(String tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        return expenseRepository.findByTrip(trip).stream().map(this::toResponse).toList();
    }

    private Expense mapToEntity(Expense expense, ExpenseRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));

        expense.setVehicle(vehicle);
        expense.setTrip(trip);
        expense.setExpenseType(request.getExpenseType());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());
        return expense;
    }

    private void validateRequest(ExpenseRequest request) {
        if (request.getVehicleId() == null || request.getVehicleId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle ID is required");
        }
        if (request.getTripId() == null || request.getTripId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trip ID is required");
        }
        if (request.getExpenseType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expense Type is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }
        if (request.getExpenseDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expense Date is required");
        }
    }

    private Expense findExpenseById(String id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));
    }

    private ExpenseResponse toResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getVehicle() != null ? expense.getVehicle().getId() : null,
                expense.getTrip() != null ? expense.getTrip().getId() : null,
                expense.getExpenseType(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getExpenseDate(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}