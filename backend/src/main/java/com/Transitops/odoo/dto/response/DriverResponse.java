package com.Transitops.odoo.dto.response;

import com.Transitops.odoo.enums.DriverStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponse {

    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("license_number")
    private String licenseNumber;

    @JsonProperty("license_category")
    private String licenseCategory;

    @JsonProperty("license_expiry")
    private LocalDate licenseExpiry;

    @JsonProperty("contact_number")
    private String contactNumber;

    @JsonProperty("safety_score")
    private Integer safetyScore;

    @JsonProperty("status")
    private DriverStatus status;

    private String email;

    @JsonProperty("experience_years")
    private Integer experienceYears;

    @JsonProperty("employee_id")
    private String employeeId;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
