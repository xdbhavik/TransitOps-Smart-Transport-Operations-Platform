package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.DriverStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DriverRequest {

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

    @JsonProperty("email")
    private String email;

    @JsonProperty("experience_years")
    private Integer experienceYears;

    @JsonProperty("license_issue_date")
    private LocalDate licenseIssueDate;
}
