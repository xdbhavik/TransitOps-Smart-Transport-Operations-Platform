package com.Transitops.odoo.config;

import com.Transitops.odoo.dto.response.LicenseReminderResponse;
import com.Transitops.odoo.service.DriverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LicenseReminderScheduler {

    private final DriverService driverService;

    @Value("${app.license-reminder.enabled:true}")
    private boolean licenseReminderEnabled;

    @Scheduled(cron = "${app.license-reminder.cron:0 0 8 * * *}")
    public void sendExpiringLicenseReminders() {
        if (!licenseReminderEnabled) {
            return;
        }

        LicenseReminderResponse response = driverService.sendLicenseExpiryReminders();
        log.info("License reminder job finished: matched={}, sent={}", response.getMatched(), response.getSent());
    }
}