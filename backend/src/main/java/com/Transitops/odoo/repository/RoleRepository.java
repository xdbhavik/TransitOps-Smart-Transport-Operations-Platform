package com.Transitops.odoo.repository;

import com.Transitops.odoo.entity.Role;
import com.Transitops.odoo.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

	Optional<Role> findByRoleName(RoleName roleName);
}