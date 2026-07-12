package com.Transitops.odoo.dto.request;

import com.Transitops.odoo.enums.RoleName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class registerRequest {

    private String fullName;

    private String email;

    private String password;

    private String phone;

    private RoleName roleName;
}