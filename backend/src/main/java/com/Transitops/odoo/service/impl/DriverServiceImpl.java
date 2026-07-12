package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.request.DriverRequest;
import com.Transitops.odoo.dto.response.DriverAvailabilityResponse;
import com.Transitops.odoo.dto.response.DriverResponse;
import com.Transitops.odoo.dto.response.LicenseReminderResponse;
import com.Transitops.odoo.dto.response.LicenseStatusResponse;
import com.Transitops.odoo.entity.Driver;
import com.Transitops.odoo.enums.DriverStatus;
import com.Transitops.odoo.exception.ConflictException;
import com.Transitops.odoo.exception.ResourceNotFoundException;
import com.Transitops.odoo.exception.ValidationException;
import com.Transitops.odoo.repository.DriverRepository;
import com.Transitops.odoo.service.DriverService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final JavaMailSender mailSender;

    @Value("${app.license-reminder.enabled:true}")
    private boolean licenseReminderEnabled;

    @Value("${app.license-reminder.days-before-expiry:30}")
    private int reminderDaysBeforeExpiry;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Override
    @Transactional
    public DriverResponse registerDriver(DriverRequest request) {
        // Enforce uniqueness constraints
        if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new ConflictException("License number already exists");
        }

        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            email = request.getLicenseNumber().toLowerCase() + "@transitops.com";
        }
        if (driverRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Email already exists");
        }

        if (driverRepository.findByPhone(request.getContactNumber()).isPresent()) {
            throw new ConflictException("Phone number already exists");
        }

        // Validate safety score
        if (request.getSafetyScore() != null && (request.getSafetyScore() < 0 || request.getSafetyScore() > 100)) {
            throw new ValidationException("Safety score must be between 0 and 100");
        }

        // Validate license expiry
        if (request.getLicenseIssueDate() != null && request.getLicenseExpiry() != null) {
            if (!request.getLicenseExpiry().isAfter(request.getLicenseIssueDate())) {
                throw new ValidationException("License expiry date must be after the issue date");
            }
        }

        // Generate employee ID (required by constraint in original entity)
        String employeeId = "EMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        DriverStatus initialStatus = request.getStatus() != null ? request.getStatus() : DriverStatus.AVAILABLE;

        Driver driver = Driver.builder()
                .fullName(request.getName())
                .employeeId(employeeId)
                .licenseNumber(request.getLicenseNumber())
                .licenseCategory(request.getLicenseCategory())
                .licenseExpiryDate(request.getLicenseExpiry())
                .phone(request.getContactNumber())
                .email(email)
                .safetyScore(request.getSafetyScore() != null ? request.getSafetyScore() : 100)
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .status(initialStatus)
                .build();

        Driver saved = driverRepository.save(driver);
        return mapToResponse(saved);
    }

    @Override
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DriverResponse getDriverById(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        return mapToResponse(driver);
    }

    @Override
    @Transactional
    public DriverResponse updateDriver(String id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        // Uniqueness checks
        if (request.getLicenseNumber() != null && !request.getLicenseNumber().equalsIgnoreCase(driver.getLicenseNumber())) {
            if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
                throw new ConflictException("License number already exists");
            }
            driver.setLicenseNumber(request.getLicenseNumber());
        }

        String email = request.getEmail();
        if (email != null && !email.trim().isEmpty() && !email.equalsIgnoreCase(driver.getEmail())) {
            if (driverRepository.findByEmail(email).isPresent()) {
                throw new ConflictException("Email already exists");
            }
            driver.setEmail(email);
        }

        if (request.getContactNumber() != null && !request.getContactNumber().equalsIgnoreCase(driver.getPhone())) {
            if (driverRepository.findByPhone(request.getContactNumber()).isPresent()) {
                throw new ConflictException("Phone number already exists");
            }
            driver.setPhone(request.getContactNumber());
        }

        // Validate safety score
        if (request.getSafetyScore() != null) {
            if (request.getSafetyScore() < 0 || request.getSafetyScore() > 100) {
                throw new ValidationException("Safety score must be between 0 and 100");
            }
            driver.setSafetyScore(request.getSafetyScore());
        }

        // Validate license expiry
        if (request.getLicenseExpiry() != null) {
            if (request.getLicenseIssueDate() != null) {
                if (!request.getLicenseExpiry().isAfter(request.getLicenseIssueDate())) {
                    throw new ValidationException("License expiry date must be after the issue date");
                }
            }
            driver.setLicenseExpiryDate(request.getLicenseExpiry());
        }

        if (request.getName() != null) {
            driver.setFullName(request.getName());
        }
        if (request.getLicenseCategory() != null) {
            driver.setLicenseCategory(request.getLicenseCategory());
        }
        if (request.getExperienceYears() != null) {
            driver.setExperienceYears(request.getExperienceYears());
        }
        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }

        Driver updated = driverRepository.save(driver);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDriver(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        // Rule 6: Cannot delete if status is ON_TRIP
        if (driver.getStatus() == DriverStatus.ON_TRIP) {
            throw new ValidationException("Cannot delete driver who is currently on a trip");
        }

        driverRepository.delete(driver);
    }

    @Override
    public List<DriverResponse> getAvailableDrivers() {
        LocalDate today = LocalDate.now();
        return driverRepository.findByStatus(DriverStatus.AVAILABLE).stream()
                .filter(d -> d.getLicenseExpiryDate() != null && !d.getLicenseExpiryDate().isBefore(today))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DriverResponse> getOnTripDrivers() {
        return driverRepository.findByStatus(DriverStatus.ON_TRIP).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DriverResponse> getLicenseExpiringDrivers() {
        LocalDate maxExpiryDate = LocalDate.now().plusDays(30);
        return driverRepository.findByLicenseExpiryDateLessThanEqual(maxExpiryDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DriverResponse updateDriverStatus(String id, DriverStatus status) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        driver.setStatus(status);
        Driver saved = driverRepository.save(driver);
        return mapToResponse(saved);
    }

    @Override
    public DriverAvailabilityResponse checkAvailability(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        LocalDate today = LocalDate.now();
        boolean isLicenseValid = driver.getLicenseExpiryDate() != null && !driver.getLicenseExpiryDate().isBefore(today);
        boolean isAvailable = driver.getStatus() == DriverStatus.AVAILABLE && isLicenseValid;

        return new DriverAvailabilityResponse(isAvailable);
    }

    @Override
    public LicenseStatusResponse checkLicenseStatus(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));

        LocalDate today = LocalDate.now();
        LocalDate expiryDate = driver.getLicenseExpiryDate();
        if (expiryDate == null) {
            return new LicenseStatusResponse(false, 0);
        }

        boolean isValid = !expiryDate.isBefore(today);
        long expiresIn = ChronoUnit.DAYS.between(today, expiryDate);

        return new LicenseStatusResponse(isValid, expiresIn);
    }

    @Override
    public LicenseReminderResponse sendLicenseExpiryReminders() {
        if (!licenseReminderEnabled) {
            return new LicenseReminderResponse(0, 0, "License reminders are disabled");
        }

        LocalDate today = LocalDate.now();
        LocalDate reminderEndDate = today.plusDays(reminderDaysBeforeExpiry);
        List<Driver> expiringDrivers = driverRepository.findByLicenseExpiryDateBetween(today, reminderEndDate).stream()
                .filter(driver -> driver.getEmail() != null && !driver.getEmail().isBlank())
                .toList();

        int sentCount = 0;
        for (Driver driver : expiringDrivers) {
            if (sendReminderEmail(driver, today, reminderEndDate)) {
                sentCount++;
            }
        }

        return new LicenseReminderResponse(expiringDrivers.size(), sentCount,
                "Sent reminders for licenses expiring within " + reminderDaysBeforeExpiry + " days");
    }

    private boolean sendReminderEmail(Driver driver, LocalDate today, LocalDate reminderEndDate) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (mailFrom != null && !mailFrom.isBlank()) {
                message.setFrom(mailFrom);
            }
            message.setTo(driver.getEmail());
            message.setSubject("TransitOps License Expiry Reminder");
            message.setText(buildReminderBody(driver, today, reminderEndDate));
            mailSender.send(message);
            return true;
        } catch (Exception exception) {
            log.warn("Failed to send license reminder to {} ({}): {}", driver.getFullName(), driver.getEmail(), exception.getMessage());
            return false;
        }
    }

    private String buildReminderBody(Driver driver, LocalDate today, LocalDate reminderEndDate) {
        long daysLeft = ChronoUnit.DAYS.between(today, driver.getLicenseExpiryDate());
        return String.join(System.lineSeparator(),
                "Hello " + driver.getFullName() + ",",
                "",
                "This is a reminder that your driving license is expiring soon.",
                "License Number: " + driver.getLicenseNumber(),
                "License Category: " + safeValue(driver.getLicenseCategory()),
                "Expiry Date: " + driver.getLicenseExpiryDate(),
                "Days Left: " + daysLeft,
                "Reminder Window Ends: " + reminderEndDate,
                "",
                "Please renew your license and update the TransitOps team.",
                "",
                "Regards,",
                "TransitOps Fleet Operations");
    }

    private String safeValue(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }

    private DriverResponse mapToResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getFullName())
                .licenseNumber(driver.getLicenseNumber())
                .licenseCategory(driver.getLicenseCategory())
                .licenseExpiry(driver.getLicenseExpiryDate())
                .contactNumber(driver.getPhone())
                .safetyScore(driver.getSafetyScore())
                .status(driver.getStatus())
                .email(driver.getEmail())
                .experienceYears(driver.getExperienceYears())
                .employeeId(driver.getEmployeeId())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
