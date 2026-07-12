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
public class loginRequest {

	private String email;

	private String password;

	private RoleName roleName;
}
