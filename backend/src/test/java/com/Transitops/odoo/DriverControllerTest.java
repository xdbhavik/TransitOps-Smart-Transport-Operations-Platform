package com.Transitops.odoo;

import com.Transitops.odoo.dto.request.DriverRequest;
import com.Transitops.odoo.enums.DriverStatus;
import com.Transitops.odoo.enums.RoleName;
import com.Transitops.odoo.enums.UserStatus;
import com.Transitops.odoo.entity.Driver;
import com.Transitops.odoo.entity.Role;
import com.Transitops.odoo.entity.User;
import com.Transitops.odoo.repository.DriverRepository;
import com.Transitops.odoo.repository.RoleRepository;
import com.Transitops.odoo.repository.UserRepository;
import com.Transitops.odoo.security.UserPrincipal;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DriverControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private UserPrincipal safetyOfficerPrincipal;
    private UserPrincipal generalUserPrincipal;

    @BeforeEach
    public void setUp() {
        driverRepository.deleteAll();

        // Seed Roles
        Role safetyOfficerRole = roleRepository.findByRoleName(RoleName.SAFETY_OFFICER)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(RoleName.SAFETY_OFFICER).build()));
        
        Role driverRole = roleRepository.findByRoleName(RoleName.FLEET_MANAGER)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(RoleName.FLEET_MANAGER).build()));

        // Create Users
        User safetyOfficer = User.builder()
                .fullName("Safety Officer User")
                .email("safety@transitops.com")
                .password("password")
                .phone("1234567890")
                .role(safetyOfficerRole)
                .status(UserStatus.ACTIVE)
                .build();
        safetyOfficer = userRepository.save(safetyOfficer);
        safetyOfficerPrincipal = new UserPrincipal(safetyOfficer);

        User regularUser = User.builder()
                .fullName("Regular User")
                .email("regular@transitops.com")
                .password("password")
                .phone("0987654321")
                .role(driverRole)
                .status(UserStatus.ACTIVE)
                .build();
        regularUser = userRepository.save(regularUser);
        generalUserPrincipal = new UserPrincipal(regularUser);
    }

    @Test
    public void testRegisterDriverSuccess() throws Exception {
        DriverRequest request = new DriverRequest();
        request.setName("Rahul Kumar");
        request.setLicenseNumber("DL-98765");
        request.setLicenseCategory("HMV");
        request.setLicenseExpiry(LocalDate.now().plusYears(5));
        request.setContactNumber("9999988888");
        request.setSafetyScore(95);
        request.setStatus(DriverStatus.AVAILABLE);

        mockMvc.perform(post("/drivers")
                        .with(SecurityMockMvcRequestPostProcessors.user(safetyOfficerPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Rahul Kumar")))
                .andExpect(jsonPath("$.license_number", is("DL-98765")))
                .andExpect(jsonPath("$.contact_number", is("9999988888")))
                .andExpect(jsonPath("$.safety_score", is(95)))
                .andExpect(jsonPath("$.status", is("Available")));
    }

    @Test
    public void testRegisterDriverDuplicateLicense() throws Exception {
        Driver existing = Driver.builder()
                .fullName("Existing Driver")
                .employeeId("EMP-1")
                .licenseNumber("DL-98765")
                .licenseCategory("HMV")
                .licenseExpiryDate(LocalDate.now().plusYears(1))
                .phone("9999988888")
                .email("existing@transitops.com")
                .status(DriverStatus.AVAILABLE)
                .safetyScore(90)
                .build();
        driverRepository.save(existing);

        DriverRequest request = new DriverRequest();
        request.setName("New Driver");
        request.setLicenseNumber("DL-98765"); // Duplicate license number
        request.setLicenseCategory("LMV");
        request.setLicenseExpiry(LocalDate.now().plusYears(2));
        request.setContactNumber("7777766666");
        request.setSafetyScore(80);

        mockMvc.perform(post("/drivers")
                        .with(SecurityMockMvcRequestPostProcessors.user(safetyOfficerPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("License number already exists")));
    }

    @Test
    public void testGetDriverAvailability() throws Exception {
        Driver driver = Driver.builder()
                .fullName("Elena Rostova")
                .employeeId("EMP-2")
                .licenseNumber("CDL-B44")
                .licenseCategory("HMV")
                .licenseExpiryDate(LocalDate.now().plusDays(10))
                .phone("555-0233")
                .email("elena@transitops.com")
                .status(DriverStatus.AVAILABLE)
                .safetyScore(92)
                .build();
        driver = driverRepository.save(driver);

        mockMvc.perform(get("/drivers/" + driver.getId() + "/availability")
                        .with(SecurityMockMvcRequestPostProcessors.user(generalUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(true)));
    }

    @Test
    public void testDeleteDriverOnTripForbidden() throws Exception {
        Driver driver = Driver.builder()
                .fullName("On Trip Driver")
                .employeeId("EMP-3")
                .licenseNumber("CDL-TRIP")
                .licenseCategory("HMV")
                .licenseExpiryDate(LocalDate.now().plusYears(1))
                .phone("1111111111")
                .email("ontrip@transitops.com")
                .status(DriverStatus.ON_TRIP)
                .safetyScore(88)
                .build();
        driver = driverRepository.save(driver);

        mockMvc.perform(delete("/drivers/" + driver.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(safetyOfficerPrincipal)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Cannot delete driver who is currently on a trip")));
    }
}
