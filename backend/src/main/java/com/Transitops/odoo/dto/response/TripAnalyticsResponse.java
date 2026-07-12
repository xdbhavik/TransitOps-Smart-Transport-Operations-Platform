package com.Transitops.odoo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripAnalyticsResponse {

    private Long activeCount;
    private Long completedCount;
    private Long cancelledCount;
    private Double averageDistance;
    private Double averageDurationMinutes;
}
