package com.Transitops.odoo.dto.response;

import com.Transitops.odoo.enums.RoleName;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {

	private String token;

	private String userId;

	private String fullName;

	private String email;

	private String phone;

	private RoleName roleName;

	private String message;
}
