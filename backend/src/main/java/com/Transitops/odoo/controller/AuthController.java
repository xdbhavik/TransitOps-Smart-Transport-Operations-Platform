package com.Transitops.odoo.controller;

import com.Transitops.odoo.dto.request.loginRequest;
import com.Transitops.odoo.dto.request.registerRequest;
import com.Transitops.odoo.dto.response.RegisterResponse;
import com.Transitops.odoo.dto.response.loginResponse;
import com.Transitops.odoo.entity.Role;
import com.Transitops.odoo.entity.User;
import com.Transitops.odoo.enums.RoleName;
import com.Transitops.odoo.enums.UserStatus;
import com.Transitops.odoo.repository.RoleRepository;
import com.Transitops.odoo.repository.UserRepository;
import com.Transitops.odoo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody registerRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new RegisterResponse(null, null, null, request.getEmail(), request.getPhone(), request.getRoleName(), "Email already exists"));
        }

        Role role = roleRepository.findByRoleName(request.getRoleName())
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(request.getRoleName()).build()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(new com.Transitops.odoo.security.UserPrincipal(savedUser));

        RegisterResponse response = new RegisterResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole().getRoleName(),
                "Register successful"
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<loginResponse> login(@RequestBody loginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        if (request.getRoleName() != null && user.getRole().getRoleName() != request.getRoleName()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new loginResponse(null, null, request.getEmail(), request.getRoleName(), "Role mismatch"));
        }

        String token = jwtService.generateToken(new com.Transitops.odoo.security.UserPrincipal(user));

        loginResponse response = new loginResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole().getRoleName(),
                "Login successful"
        );

        return ResponseEntity.ok(response);
    }
}