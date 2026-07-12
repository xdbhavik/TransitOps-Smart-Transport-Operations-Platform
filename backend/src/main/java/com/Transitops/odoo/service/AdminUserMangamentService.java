package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.registerRequest;
import com.Transitops.odoo.dto.response.RegisterResponse;
import com.Transitops.odoo.entity.User;
import com.Transitops.odoo.enums.UserStatus;

import java.util.List;
import java.util.Optional;

public interface AdminUserMangamentService {

    RegisterResponse createUser(registerRequest request);

    List<User> getAllUsers();

    Optional<User> getUserById(String userId);

    User updateUserStatus(String userId, UserStatus status);

    void deleteUser(String userId);
}