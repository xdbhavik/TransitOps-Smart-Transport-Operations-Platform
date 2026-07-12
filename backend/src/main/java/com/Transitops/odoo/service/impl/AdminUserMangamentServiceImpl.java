package com.Transitops.odoo.service.impl;

import com.Transitops.odoo.dto.request.registerRequest;
import com.Transitops.odoo.dto.response.RegisterResponse;
import com.Transitops.odoo.entity.Role;
import com.Transitops.odoo.entity.User;
import com.Transitops.odoo.enums.RoleName;
import com.Transitops.odoo.enums.UserStatus;
import com.Transitops.odoo.repository.RoleRepository;
import com.Transitops.odoo.repository.UserRepository;
import com.Transitops.odoo.service.AdminUserMangamentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminUserMangamentServiceImpl implements AdminUserMangamentService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public RegisterResponse createUser(registerRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new RegisterResponse(null, null, null, request.getEmail(), request.getPhone(), request.getRoleName(), "Email already exists");
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

        return new RegisterResponse(
                null,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole().getRoleName(),
                "User created successfully"
        );
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public User updateUserStatus(String userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(userId);
    }
}