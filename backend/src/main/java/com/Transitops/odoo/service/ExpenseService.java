package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.ExpenseRequest;
import com.Transitops.odoo.dto.response.ExpenseResponse;

import java.util.List;

public interface ExpenseService {

    ExpenseResponse createExpense(ExpenseRequest request);

    ExpenseResponse updateExpense(String id, ExpenseRequest request);

    ExpenseResponse getExpenseById(String id);

    List<ExpenseResponse> getAllExpenses();

    void deleteExpense(String id);

    List<ExpenseResponse> getExpensesByVehicle(String vehicleId);

    List<ExpenseResponse> getExpensesByTrip(String tripId);
}