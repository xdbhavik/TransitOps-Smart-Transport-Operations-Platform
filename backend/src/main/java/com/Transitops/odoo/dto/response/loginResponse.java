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
public class loginResponse {

	private String token;

	private String userId;

	private String email;

	private RoleName roleName;

	private String message;
}
